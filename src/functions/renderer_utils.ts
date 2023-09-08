import JSZip from "jszip";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { ArchiveTweetType, AuthorData, DataProfileType, TweetChainType, TweetMediaType, TweetType } from "@/types";
import path from "path";
import { ipcRenderer } from "electron";
import { getDataFromTwitterFile, APP_DATA_PATH, unzipFile, getDataFromTwitterFileString, createNewProfile, exportTweetFromTwitterArchive, loadTweets } from "./general_utils";

/**
 * Checks if the provided file appears to be a Twitter archive file.
 * @param file The file to check.
 * @returns A promise that resolves to an object containing a boolean indicating if the file is a Twitter archive file 
 * and a string containing an error message if the file is not a Twitter archive file, and the user's handle otherwise.
 */
export async function isValidTwitterFile(file: File) : Promise<{valid: boolean, value: string}>
{
    //Get file name, capped at 15 characters
    const file_name = file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name;

    //Check if file is a zip file
    if(file.type !== "application/x-zip-compressed")
    {
        return {valid: false, value: `File ${file_name} is not a zip file.`}
    }

    //Check if file contains data/account.js
    const zip = await JSZip.loadAsync(file);
    if (!zip.file("data/account.js")) 
    {
        return {valid: false, value: `File ${file_name} is not a Twitter archive file.`};
    }

    try 
    {
        //if we can parse the account.js file properly, return the Twitter handle
        const account_file = zip.file("data/account.js");
        const account_data = await account_file!.async("string").then((data: string) => getDataFromTwitterFileString(data, "{}"));
        const twitter_handle = account_data.account.username;
        return {valid: true, value: twitter_handle};
    }
    catch (error) 
    {
        return {valid: false, value: `File ${file_name} is not a Twitter archive file.`};
    }
}

/**
 * Try to unpack a Twitter archive file.
 * @param file The Twitter archive file (.zip), should be checked with isValidTwitterFile first.
 * @returns A promise that resolves to a DataProfileType object if the file was unpacked successfully, undefined otherwise.
 */
export async function tryAddProfile(file: File) : Promise<DataProfileType | undefined>
{  
    //generate random uuid for the dataprofile
    const uuid = uuidv4();

    const unpacked = await unzipFile(file, path.join(APP_DATA_PATH, uuid));

    if(!unpacked)
    {
        return;
    }

    //extract the twitter handle
    const account_data = getDataFromTwitterFile(path.join(APP_DATA_PATH, uuid, "data", "account.js"), "{}");
    const twitter_handle = account_data.account.username;

    //If we made it here, create the initial folder structure
    const structured_data_folder = path.join(APP_DATA_PATH, uuid, "structured_data");
    if (!fs.existsSync(structured_data_folder))
        fs.mkdirSync(structured_data_folder);

    //return a DataProfileType object for this user
    return createNewProfile(uuid, twitter_handle);
}

/**
 * Map the Twitter archive tweets into a more structured format.
 * @param uuid The UUID of the profile to index. The archive must have been extracted for this user.
 * @param author_handle The Twitter handle of the user to index.
 */
