import "./TweetPage.css";
export default function TweetPage({backgroundColor} : {backgroundColor: string}) {
    return (
        <div className="page" style={{backgroundColor: backgroundColor}}>
            <div className="pageContent">
                Hullo test
            </div>
        </div>
    );
}