import useModal from "@/hooks/useModal";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import { CollectReplyTweets, bootstrapStructuredData, collectQRTs, indexTweetsFromProfile } from "@/functions/renderer_utils";
import { DataProfileType, ModalFooterType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExternalLink from "@/components/ExternalLink/ExternalLink";

async function setUpProfile(uuid: string) : Promise<boolean>
{
    //first step: create structured folder and place banenr and profile picture data if it doesn't exist
    bootstrapStructuredData(uuid)
    //second step: index tweets from the data profile and store each tweet in a separate file
    indexTweetsFromProfile(uuid)
    //third+fourth step: collect QRT source tweets and reply source tweets, repeating until no new tweets are found
    while(true)
    {
        const newQRTs = await collectQRTs(uuid)
        if(newQRTs == -1)
            return false;
        console.log(`Collected ${newQRTs} new QRTs`)
        const newReplies = await CollectReplyTweets(uuid)
        if(newReplies == -1)
            return false;
        console.log(`Collected ${newReplies} new Replies`)
        if(newQRTs == 0 && newReplies == 0)
            break;
    }
    //fifth step: index and restructure tweet media
    //sixth step: download missing tweet media
    //seventh step: download other author metadata
    //eighth step: clean up archive data
    return true;
}


export default function CollectProfile()
{
    const [user, setUser] = useState<DataProfileType | undefined>();
    const {username} = useParams();
    const {dataProfiles} = useContext(DataProfileContext)
    const navigate = useNavigate();

    const {Modal, showModal, hideModal} = useModal(ModalFooterType.None, "Warning")

    useEffect(() => {
        //load user into state from params
        const user = dataProfiles.find(user => user.twitter_handle === username)
        if(!user)
        {
            //navigate back to collect page
            navigate('/collect')
        }
        setUser(user!)
    }, [])

    return (
        <>
            <Modal>
                <p>
                    The program encountered an error while trying to scrape your data. 
                    If this error occurred a while after starting the scraping process, 
                    it is likely to be caused by rate limiting. Your progress has been saved,
                    and you may continue scraping by clicking the "Parse Tweets" button again 
                    at a later time. You could also use a VPN to circumvent rate limiting temporarily.
                </p>

                <p>
                    If this error occurred immediately after clicking the "Parse Tweets" button,
                    please check your internet connection, as well as Twitter's current status.
                    If you are still having issues, feel free to contact me on <ExternalLink url="https://github.com/VanillaDevelop/twitter-book">GitHub</ExternalLink>.
                </p>
            </Modal>

            <button className="backButton" onClick={() => navigate("/")}/>
            {user && (
                <div>
                    <h1 className="text-center">Set Up Profile</h1>
                    <div className="container">
                        <div className="centerContainer">
                            <h3>Set Up Profile For User {user.twitter_handle}</h3>
                            <p className="w60c">
                                Archived tweets for user {user!.twitter_handle} have not been parsed yet.
                                Click the button below to index all tweets for this user and collect initial data.
                                This should only take a few seconds.
                            </p>
                            <p className="w60c">
                                Clicking the "Set Up Profile" Button will execute the following steps:
                            </p>
                            <ol>
                                <li>Extract Profile Metadata Information (Profile Picture, Banner, Display Name).</li>
                                <li>Index and Restructure Archived User Tweets.</li>
                                <li>Iteratively Collect Quote Retweet Source Tweets.</li>
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
                            <button onClick={() => {setUpProfile(user!.uuid).then(success => {
                                if(!success)
                                {
                                    showModal()
                                }
                            })}}>Parse Tweets</button>
                        </div>
                    </div>
                </div>
            )
        }
        </>
    )
}