import { AuthorData, MediaType, TweetMediaType, TweetType, URLResolve } from "@/types";
import { Profile, Scraper } from "@the-convocation/twitter-scraper";
import { ipcMain, shell } from "electron";

const scraper = new Scraper();

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