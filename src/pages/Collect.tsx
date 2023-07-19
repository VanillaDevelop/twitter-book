import {useState} from "react";
import {get_tweet_generator} from "../functions/twitter_utils";
import { Tweet } from "@the-convocation/twitter-scraper";
import DisplayTweet from "../components/Tweet";

export default function Collect()
{
    const [tweets, setTweets] = useState([] as Tweet[]);

    async function get_tweets()
    {
        setTweets([])

        const generator = await get_tweet_generator("Twitter")

        for await (const tweet of generator) {
            setTweets((tweets) => [...tweets, tweet]);
        }
    }

    async function update_and_save_tweets()
    {
        await get_tweets()
        localStorage.setItem("tweetbook_tweets", JSON.stringify(tweets))
    }

    function load_tweets()
    {
        const tweets = JSON.parse(localStorage.getItem("tweetbook_tweets") || "[]")
        console.log(tweets)
        setTweets(tweets)
    }

    return (
        <>
            <div>
                Number of tweets: {tweets.length}
            </div>
            <div>
                {tweets.map((tweet, index) => { 
                    return <DisplayTweet tweet={tweet} key={index} />
                })}
            </div>
            <button onClick={() => update_and_save_tweets()}>Test get new tweet</button>
            <button onClick={() => load_tweets()}>Test load tweets</button>
        </>
    )
}