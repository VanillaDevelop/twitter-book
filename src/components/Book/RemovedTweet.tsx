import { TweetRelation } from "@/types";
import "./DisplayTweet.scss"

export default function RemovedTweet(props: {prev_relation: TweetRelation})
{
    return (
        <div className="tweet">
            <div className="tweet_main">
                <div className="tweet_sidepanel">
                    <img src="public/images/unknownuser.png" className="profileImage"/>
                    <div className="tweet_chain"></div>
                </div>
                <div className="tweet_content">
                    <div className="tweet_date">Unknown</div>
                    <div className="tweet_author">Unknown</div>
                    <div className="tweet_text">
                        This tweet has been deleted.
                    </div>
                </div>
            </div>
        </div>
    )
}