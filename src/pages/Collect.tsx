import {useState} from "react";
import {test_tweet} from "../functions/twitter_utils";

export default function Collect()
{
    const [tweetText, setTweetText] = useState("");

    async function getTweet()
    {
        const tweet = await test_tweet();
        setTweetText(tweet)
    }

    return (
        <>
            <div>
                {tweetText}
            </div>
            <button onClick={() => getTweet()}>Test get new tweet</button>
        </>
    )
}