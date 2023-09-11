import { AuthorData, DataProfileType, TweetType } from "@/types";
import RemovedTweet from "./RemovedTweet";
import "./DisplayTweet.scss"
import { APP_DATA_PATH } from "@/functions/general_utils";
import path from "path";

export default function DisplayTweet(props: {tweet : TweetType | null, author: AuthorData, dataProfile: DataProfileType})
{
    if(props.tweet === null) return <RemovedTweet />

    const profile_image = props.author.profile_image ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.author.profile_image.internal_name!) : undefined;

    return (
        <div className="tweet">
            <div className="tweet_author">
                {profile_image && <img src={profile_image} className="profileImage"/>}
                <span className="authorName">{props.author.display_name} (@{props.author.handle})</span>
            </div>
            <div className="tweet_text">
                {props.tweet.text && <span>{props.tweet.text}</span>}
            </div>
        </div>
    )
}