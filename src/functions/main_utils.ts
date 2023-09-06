import { TweetType } from "@/types";
import { Scraper } from "@the-convocation/twitter-scraper";
import { ipcMain, shell } from "electron";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";
import { APP_DATA_PATH, exportTweetFromScraper } from "./general_utils";
import { app } from "electron";

const scraper = new Scraper();
const MEDIA_PLACEHOLDER = path.join(app.getAppPath(), "public", "images", "image_not_available.png");

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
            if (response.statusCode === 403)
            {
                //403 error seems to occur when the corresponding tweet has been deleted
                //we should really only get this when trying to get media from a direct retweet that has been deleted.
                //In this case, we copy the placeholder image to the save_path and return that url
                const placeholder_copy_to = path.join(media_folder, path.basename(MEDIA_PLACEHOLDER));
                fs.copyFile(MEDIA_PLACEHOLDER, placeholder_copy_to, (err) => 
                {
                    if(err)
                    {
                        resolve(null);
                        return;
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
                reject(null);
            });
        }).on('error', (err) => {
            reject(null);
        });
    });
}
ipcMain.on("try-get-media", async (event, media_url, save_path) => {
    const success = await get_media(media_url, save_path);
    event.reply('media-return', success);
});

/**
 * Tries to get Tweet data from the scraper library.
 * @param tweet_id The ID of the tweet to get.
 * @returns A promise that resolves to a TweetType object if the tweet was found, null if the tweet was not found, or undefined if there was an error.
 */
export async function get_tweet(tweet_id: string) : Promise<TweetType | null | undefined>
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
        return;
    }
    if(tweet === null)
    {
        return null;
    }

    return exportTweetFromScraper(tweet);
}
ipcMain.on("try-get-tweet", async (event, tweet_id) => {
    const tweet = await get_tweet(tweet_id);
    event.reply('tweet-return', tweet);
});


ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
  });