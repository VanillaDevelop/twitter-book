import JSZip from "jszip";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
import { AuthorData, DataProfileContextType, DataProfileType, MediaType, QRTData, TweetMediaType, TweetType, URLResolve } from "@/types";
import path from "path";
import {APP_DATA_PATH} from "@/contexts/DataProfileContext";
import { ipcRenderer } from "electron";

export async function checkFileStructure(file: File, profiles: DataProfileType[]) : Promise<string | void>
{
    //Check if file is a zip file
    if(file.type !== "application/x-zip-compressed")
    {
        //cap file name at 15 characters
        const file_name = file.name.length > 15 ? file.name.substring(0, 15) + "..." : file.name;
        return `File ${file_name} is not a zip file. Please upload a Twitter data folder.`;
    }

    //Check if file contains data/account.js
    const zip = await JSZip.loadAsync(file);
    if (!zip.file("data/account.js")) 
    {
        return "The required file data/account.js does not exist in the ZIP. Are you sure this is a Twitter data folder?";
    }

    //Check if existing profiles contain the twitter handle
    try 
    {
        const account_file = zip.file("data/account.js");
        const account_json = JSON.parse(await account_file!.async("string").then(s => s.substring(s.indexOf("{"), s.lastIndexOf("}") + 1)));
        const twitter_handle = account_json.account.username;
        //if profiles contains the twitter handle, return error
        if(profiles.map(profile => profile.twitter_handle).includes(twitter_handle))
        {
            return `The Twitter handle ${twitter_handle} already has a data profile. Please delete the existing profile first.`;
        }
    }
    catch (error) 
    {
        return "Error while parsing data/account.js. Are you sure this is a Twitter data folder?";
    }
}

