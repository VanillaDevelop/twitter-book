import { TweetRenderType } from "@/types";
import "./TweetPage.scss";
export default function TweetPage(props : {preview: boolean, tweets: TweetRenderType[]}) 
{

    const tweets = props.tweets.map((tweet) => tweet.rendered_item);

    return (
        <div className={`page ${props.preview ? "preview" : ""}`}>
            <div className="pageContent">
                {tweets}
            </div>
        </div>
    );
}