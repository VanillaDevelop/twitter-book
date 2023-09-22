import fs from "fs";
import path from "path";
import os from "os";
import JSZip from "jszip";
import { ArchiveTweetType, DataProfileType, MediaType, TweetItemType, TweetMediaType } from "../types"
import { Tweet } from "@the-convocation/twitter-scraper";

export const APP_DATA_PATH = path.join(os.homedir(), "AppData", "Roaming", "TwitterBook");
export const LONG_TWEET_URL_REGEX = /https?:\/\/twitter.com\/[a-zA-Z0-9_]+\/status\/([0-9]+)/;
export const SHORTENED_URL_REGEX = /https?:\/\/t.co\/[a-zA-Z0-9]+/; 
export const RT_REGEX = /RT @([a-zA-Z0-9_]+):?/;

/**
 * Parses a twitter archive data file to a Javascript object.
 * @param file_path The path to the twitter archive data file.
 * @param enclosing The enclosing characters of the archive file (e.g., {} for objects, and [] for arrays)
 * @returns A Javascript object containing the data from the twitter archive data file.
 */
export function getDataFromTwitterFile(file_path: string, enclosing: string) : any
{    
    const data = fs.readFileSync(file_path, "utf-8");
    return getDataFromTwitterFileString(data, enclosing);
}

/**
 * Parses the content of a twitter archive data file to a Javascript object.
 * @param file_string The content of the twitter archive data file.
 * @param enclosing The enclosing characters of the archive file (e.g., {} for objects, and [] for arrays)
 * @returns A Javascript object containing the data from the twitter archive data file.
 */
export function getDataFromTwitterFileString(file_string: string, enclosing: string) : any
{
    return JSON.parse(file_string.substring(file_string.indexOf(enclosing[0]), file_string.lastIndexOf(enclosing[1]) + 1));;
}

/**
 * Cleans the tweet text by removing superfluous information.
 * @param tweet_text The original tweet text.
 * @returns The cleaned tweet text.
 */
export function cleanTweetText(tweet_text: string, urls: string[]) : {text: string, urls: string[]}
{
    let text = tweet_text;
    //remove leading RT @username if it exists and trim
    text = text.replace(RT_REGEX, "")
    //trim whitespaces
    text = text.trim();
    //iteratively remove URLs at the end of the tweet
    const url_end_of_tweet = new RegExp(SHORTENED_URL_REGEX.source + "$");
    do
    {
        //remove URL at the end of the tweet
        text = text.replace(url_end_of_tweet, "").trim();
    }
    while(url_end_of_tweet.test(text));
    //trim whitespaces
    text = text.trim();
    //replace URLs in the middle of the tweet with the corresponding index in the urls array
    let url_index = 0;
    while(SHORTENED_URL_REGEX.test(text))
    {
        text = text.replace(SHORTENED_URL_REGEX, urls[url_index]);
        url_index++;
    }

    return {text, urls: urls.slice(url_index, urls.length)};
}

/**
 * Unzips a file to a specified output path.
 * @param file The file to unzip (must be a zip file)
 * @param output_path The root directory to unzip the file to.
 * @returns A promise that resolves to true if the file was unzipped successfully, false if there was an error.
 */
export async function unzipFile(file: File, output_path: string) : Promise<boolean>
{
    return new Promise<boolean>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try 
            {
                //generate root outputfolder if it doesn't exist
                if (!fs.existsSync(output_path)) 
                {
                    fs.mkdirSync(output_path);
                }

                const zip = await JSZip.loadAsync(reader.result as ArrayBuffer);

                const promises = [] as Promise<void>[];
                zip.forEach((relativePath, zipEntry) => {
                    if (!zipEntry.dir) 
                    {
                        const promise = zipEntry.async("nodebuffer").then(content => {
                            const directoryPath = path.join(output_path, path.dirname(relativePath));
                            if (!fs.existsSync(directoryPath)) 
                            {
                                fs.mkdirSync(directoryPath, { recursive: true });
                            }
                            const filePath = path.join(directoryPath, path.basename(relativePath));
                            fs.writeFileSync(filePath, content);
                        });
                        promises.push(promise);
                    }
                });
                await Promise.all(promises);
                resolve(true);
            }
            catch(e)
            {
                //clean up the output folder if it exists
                if (fs.existsSync(output_path))
                {
                    fs.rmdirSync(output_path, { recursive: true });
                }
                resolve(false);
            }
        };

        reader.readAsArrayBuffer(file);
    });
} 

/**
 * Utility function that wraps a UUID and twitter handle into a DataProfileType object
 * @param uuid The internal UUID of the profile
 * @param twitter_handle The user's Twitter handle
 * @returns A DataProfileType object containing the information and default values.
 */
export function createNewProfile(uuid: string, twitter_handle: string) : DataProfileType
{
    return {
        uuid: uuid,
        twitter_handle: twitter_handle,
        is_setup: false
    };
}