export async function unpackZipFile(file: File, profileContext: DataProfileContextType) 
    : Promise<boolean>
{  
    //generate random uuid for the dataprofile
    const uuid = uuidv4();

    // Wrap the reader logic in a Promise
    const unpacking = new Promise<void>(async (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try 
            {
                //generate folder for the dataprofile
                fs.mkdirSync(path.join(APP_DATA_PATH, uuid));
    
                const zip = await JSZip.loadAsync(reader.result as ArrayBuffer);

                const promises = [] as Promise<void>[];
                zip.forEach((relativePath, zipEntry) => {
                    if (!zipEntry.dir) 
                    {
                        const promise = zipEntry.async("nodebuffer").then(content => {
                            const directoryPath = path.join(APP_DATA_PATH, uuid, path.dirname(relativePath));
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
                resolve(); // Resolve the Promise when done
            } catch (error) {
                reject(error); // Reject the Promise if an error occurs
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // Await the resolution of the unpacking Promise
    try
    {
        await unpacking;
    }
    catch(e)
    {
        //clean up the directory 
        fs.rmdirSync(path.join(APP_DATA_PATH, uuid), {recursive: true});
        return false;
    }

    //try to extract a twitter handle, return false if not possible
    let twitter_handle : string;
    try
    {
        const account_file = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "data", "account.js"), "utf-8");
        const account_json = JSON.parse(account_file.substring(account_file.indexOf("{"), account_file.lastIndexOf("}") + 1));
        twitter_handle = account_json.account.username;
    }
    catch(e)
    {
        //clean up the directory
        fs.rmdirSync(path.join(APP_DATA_PATH, uuid), {recursive: true});
        return false;
    }

    //add the new dataprofile to the existing profiles
    const new_profile = create_new_profile(uuid, twitter_handle);
    const existing_profiles = profileContext.dataProfiles;
    profileContext.setDataProfiles([...existing_profiles, new_profile]);

    console.log("Successfully unpacked zip file for user " + twitter_handle + " with uuid " + uuid + ".")
    return true;
}

export function indexTweetsFromProfile(uuid: string) : void
{
    //if we already have the tweets directory, this step should already be taken care of (it's fast, so should not have any intermediate errors)
    if(fs.existsSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets")))
        return;

    //load tweets from tweets.js and restructure them
    const tweet_file = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "data", "tweets.js"), "utf-8");
    const tweet_json = JSON.parse(tweet_file.substring(tweet_file.indexOf("["), tweet_file.lastIndexOf("]") + 1));
    const tweetTypeArray = tweet_json.map((tweetObj : any) => 
    {
        let parent_tweet_id = undefined;
        let direct_rt_author_id = undefined;
        let qrt_tweet_source_id = undefined;
        let media = undefined;
        let urls = undefined;
        
        //resolve all (non-media) URLs
        urls = tweetObj.tweet.entities.urls.map((urlObj : any) => {
            return {
                shortened_url: urlObj.url,
                resolved_url: urlObj.expanded_url,
            } as URLResolve
        });
        if(urls.length == 0)
        {
            urls = undefined;
        }

        //pure retweet always starts with RT @
        if(tweetObj.tweet.full_text.startsWith("RT @"))
        {
            //original author is always the first user mention in a pure retweet
            direct_rt_author_id = tweetObj.tweet.entities.user_mentions[0].id_str
        }

        //quote retweet has a url entity at the end that links to a tweet (I think, I don't really know how else to tell)
        const tweet_url_regex = /https?:\/\/twitter.com\/[a-zA-Z0-9_]+\/status\/[0-9]+/;
        const tweet_url_shortened_regex = /https?:\/\/t.co\/[a-zA-Z0-9]+$/; //only detects shortened URLs at the end of the tweet
        
        if(tweet_url_shortened_regex.test(tweetObj.tweet.full_text) && urls)
        {
            //get the url
            const url = tweetObj.tweet.full_text.match(tweet_url_shortened_regex)![0];
            //check if it resolves to a tweet
            const last_url = urls.find((urlObj : any) => urlObj.shortened_url === url)
            if(last_url) // may be a media URL to skip if last_url is not found
            {
                const expanded_url = last_url.resolved_url
                if(tweet_url_regex.test(expanded_url))
                {
                    //set qrt data
                    qrt_tweet_source_id = expanded_url.match(/https?:\/\/twitter.com\/[a-zA-Z0-9_]+\/status\/([0-9]+)/)![1]
                }
                //remove url from urls
                urls = urls.filter((urlObj : any) => urlObj.shortened_url !== url);
                //set urls back to undefined if this was the only url
                if(urls.length == 0)
                {
                    urls = undefined;
                }
            }
        }

        //reply tweets will have a in_reply_to_status_id and in_reply_to_user_id_str field
        if(tweetObj.tweet.in_reply_to_status_id_str)
        {
            //set parent tweet id
            parent_tweet_id = tweetObj.tweet.in_reply_to_status_id_str;
        }

        //we take media data from the extended entities
        const media_type_map: {[key: string] : string} = {
            "photo": "PHOTO",
            "video": "VIDEO",
            "animated_gif": "GIF"
        }
        if(tweetObj.tweet.extended_entities)
        {
            //we only store photos, videos, and gifs
            media = tweetObj.tweet.extended_entities.media.filter((mediaObj : any) => media_type_map.hasOwnProperty(mediaObj.type))
                .map((mediaObj : any) => {
                return {
                    external_url: mediaObj.media_url_https,
                    type: media_type_map[mediaObj.type] as MediaType
                } as TweetMediaType;
            });
        }

        //remove any URLs from the tweet text and trim
        tweetObj.tweet.full_text = tweetObj.tweet.full_text.replace(tweet_url_shortened_regex, "").trim();
        //remove trailing RT @username if it exists and trim
        tweetObj.tweet.full_text = tweetObj.tweet.full_text.replace(/RT @([a-zA-Z0-9_]+):?/, "").trim();

        return {
            id: tweetObj.tweet.id_str,
            text: tweetObj.tweet.full_text,
            created_at: new Date(tweetObj.tweet.created_at),
            parent_tweet_id,
            direct_rt_author_id,
            qrt_tweet_source_id,
            media,
            urls
        } as TweetType;
    });

    //create tweets subdirectory
    fs.mkdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets"));

    tweetTypeArray.forEach((tweet : TweetType) => {
        //store the tweet to a file 
        fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet.id + ".json"), JSON.stringify(tweet));
    });
}

function create_new_profile(uuid: string, twitter_handle: string) : DataProfileType
{
    const new_profile = {
        uuid: uuid,
        twitter_handle: twitter_handle,
        is_setup: false
    };
    return new_profile;
}

export function bootstrapStructuredData(uuid: string) : void
{
    const folder = path.join(APP_DATA_PATH, uuid, "structured_data");
    if (fs.existsSync(folder))
        return;

    fs.mkdirSync(folder);
    //place banner and profile picture
    const profile_media_data = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "data", "profile.js"), "utf-8");
    const profile_media_json = JSON.parse(profile_media_data.substring(profile_media_data.indexOf("{"), profile_media_data.lastIndexOf("}") + 1));
    const avatar_suburl = profile_media_json.profile.avatarMediaUrl.substring(profile_media_json.profile.avatarMediaUrl.lastIndexOf("/") + 1);
    const banner_suburl = profile_media_json.profile.headerMediaUrl.substring(profile_media_json.profile.headerMediaUrl.lastIndexOf("/") + 1);
    //find in folder /data/profile_media, but the local file name has a random number prepended
    const avatar_file = fs.readdirSync(path.join(APP_DATA_PATH, uuid, "data", "profile_media")).find((file) => file.includes(avatar_suburl));
    const banner_file = fs.readdirSync(path.join(APP_DATA_PATH, uuid, "data", "profile_media")).find((file) => file.includes(banner_suburl));
    //copy into the structured data directory
    fs.copyFileSync(path.join(APP_DATA_PATH, uuid, "data", "profile_media", avatar_file!), path.join(APP_DATA_PATH, uuid, "structured_data", "avatar.jpg"));
    fs.copyFileSync(path.join(APP_DATA_PATH, uuid, "data", "profile_media", banner_file!), path.join(APP_DATA_PATH, uuid, "structured_data", "banner.jpg"));
    //create author subdirectory
    fs.mkdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "authors"));
    //create author data for self
    const account_data = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "data", "account.js"), "utf-8");
    const account_json = JSON.parse(account_data.substring(account_data.indexOf("{"), account_data.lastIndexOf("}") + 1));
    const self_author = {
        id: account_json.account.accountId,
        display_name: account_json.account.accountDisplayName,
        handle: account_json.account.username
    } as AuthorData
    fs.mkdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "authors", self_author.id));
    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "authors", self_author.id, "author.json"), JSON.stringify(self_author));
    fs.copyFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "avatar.jpg"), path.join(APP_DATA_PATH, uuid, "structured_data", "authors", self_author.id, "avatar.jpg"));
}

