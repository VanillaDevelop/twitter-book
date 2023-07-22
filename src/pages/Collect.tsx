import {useState, useEffect} from "react";
import {get_user_profile, get_tweet_generator, login_to_scraper, test_login} from "../functions/twitter_utils";
import { Profile, Tweet } from "@the-convocation/twitter-scraper";
import DisplayTweet from "../components/Tweet";

export default function Collect()
{
    const [tweetCount, setTweetCount] = useState(0);
    const [tweets, setTweets] = useState([] as Tweet[]);
    const [scrapeData, setScrapeData] = useState({username: "", password: ""});
    const [username, setUsername] = useState("");
    const [profile, setProfile] = useState(null as Profile | null);

    async function get_profile()
    {
        const profile = await get_user_profile(username)
        setProfile(profile)
    }

    async function get_tweets()
    {
        setTweets([])
        setTweetCount(0)

        const generator = await get_tweet_generator(profile!.userId!)

        for await (const tweet of generator) {
            setTweetCount((tweetCount) => tweetCount + 1)
            setTweets((tweets) => [...tweets, tweet])
        }
    }

    async function scraper_login()
    {
        console.log(scrapeData.username, scrapeData.password)
        await login_to_scraper(scrapeData.username, scrapeData.password)
    }

    useEffect(() => {
        if(tweets.length > 0) 
        {
            localStorage.setItem("tweetbook_tweets", JSON.stringify(tweets))
        }
    }, [tweets])

    function load_tweets()
    {
        const tweets = JSON.parse(localStorage.getItem("tweetbook_tweets") || "[]")
        console.log(tweets)
        setTweets(tweets)
    }

    return (
        <>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="text" value={scrapeData.username} onChange={(e) => setScrapeData((scrapeData) => ({...scrapeData, username: e.target.value}))} />
            <input type="text" value={scrapeData.password} onChange={(e) => setScrapeData((scrapeData) => ({...scrapeData, password: e.target.value}))} />
            <div>
                Number of tweets: {tweetCount}
            </div>
            {profile && 
                <div>
                    {profile.url} - {profile.name} - {profile.userId}
                </div>
                }
            <div>
                {tweets.map((tweet, index) => { 
                    return <DisplayTweet tweet={tweet} key={index} />
                })}
            </div>
            <button onClick={() => get_profile()}>Test get profile</button>
            <button onClick={() => get_tweets()}>Test get new tweet</button>
            <button onClick={() => load_tweets()}>Test load tweets</button>
            <button onClick={() => test_login()}>Test login</button>
        </>
    )
}