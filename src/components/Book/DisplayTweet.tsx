import { AuthorData, DataProfileType, TweetRelation, TweetType } from "@/types";
import RemovedTweet from "./RemovedTweet";
import "./DisplayTweet.scss"
import { APP_DATA_PATH } from "@/functions/general_utils";
import path from "path";

export default function DisplayTweet(props: {tweet : TweetType | null, author: AuthorData, dataProfile: DataProfileType, prev_relation: TweetRelation})
{
    if(props.tweet === null) return <RemovedTweet />

    const profile_image = props.author.profile_image ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.author.profile_image.internal_name!) : undefined;
    const media_elements = props.tweet.media.map((media) => {
        return <img src={"app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", media.internal_name!)} key={media.internal_name} className="tweetMedia"/>
    });

    return (
        <div className="tweet">
            <div className="tweet_main">
                <div className="tweet_author">
                    {profile_image && <img src={profile_image} className="profileImage"/>}
                </div>
                <div className="tweet_content">
                    <div className="authorName">{props.author.display_name} (@{props.author.handle})</div>
                    <div className="tweet_text">
                        {props.tweet.text && <span>{props.tweet.text}</span>}
                    </div>
                </div>
            </div>
            <div className="tweet_media">
                {media_elements}
            </div>
        </div>
    )
}