import { AuthorData, DataProfileType, TweetRelation, TweetType } from "@/types";
import "./DisplayTweet.scss"
import { APP_DATA_PATH } from "@/functions/general_utils";
import path from "path";
import { formatText } from "@/functions/renderer_utils";

export default function DisplayTweet(props: {tweet : TweetType, author: AuthorData, dataProfile: DataProfileType, standalone: boolean, prev_relation: TweetRelation})
{
    const profile_image = props.author?.profile_image ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.author.profile_image.internal_name!) 
        : "images/unknownuser.png"
    const media_elements = props.tweet.media.map((media) => {
        return <img src={"app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", media.internal_name!)} key={media.internal_name} className="tweetMedia"/>
    });
    const tweet_text_formatted = formatText(props.tweet.text)

    return (
        <div className="tweet">
            <div className="tweet_main">
                <div className="tweet_sidepanel">
                    {profile_image && <img src={profile_image} className="profileImage"/>}
                    {props.prev_relation === TweetRelation.Reply && <img src="images/comment-dots-solid.svg" className="tweet_relation_topright"/>}
                    {props.prev_relation === TweetRelation.Quote && <img src="images/quote-left-solid.svg" className="tweet_relation_topright"/>}
                    {props.prev_relation === TweetRelation.Retweet && <img src="images/retweet-solid.svg" className="tweet_relation_bottom"/>}
                    {!props.standalone && <div className="tweet_chain"></div>}
                </div>
                <div className="tweet_content">
                    <div className="tweet_date">{props.tweet.created_at.toLocaleString()}</div>
                    <div className="tweet_author">{props.author?.display_name ?? "Unknown"} {props.author && <>(@{props.author.handle})</>}</div>
                    <div className="tweet_text" dangerouslySetInnerHTML={{__html: tweet_text_formatted}}>
                    </div>
                    <div className={`${media_elements.length > 2 ? "tweet_media_sm" : "tweet_media"}`}>
                        {media_elements}
                    </div>
                </div>
            </div>
        </div>
    )
}