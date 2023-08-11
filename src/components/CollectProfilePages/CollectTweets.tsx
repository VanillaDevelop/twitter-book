import { getTweetsFromProfile } from "@/functions/fs_utils"

export default function CollectTweets(props : {uuid: string, twitter_handle: string})
{
    return (
        <div className="centerContainer">
            <h3>Parse Tweets For User {props.twitter_handle}</h3>
            <p className="w60c">
                Archived tweets for user {props.twitter_handle} have not been parsed yet.
                Click the button below to index all tweets for this user and collect initial data.
                This should only take a few seconds.
            </p>
            <button onClick={() => {getTweetsFromProfile(props.uuid)}}>Parse Tweets</button>
        </div>
    )
}