import { TweetType } from "@/types";
import { Profile, Scraper } from "@the-convocation/twitter-scraper";
import { ipcMain } from "electron";

const scraper = new Scraper();

export async function get_tweet(tweet_id: string) : Promise<TweetType | null>
{
    const tweet = await scraper.getTweet(tweet_id);
    if(tweet == null)
    {
        return null;
    }

    return {
        id: tweet.id,
        text: tweet.text,
        created_at: new Date(tweet.timestamp!),
    } as TweetType;
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