/**
 * Maps a tweet from the archive data (ArchiveTweetType) to an internal tweet object (TweetType)
 * @param twitter_archive_tweet The tweet object from the archive data.
 * @param author_handle The handle of the author of the tweet.
 * @returns A TweetItemType object containing the same information.
 */
export function exportTweetFromTwitterArchive(twitter_archive_tweet: ArchiveTweetType, author_handle: string) : TweetItemType
{
    let parent_tweet_id = undefined;
    let direct_rt_author_handle = undefined;
    let qrt_tweet_source_id = undefined;
    
    //attach all (non-media) URL destinations
    let urls = twitter_archive_tweet.tweet.entities.urls.map((urlObj) => urlObj.expanded_url);

    //pure retweet always starts with RT @
    if(twitter_archive_tweet.tweet.full_text.startsWith("RT @"))
    {
        //original author is always the first user mention in a pure retweet
        direct_rt_author_handle = twitter_archive_tweet.tweet.entities.user_mentions[0].screen_name
    }

    //quote retweet has a url entity at the end that links to a tweet (I think, I don't really know how else to tell)        
    //this now also matches tweet URLs in the middle of text technically but idk who the f-ck would do that so
    if(urls.length > 0 && LONG_TWEET_URL_REGEX.test(urls[urls.length - 1]))
    {
        const last_url = urls.pop()!
        qrt_tweet_source_id = last_url.match(LONG_TWEET_URL_REGEX)![1]
        //remove the short url from the tweet text, otherwise whacky things happen...
        const short_url = twitter_archive_tweet.tweet.entities.urls.find((urlObj) => urlObj.expanded_url === last_url)!.url
        twitter_archive_tweet.tweet.full_text = twitter_archive_tweet.tweet.full_text.replace(short_url, "").trim();
    }

    //reply tweets will have a in_reply_to_status_id and in_reply_to_user_id_str field
    if(twitter_archive_tweet.tweet.in_reply_to_status_id_str)
    {
        //set parent tweet id
        parent_tweet_id = twitter_archive_tweet.tweet.in_reply_to_status_id_str;
    }

    //we take media data from the extended entities
    let media = [] as TweetMediaType[];
    if(twitter_archive_tweet.tweet.extended_entities)
    {
        //only store when the string exists as a media type
        media = twitter_archive_tweet.tweet.extended_entities.media.filter((mediaObj : any) => Object.values(MediaType).includes(mediaObj.type))
        .map((mediaObj : any) => 
        {
            return {
                external_url: mediaObj.media_url_https,
                type: mediaObj.type as MediaType
            } as TweetMediaType;
        });
    }

    const {text: cleaned_text, urls: cleaned_urls} = cleanTweetText(twitter_archive_tweet.tweet.full_text, urls);

    return {
        id: twitter_archive_tweet.tweet.id_str,
        item: 
        {
            text: cleaned_text,
            created_at: new Date(twitter_archive_tweet.tweet.created_at),
            author_handle: author_handle,
            parent_tweet_id,
            direct_rt_author_handle,
            qrt_tweet_source_id,
            media,
            urls: cleaned_urls,
        } 
    }as TweetItemType;
}

/**
 * Maps a tweet from the scraper library (Tweet) to an internal tweet object (TweetType)
 * @param tweet The tweet object from the scraper library.
 * @returns A TweetItemType object containing the same information.
 */
export function exportTweetFromScraper(tweet: Tweet) : TweetItemType
{
    //library does not have gifs yet, so we can only convert videos and photos
    let media = [] as TweetMediaType[];
    tweet.videos.forEach(video => {
        media.push({
            type: MediaType.Video,
            external_url: video.preview
        } as TweetMediaType)
    })

    tweet.photos.forEach(photo => {
        media.push({
            type: MediaType.Photo,
            external_url: photo.url
        } as TweetMediaType)
    })

    const urls = tweet.urls

    const {text: cleaned_text, urls: cleaned_urls} = cleanTweetText(tweet.text ?? "", urls);
    const tweet_data = {
        id: tweet.id,
        item: {
            text: cleaned_text,
            created_at: new Date(tweet.timestamp! * 1000),
            author_handle: tweet.username,
            parent_tweet_id: tweet.inReplyToStatusId,
            qrt_tweet_source_id: tweet.quotedStatusId,
            //retweet should not be possible (retweet of a retweet? but who cares, we can make an edge case for it)
            direct_rt_author_handle: tweet.retweetedStatus?.username,
            media,
            urls: cleaned_urls
        }
     } as TweetItemType;

    return tweet_data;
}

/**
 * Helper function that implements a reviver function for JSON.parse that converts all date strings to Date objects.
 * @param file_path The path to the file containing the tweets.
 * @returns An array of collected tweets.
 */
export function loadTweets(file_path: string) : TweetItemType[]
{
    function reviver(key: string, value: any) {
        if (key === "created_at" && typeof value === "string") {
          return new Date(value);
        }
        return value;
      }
    const tweets = JSON.parse(fs.readFileSync(file_path, "utf-8"), reviver)
    return tweets;
}