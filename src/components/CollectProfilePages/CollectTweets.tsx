import { indexTweetsFromProfile, getTweetById, bootstrapStructuredData, collectQRTs } from "@/functions/fs_utils"

function setUpProfile(uuid: string)
{
    //first step: create structured folder and place banenr and profile picture data if it doesn't exist
    bootstrapStructuredData(uuid)
    //second step: index tweets from the data profile and store each tweet in a separate file
    indexTweetsFromProfile(uuid)
    //third step: collect QRT source tweets
    collectQRTs(uuid)
}

export default function CollectTweets(props : {uuid: string, twitter_handle: string})
{
    return (
        <div className="centerContainer">
            <h3>Set Up Profile For User {props.twitter_handle}</h3>
            <p className="w60c">
                Archived tweets for user {props.twitter_handle} have not been parsed yet.
                Click the button below to index all tweets for this user and collect initial data.
                This should only take a few seconds.
            </p>
            <p className="w60c">
                Clicking the "Set Up Profile" Button will execute the following steps:
            </p>
            <ol>
                <li>Extract Profile Metadata Information (Profile Picture, Banner, Display Name).</li>
                <li>Index and Restructure Archived User Tweets.</li>
                <li>Collect Quote Retweet Source Tweets.</li>
                <li>Iteratively Collect Reply Source Tweets.</li>
                <li>Index and Restructure Archived Tweet Media.</li>
                <li>Download Missing Tweet Media.</li>
                <li>Download Other Author Metadata (Profile Picture, Banner, Display Name).</li>
                <li>Clean up Archive Data.</li>
            </ol>
            <p className="w60c">
                The full process may take several minutes, depending on the number of tweets and external authors involved.
                Please do not close the program while this process is running, or you may have to re-import the data profile 
                or start from scratch.
            </p>
            <button onClick={() => {setUpProfile(props.uuid)}}>Parse Tweets</button>
            <button onClick={() => {getTweetById("1690452400082235393").then((tweet) => console.log(tweet))}}>Test Get Tweet Button</button>
        </div>
    )
}