export async function collectQRTs(uuid: string) : Promise<number>
{
    //create or overwrite the file by iterating over all tweets and finding QRTs
    const tweets = fs.readdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets"));
    const tweets_json = tweets.map((tweet_file) => {
        const tweet = JSON.parse(fs.readFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_file), "utf-8")) as TweetType;
        return tweet;
    });
    const qrts = tweets_json.filter((tweet) => tweet.qrt_tweet_source_id).map((tweet) => tweet.qrt_tweet_source_id);
    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "qrt_index.json"), JSON.stringify({qrts}));

    //load the current state from the qrt_index file
    const qrt_index_data = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "qrt_index.json"), "utf-8"); 

    //for each QRT, check if we have the tweet, otherwise collect it
    const qrt_index_json = JSON.parse(qrt_index_data);

    //check the number of tweets we already have
    const tweets_count = qrt_index_json.qrts.filter((tweet_id : string) => fs.existsSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_id + ".json"))).length;

    //if the number of tweets is equal to the number of QRTs, we are done
    if(tweets_count == qrt_index_json.qrts.length)
    {
        return 0;
    }

    //return the number of new tweets successfully collected, or -1 if getTweets returned an error
    const success = await getTweets(qrt_index_json.qrts, uuid);
    if(success)
    {
        return tweets_count;
    }
    else
    {
        return -1;
    }
}

export async function CollectReplyTweets(uuid: string) : Promise<number>
{
    //create or overwrite the file by iterating over all current tweets and finding replies
    const tweets = fs.readdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets"));
    const tweets_json = tweets.map((tweet_file) => {
        const tweet = JSON.parse(fs.readFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_file), "utf-8")) as TweetType;
        return tweet;
    });
    const replies = tweets_json.filter((tweet) => tweet.parent_tweet_id).map((tweet) => tweet.parent_tweet_id);
    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "reply_index.json"), JSON.stringify({replies}));

    //load the current state from the reply_index file
    const reply_index_data = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "reply_index.json"), "utf-8"); 
    //for each reply, check if we have the tweet, otherwise collect it
    const reply_index_json = JSON.parse(reply_index_data);

    //check the number of tweets we already have
    const tweets_count = reply_index_json.replies.filter((tweet_id : string) => fs.existsSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_id + ".json"))).length;

    //if the number of tweets is equal to the number of QRTs, we are done
    if(tweets_count == reply_index_json.replies.length)
    {
        return 0;
    }

    //return the number of tweets successfully collected, or -1 if getTweets returned an error
    const success = await getTweets(reply_index_json.replies, uuid);
    if(success)
    {
        return tweets_count;
    }
    else
    {
        return -1;
    }
}


