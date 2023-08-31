import { AuthorData, MediaType, TweetMediaType, TweetType, URLResolve } from "@/types";
import { Profile, Scraper } from "@the-convocation/twitter-scraper";
import { app, ipcMain, shell } from "electron";
import url from "url";
import http from "http";
import https from "https";
import path from "path";
import fs from "fs";

const scraper = new Scraper();
const placeholder_path = path.join(app.getAppPath(), "public", "images", "image_not_available.png");


export async function get_image(file_url: string, save_path: string) : Promise<"stored" | "removed" | "error">
{
    return new Promise((resolve, reject) => {
        const parsedUrl = url.parse(file_url);
        const httpModule = parsedUrl.protocol === 'https:' ? https : http;

        httpModule.get(file_url, (response) => {
            if (response.statusCode === 403)
            {
                //403 error seems to occur when the corresponding tweet has been deleted
                //we should really only get this when trying to get media from a direct retweet that has been deleted.
                //In this case, we copy the placeholder image to the save_path, changing the file extension if necessary, and return "removed" 
                const file_extension = path.extname(save_path);
                const placeholder_copy_to = save_path.replace(file_extension, ".png");
                fs.copyFile(placeholder_path, placeholder_copy_to, (err) => {
                    if(err)
                    {
                        reject(err.message);
                        return;
                    }
                });
                resolve("removed");
                return;
            }
            else if (response.statusCode !== 200) 
            {
                resolve("error");
                return;
            }

            const fileStream = fs.createWriteStream(save_path);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve("stored");
            });

            fileStream.on('error', (err) => {
                fs.unlink(save_path, () => {});
                reject(err.message);
            });
        }).on('error', (err) => {
            reject(err.message);
        });
    });
}

export async function get_tweet(tweet_id: string) : Promise<{author: AuthorData, tweet: TweetType} | null | undefined>
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


    //library does not have gifs yet :( it is what it is
    let media = [] as TweetMediaType[] | undefined;
    tweet.videos.forEach(video => {
        media!.push({
            type: "VIDEO" as MediaType,
            external_url: video.preview
        } as TweetMediaType)
    })

    tweet.photos.forEach(photo => {
        media!.push({
            type: "PHOTO" as MediaType,
            external_url: photo.url
        } as TweetMediaType)
    })

    if(media!.length == 0) media = undefined;

    let urls : URLResolve[] | undefined;
    if(tweet.urls.length > 0)
    {
        urls = [];
        //we have to manually capture shortened URLs, as the library only has the long versions
        const tco_regex = /https?:\/\/t.co\/[a-zA-Z0-9]+/g;
        //capture all instances
        const tco_matches = tweet.text!.match(tco_regex);
        //create URLResolve objects for each
        for(let i = 0; i < tweet.urls.length; i++)
        {
            urls!.push({
                shortened_url: tco_matches![i],
                resolved_url: tweet.urls[i]
            })
        }
    }

    const tweet_data = {
        id: tweet.id,
        text: tweet.text,
        created_at: new Date(tweet.timestamp!),
        parent_tweet_id: tweet.inReplyToStatusId,
        qrt_tweet_source_id: tweet.quotedStatusId,
        //retweet should not be possible (retweet of a retweet? but who cares, we can make an edge case for it)
        retweet_source_id: tweet.retweetedStatusId,
        media,
        urls
    } as TweetType;

    const author_data = {
        id: tweet.userId,
        handle: tweet.username,
        display_name: tweet.name,
    } as AuthorData;

    return {
        author: author_data,
        tweet: tweet_data
    }
}

export async function get_user_profile(username : string) : Promise<Profile>
{
    const user = await scraper.getProfile(username);
    return user;
}

ipcMain.on("try-get-tweet", async (event, tweet_id) => {
  const tweet = await get_tweet(tweet_id);
  event.reply('tweet-return', tweet);
});

ipcMain.on('open-external-link', (event, url) => {
    shell.openExternal(url);
  });

ipcMain.on("try-get-media", async (event, media_url, save_path) => {
    const success = await get_image(media_url, save_path);
    event.reply('media-return', success);
});