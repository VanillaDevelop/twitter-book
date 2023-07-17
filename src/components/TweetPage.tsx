import "./TweetPage.css";
import Tweet from "./Tweet";

export default function TweetPage({backgroundColor} : {backgroundColor: string}) {
    return (
        <div className="page" style={{backgroundColor: backgroundColor}}>
            <div className="pageContent">
                <Tweet />
                <Tweet />
                <Tweet />
                <Tweet />
                <Tweet />
                <Tweet />
            </div>
        </div>
    );
}