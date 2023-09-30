import { AuthorData, DataProfileType, TweetRelation, TweetRole, TweetType } from "@/types";
import "./DisplayTweet.scss"
import { APP_DATA_PATH, formatDate } from "@/functions/general_utils";
import path from "path";
import { formatText } from "@/functions/renderer_utils";
import TweetMedia from "./TweetMedia";
import ExternalLink from "../ExternalLink/ExternalLink";

export default function DisplayTweet(props: {tweet : TweetType, author: AuthorData, dataProfile: DataProfileType, tweet_role: TweetRole, prev_relation: TweetRelation})
{
    const profile_image = props.author?.profile_image ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.author.profile_image.internal_name!) 
        : "images/unknownuser.png"
    const media_elements = props.tweet.media.map((media) => <TweetMedia media={media} dataProfile={props.dataProfile}/>)
    const urls = props.tweet.urls.map((url) => <ExternalLink url={url}>{url}</ExternalLink>)
    const tweet_text_formatted = formatText(props.tweet.text)

    return (
        <div className={`tweet ${props.tweet_role === TweetRole.LastItem ? "last_tweet" : ""}`}>
            <div className="tweet_main">
                <div className="tweet_sidepanel">
                    {profile_image && <img src={profile_image} className="profileImage"/>}
                    {props.prev_relation === TweetRelation.Reply && <img src="images/comment-dots-solid.svg" className="tweet_relation_topright"/>}
                    {props.prev_relation === TweetRelation.Quote && <img src="images/quote-left-solid.svg" className="tweet_relation_topright"/>}
                    {props.prev_relation === TweetRelation.Retweet && <img src="images/retweet-solid.svg" className="tweet_relation_bottom"/>}
                    {props.tweet_role === TweetRole.HasDirectResponse && <div className="tweet_chain"></div>}
                    {props.tweet_role === TweetRole.HasSiblingResponse && <div className="tweet_sibling"></div>}
                </div>
                <div className="tweet_content">
                    <div className="tweet_date">{formatDate(props.tweet.created_at)}</div>
                    <div className="tweet_author">{props.author?.display_name ?? "Unknown"} {props.author && <>(@{props.author.handle})</>}</div>
                    <div className="tweet_text" dangerouslySetInnerHTML={{__html: tweet_text_formatted}}>
                    </div>
                    <div className="tweet_urls">
                        {urls.length > 0 && <div className="tweet_urls_title">Attached URLs:</div>}
                        {urls}
                    </div>
                    <div className={`${media_elements.length > 2 ? "tweet_media_sm" : "tweet_media"}`}>
                        {media_elements}
                    </div>
                </div>
            </div>
        </div>
    )
}