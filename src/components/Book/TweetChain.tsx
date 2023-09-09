import { AuthorData, DataProfileType, TweetChainType } from "@/types";
import DisplayTweet from "./DisplayTweet";

export default function TweetChain(props: {tweets: TweetChainType, authors: AuthorData[], dataProfile: DataProfileType})
{
    const tweet_objects = props.tweets.map((tweet) => <DisplayTweet tweet={tweet} authors={props.authors} dataProfile={props.dataProfile} />)

    return (
        <div className="tweetChain">
            {tweet_objects}
        </div>
    )
}