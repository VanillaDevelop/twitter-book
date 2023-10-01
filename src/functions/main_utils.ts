/**
 * Utility functions that are used in the main process. These functions are generally called via IPC from the renderer process.
 */
import { AuthorData, TweetItemType, TweetMediaType } from "@/types";
import { Scraper } from "@the-convocation/twitter-scraper";
import { ipcMain, shell, app} from "electron";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import { APP_DATA_PATH, exportTweetFromScraper } from "./general_utils";

let scraper = new Scraper();
const MEDIA_PLACEHOLDER = path.join(app.getAppPath(), "public", "images", "image_not_available.png");

/**
 * Resets the scraper library to a new instance.
 */
export function reset_scraper()
{
    scraper = new Scraper();
}
ipcMain.on("reset-scraper", (event) => {
    reset_scraper();
    event.reply('scraper-reset');
});

/**
 * Get author data from the scraper library.
 * @param handle The author's handle.
 * @returns A promise that resolves to an AuthorData object if the author was found, null if an error occurred.
 */
export async function get_profile(handle: string) : Promise<AuthorData | null>
{
    try
    {
        const profile = await scraper.getProfile(handle);

        return {
            id: profile.userId!,
            display_name: profile.name!,
            handle: handle,
            profile_image: profile.avatar ? {
                external_url: profile.avatar,
                type: "photo"
            } as TweetMediaType : undefined,
            banner: profile.banner ? {
                external_url: profile.banner,
                type: "photo"
            } as TweetMediaType : undefined
        };
    }
    catch(error: any)
    {
        if(error.message === "rest_id not found.")
        {
            //This error occurs when the user was banned
            return {
                id: "0",
                display_name: "Banned User",
                handle: handle
            }
        }
        else
        {
            return null;
        }
    }
}
ipcMain.on("try-get-author", (event, handle) => {
     get_profile(handle).then(reply => {
        event.reply('author-return', reply);
    });
});


/**
 * Tries to store an image from an external URL to the local file system.
 * @param web_url The URL of the image to store.
 * @param uuid The UUID of the user for which the image is stored.
 * @returns A promise that resolves to a string containing the file name in the media folder if the image was stored, or null if there was an error.
 */
export async function get_media(web_url: string, uuid: string) : Promise<string | null>
{
    const media_folder = path.join(APP_DATA_PATH, uuid, "structured_data", "media");

    return new Promise((resolve, reject) => 
    {
        const parsedUrl = new URL(web_url);
        const httpModule = parsedUrl.protocol === 'https:' ? https : http;

        httpModule.get(web_url, (response) => 
        {
            if (response.statusCode === 403 || response.statusCode === 404)
            {
                //403 error seems to occur when the corresponding tweet has been deleted
                //we should really only get this when trying to get media from a direct retweet that has been deleted.
                //404 error seems to occur in some circumstances where the URL does not directly match (but is not a general error)
                //In these cases, we copy the placeholder image to the save_path and return that url
                const placeholder_copy_to = path.join(media_folder, path.basename(MEDIA_PLACEHOLDER));
                fs.copyFile(MEDIA_PLACEHOLDER, placeholder_copy_to, (err) => 
                {
                    if(err)
                    {
                        resolve(null);
                    }
                });
                resolve(path.basename(MEDIA_PLACEHOLDER));
                return;
            }
            else if (response.statusCode !== 200) 
            {
                resolve(null);
                return;
            }

            //on successful response, pipe the response to a file stream
            const file_name = path.basename(parsedUrl.pathname);
            const fileStream = fs.createWriteStream(path.join(media_folder, file_name));
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve(file_name);
            });

            fileStream.on('error', (err) => {
                fs.unlink(path.join(media_folder, file_name), () => {});
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}
ipcMain.on("try-get-media", (event, web_url, uuid) => {
    get_media(web_url, uuid).then((reply) => {
        event.reply('media-return', reply);
    })
});

/**
 * Tries to get Tweet data from the scraper library.
 * @param tweet_id The ID of the tweet to get.
 * @returns A promise that resolves to a TweetItemType object if the tweet was found, or null if there was an error.
 */
export async function get_tweet(tweet_id: string) : Promise<TweetItemType | null >
{
    let tweet;
    try
    {
        tweet = await scraper.getTweet(tweet_id);
    }
    catch(e)
    {
        console.error(e);
    }

    if(tweet === undefined)
    {
        return null;
    }
    if(tweet === null)
    {
        return {
            id: tweet_id,
            item: null
        } as TweetItemType;
    }

    return exportTweetFromScraper(tweet);
}
ipcMain.on("try-get-tweet", (event, tweet_id) => {
    get_tweet(tweet_id).then(reply => {
        event.reply('tweet-return', reply);
    });
});


ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
  });