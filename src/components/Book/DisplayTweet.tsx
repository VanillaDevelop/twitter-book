import { AuthorData, DataProfileType, TweetRelation, TweetType } from "@/types";
import "./DisplayTweet.scss"
import { APP_DATA_PATH } from "@/functions/general_utils";
import path from "path";

export default function DisplayTweet(props: {tweet : TweetType, author: AuthorData, dataProfile: DataProfileType, standalone: boolean, prev_relation: TweetRelation})
{
    const profile_image = props.author.profile_image ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.author.profile_image.internal_name!) : undefined;
    const media_elements = props.tweet.media.map((media) => {
        return <img src={"app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", media.internal_name!)} key={media.internal_name} className="tweetMedia"/>
    });

    return (
        <div className="tweet">
            <div className="tweet_main">
                <div className="tweet_sidepanel">
                    {profile_image && <img src={profile_image} className="profileImage"/>}
                    {!props.standalone && <div className="tweet_chain"></div>}
                </div>
                <div className="tweet_content">
                    <div className="tweet_date">{props.tweet.created_at.toLocaleString()}</div>
                    <div className="tweet_author">{props.author.display_name} (@{props.author.handle})</div>
                    <div className="tweet_text">
                        {props.tweet.text && <span>{props.tweet.text}</span>}
                    </div>
                    <div className={`${media_elements.length > 2 ? "tweet_media_sm" : "tweet_media"}`}>
                        {media_elements}
                    </div>
                </div>
            </div>
        </div>
    )
}