export function indexTweetsFromProfile(uuid: string, author_handle: string) : void
{
    //if we already have the tweets file, this step should already be taken care of (it's fast, so should not have any intermediate errors)
    if(fs.existsSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json")))
        return;

    //load tweets from tweets.js and restructure them
    const tweet_data = getDataFromTwitterFile(path.join(APP_DATA_PATH, uuid, "data", "tweets.js"), "[]");
    const tweets_internal = tweet_data.map(
        (tweet: ArchiveTweetType) => {
            const internal_tweet = exportTweetFromTwitterArchive(tweet, author_handle);
            //turn each tweet into a standalone tweet chain
            return [internal_tweet] as TweetChainType;
        }
    )

    //write tweets.json
    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"), JSON.stringify(tweets_internal));
}

/**
 * Build tweet chains for the provided user.
 * @param uuid The UUID of the user to scrape tweets for. The tweets must have been indexed for this user.
 * @returns True if the tweet chains were built successfully, false if an error occurred.
 */
export async function BuildTweetChains(uuid: string) : Promise<boolean>
{
    //Load tweets for this user
    let tweets = loadTweets(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"))
    //Sort tweet chains by the date of the first tweet - this tweet can never be null
    tweets.sort((a, b) => (b[0]!.created_at.getTime() - a[0]!.created_at.getTime()));
    
    for(let i = 0; i < tweets.length; i++)
    {
        let last_tweet = tweets[i][tweets[i].length - 1];
        while(last_tweet !== null && (last_tweet.qrt_tweet_source_id || last_tweet.parent_tweet_id))
        {
            let next_tweet;
            if(last_tweet.qrt_tweet_source_id)
            {
                next_tweet = await getTweetById(last_tweet.qrt_tweet_source_id);
            }
            else if(last_tweet.parent_tweet_id)
            {
                next_tweet = await getTweetById(last_tweet.parent_tweet_id);
            }
            if (next_tweet === undefined)
            {
                //an error occured
                fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"), JSON.stringify(tweets));
                return false;
            }
            else
            {
                //null = deleted, Tweet = successfully returned, in either case we append it to the chain
                tweets[i].push(next_tweet);
                last_tweet = next_tweet;

                if(last_tweet !== null)
                {
                    //check if this tweet is the root of an older chain and delete those chains from the tweets array
                    tweets = tweets.filter((chain) => chain[0]!.id !== last_tweet!.id);
                }
            }
        }
    }

    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"), JSON.stringify(tweets));
    return true;
}

/**
 * Collect media for the provided user.
 * @param uuid The UUID of the user to collect media for. The tweet chains must have been built for this user.
 * @returns True if the media was collected successfully, false if an error occurred.
 */
export async function collectMedia(uuid: string) : Promise<boolean>
{
    const folder = path.join(APP_DATA_PATH, uuid, "structured_data", "media");

    //create path if it doesn't exist
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder);

    let tweets = loadTweets(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"))

    for (let i = 0; i < tweets.length; i++) 
    {
        for (let j = 0; j < tweets[i].length; j++) 
        {
            let tweet = tweets[i][j];
            if(tweet === null) continue;
            if(!tweet.media) continue;
            
            for (let k = 0; k < tweet.media.length; k++) 
            {
                let media = tweet.media[k];
                if(media.internal_name) continue;

                const internal_name = await getImageByUrl(media.external_url, uuid);
                if(internal_name === null)
                {
                    //an error occured
                    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"), JSON.stringify(tweets));
                    return false;
                }
                else
                {
                    media.internal_name = internal_name;
                }
            }
        }
    }

    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"), JSON.stringify(tweets));
    return true;
}

/**
 * Collect author data for all authors involved with the provided user.
 * @param uuid The UUID of the user to collect author data for. The tweet chains must have been built for this user.
 * @returns True if all authors were collected successfully, false if an error occurred.
 */
export async function collectAuthors(uuid: string) : Promise<boolean>
{
    const author_data_path = path.join(APP_DATA_PATH, uuid, "structured_data", "authors.json");

    //if we already have some author data, load it
    let author_data = (fs.existsSync(author_data_path) ? JSON.parse(fs.readFileSync(author_data_path, "utf-8")) : []) as AuthorData[];
    const tweets = loadTweets(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets.json"))
    //Get all unique author handles from the tweets
    const flattened_tweets = tweets.flat();
    const author_handles = flattened_tweets.filter((tweet) => tweet !== null).map((tweet) => tweet!.author_handle)

    for (let i = 0; i < author_handles.length; i++) 
    {
        //check if we already have data for this author
        const author_exists = author_data.find((author) => author.handle === author_handles[i]);
        if(author_exists) continue;
        //otherwise get the data and append it
        const author = await getAuthorByHandle(author_handles[i]);
        if(!author)
        {
            //an error occured
            fs.writeFileSync(author_data_path, JSON.stringify(author_data));
            return false;
        }
        else
        {
            author_data.push(author);
        }
    }

    fs.writeFileSync(author_data_path, JSON.stringify(author_data));
    return true;
}

/**
 * Collect author media (profile pictures and banners) for all authors involved with the provided user.
 * @param uuid The UUID of the user to collect author data for. Authors must have been collected for this user.
 * @returns True if all media was collected successfully, false if an error occurred.
 */
export async function collectAuthorMedia(uuid: string) : Promise<boolean>
{
    const author_data_path = path.join(APP_DATA_PATH, uuid, "structured_data", "authors.json");
    let author_data = JSON.parse(fs.readFileSync(author_data_path, "utf-8")) as AuthorData[];

    for (let i = 0; i < author_data.length; i++) 
    {
        //check if we need to collect the profile picture
        if(author_data[i].profile_image && !author_data[i].profile_image!.internal_name)
        {
            const internal_name = await getImageByUrl(author_data[i].profile_image!.external_url, uuid);
            if(internal_name === null)
            {
                //an error occured
                fs.writeFileSync(author_data_path, JSON.stringify(author_data));
                return false;
            }
            else
            {
                author_data[i].profile_image!.internal_name = internal_name;
            }
        }
        //check if we need to collect the banner
        if(author_data[i].banner && !author_data[i].banner!.internal_name)
        {
            const internal_name = await getImageByUrl(author_data[i].banner!.external_url, uuid);
            if(internal_name === null)
            {
                //an error occured
                fs.writeFileSync(author_data_path, JSON.stringify(author_data));
                return false;
            }
            else
            {
                author_data[i].banner!.internal_name = internal_name;
            }
        }
    }

    fs.writeFileSync(author_data_path, JSON.stringify(author_data));
    return true;
}

/**
 * Removes all files and folders associated with the archive. This should be the final step of the scraping process.
 * @param uuid The UUID of the user to clean up the directory for.
 */
export function cleanupDirectory(uuid: string)
{
    const user_dir = path.join(APP_DATA_PATH, uuid);
    fs.rmdirSync(path.join(user_dir, "assets"), {recursive: true});
    fs.rmdirSync(path.join(user_dir, "data"), {recursive: true});
    fs.rmSync(path.join(user_dir, "Your archive.html"));
}

/**
 * Make a request to the main process to get the tweet with the provided id.
 * @param tweet_id The ID of the tweet to get.
 * @returns A promise that resolves to a TweetType object if the tweet was found, null if the tweet was not found, or undefined if there was an error.
 */
export async function getTweetById(tweet_id: string) : Promise<TweetType | null | undefined>
{
    return new Promise((resolve, reject) => {
        ipcRenderer.once("tweet-return", (event, data : TweetType | null | undefined) => {
            resolve(data);
        });
        ipcRenderer.send("try-get-tweet", tweet_id);

        setTimeout(() => {
            reject("Timeout while trying to get tweet with id " + tweet_id);
        }
        , 10000);
    })
}

/**
 * Make a request to the main process to get author data for the provided handle.
 * @param handle The handle of the author to get.
 * @returns A promise that resolves to an AuthorData object if the author was found, or null if there was an error.
 */
export async function getAuthorByHandle(handle: string) : Promise<AuthorData | null>
{
    return new Promise((resolve, reject) => {
        ipcRenderer.once("author-return", (event, data : (AuthorData | null)) => {
            resolve(data);
        });
        ipcRenderer.send("try-get-author", handle);

        setTimeout(() => {
            reject("Timeout while trying to get author with handle " + handle);
        }
        , 10000);
    })
}

/**
 * Make a request to the main process to collect and store an image from the provided url.
 * @param url The url of the image to collect.
 * @param uuid The UUID of the user to collect the image for.
 * @returns A promise that resolves to the name of the image file if the image was collected successfully, or null if there was an error.
 */
export async function getImageByUrl(url: string, uuid: string) : Promise<string | null>
{
    return new Promise((resolve, reject) => {
        ipcRenderer.once("media-return", (event, success : (string | null)) => 
        {
            resolve(success);
        });
        ipcRenderer.send("try-get-media", url, uuid);

        setTimeout(() => {
            reject("Timeout while trying to get image from url " + url);
        }
        , 10000);
    })
}