import { AuthorData, DataProfileType, TweetType } from "@/types";
import RemovedTweet from "./RemovedTweet";
import "./DisplayTweet.scss"
import { APP_DATA_PATH } from "@/functions/general_utils";
import path from "path";

export default function DisplayTweet(props: {tweet : TweetType | null, authors: AuthorData[], dataProfile: DataProfileType})
{
    if(props.tweet === null) return <RemovedTweet />

    const tweet_author = props.authors.find((author) => author.handle === props.tweet!.author_handle)!;
    const profile_image = tweet_author.profile_image ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", tweet_author.profile_image.internal_name!) : undefined;

    return (
        <div className="tweet">
            <div className="tweet_author">
                {profile_image && <img src={profile_image} className="profileImage"/>}
                <span className="authorName">{tweet_author.display_name} (@{tweet_author.handle})</span>
            </div>
            <div className="tweet_text">
                {props.tweet.text && <span>{props.tweet.text}</span>}
            </div>
        </div>
    )
}