export async function collectMedia(uuid: string) : Promise<number>
{
    const folder = path.join(APP_DATA_PATH, uuid, "structured_data", "media");

    //create path if it doesn't exist
    if (!fs.existsSync(folder))
        fs.mkdirSync(folder);

    //create index of media files if it doesn't exist
    if (!fs.existsSync(path.join(APP_DATA_PATH, uuid, "structured_data", "media_index.json")))
    {
        const tweets = fs.readdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets"));
        const tweets_json = tweets.map((tweet_file) => {
            const tweet = JSON.parse(fs.readFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_file), "utf-8")) as TweetType;
            return tweet;
        });
        const media = tweets_json.filter((tweet) => tweet.media).map((tweet) => tweet.media!);
        //flatten array
        const flattened_media = ([] as TweetMediaType[]).concat.apply([], media).map((mediaObj) => mediaObj.external_url);
        fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "media_index.json"), JSON.stringify({media: flattened_media}));
    }

    //load the media_index file
    const media_index_data = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "media_index.json"), "utf-8"); 
    //for each image, check if we have the image, otherwise collect it
    const media_index_json = JSON.parse(media_index_data);
    const media_names = media_index_json.media.reduce((acc : {[key:string]: string}, media_url : string) => {
        acc[media_url] = media_url.substring(media_url.lastIndexOf("/") + 1);
        return acc;
    }, {});

    //check files in folder
    const media_files = fs.readdirSync(folder);

    //only keep the files in media_names that don't exist in the folder (with any extension)
    const filteredMedia = Object.keys(media_names).reduce((acc : {[key:string]: string}, media_url : string) => {
        const without_extension = media_names[media_url].split(".")[0];
        if (!media_files.some((media_file) => media_file.startsWith(without_extension))) {
          acc[media_url] = media_names[media_url];
        }
        return acc;
      }, {});

    //if the number of images is equal to the number of media, we are done
    if(Object.keys(filteredMedia).length == 0)
    {
        return 0;
    }

    //return the number of images successfully collected, or -1 if getImageByUrl returned an error
    const success = await collectAllMedia(filteredMedia, uuid);

    if(success)
    {
        return Object.keys(filteredMedia).length;
    }

    return -1;
}

//helper function for retrieving media one by one and returning false as soon as an error occurs
export async function collectAllMedia(media_names: {[key:string]: string}, uuid: string) : Promise<boolean>
{
    for(const media_url in media_names)
    {        
        const success = await getImageByUrl(media_url, path.join(APP_DATA_PATH, uuid, "structured_data", "media", media_names[media_url]));
        if(success === "error")
        {
            console.log("Failed to collect image with url " + media_url + ".")
            return false;
        }
    }
    return true;
}


//helper function for retrieving tweets one by one and returning false as soon as an error occurs
export async function getTweets(tweet_ids: string[], uuid: string) : Promise<boolean>
{
    for(const tweet_id of tweet_ids)
    {
        if(fs.existsSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_id + ".json")))
            continue;
        
        const data = await getTweetById(tweet_id);
        if(data === undefined)
        {
            console.log("Failed to collect tweet with id " + tweet_id + ".")
            return false;
        }
        else if(data === null)
        {
            writeRemovedTweet(tweet_id, uuid);
        }
        else
        {
            const {author, tweet} = data;

            //write tweet file
            fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet.id + ".json"), JSON.stringify(tweet));

            //check if we have the author
            if(!fs.existsSync(path.join(APP_DATA_PATH, uuid, "structured_data", "authors", author.id)))
            {
                //write author file
                fs.mkdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "authors", author.id));
                fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "authors", author.id, "author.json"), JSON.stringify(author));
            }
        }
    }
    return true;
}

export function loadAllUserTweets(uuid: string) : TweetType[]
{
    const tweets = fs.readdirSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets"));
    const tweets_json = tweets.map((tweet_file) => {
        const tweet = JSON.parse(fs.readFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_file), "utf-8")) as TweetType;
        return tweet;
    });
    return tweets_json.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function writeRemovedTweet(tweet_id: string, uuid: string)
{
    fs.writeFileSync(path.join(APP_DATA_PATH, uuid, "structured_data", "tweets", tweet_id + ".json"), JSON.stringify({removed: true}));
}

export async function getTweetById(tweet_id: string) : Promise<{author: AuthorData, tweet: TweetType} | null | undefined>
{
    return new Promise((resolve, reject) => {
        ipcRenderer.once("tweet-return", (event, data : {author: AuthorData, tweet: TweetType} | null | undefined) => {
            resolve(data);
        });
        ipcRenderer.send("try-get-tweet", tweet_id);

        setTimeout(() => {
            reject("Timeout while trying to get tweet with id " + tweet_id);
        }
        , 10000);
    })
}

export async function getImageByUrl(url: string, save_path: string) : Promise<"stored" | "removed" | "error">
{
    return new Promise((resolve, reject) => {
        ipcRenderer.once("media-return", (event, success : "stored" | "removed" | "error") => {
            resolve(success);
        });
        ipcRenderer.send("try-get-media", url, save_path);

        setTimeout(() => {
            reject("Timeout while trying to get image from url " + url);
        }
        , 10000);
    })
}