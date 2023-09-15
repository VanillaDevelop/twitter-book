import { TweetRenderType } from "@/types";
import "./TweetPage.scss";
export default function TweetPage(props : {preview: boolean, tweets: TweetRenderType[][], page_number: number}) 
{

    const first_col = props.tweets[0].map((tweet) => tweet.rendered_item);
    const second_col = props.tweets.length > 1 ? props.tweets[1].map((tweet) => tweet.rendered_item) : [];
    const third_col = props.tweets.length > 2 ? props.tweets[2].map((tweet) => tweet.rendered_item) : [];

    return (
        <div className={`page ${props.preview ? "preview" : ""}`}>
            <div className={`pageContent ${props.page_number % 2 == 0 ? 'even' : 'odd'}`}>
                <div className="pageColumn">
                    {first_col}
                </div>
                <div className="pageColumn">
                    {second_col}
                </div>
                <div className="pageColumn">
                    {third_col}
                </div>
            </div>
            <div className={`pageno ${props.page_number % 2 == 0 ? 'even' : 'odd'}`}>{props.page_number + 1}</div>
        </div>
    );
}