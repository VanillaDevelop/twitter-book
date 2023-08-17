import { TweetType } from "@/types";
import "./TweetPage.scss";
export default function TweetPage(props : {renderBorder: boolean, tweets: TweetType[]}) 
{
    return (
        <div className="page" style={{border: props.renderBorder ? "1px solid black" : "none"}}>
            <div className="pageContent">
                Hullo test
            </div>
        </div>
    );
}