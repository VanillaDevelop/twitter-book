import useModal from "@/hooks/useModal";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import { BuildTweetChains, collectMedia, indexTweetsFromProfile } from "@/functions/renderer_utils";
import { DataProfileType, ModalFooterType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExternalLink from "@/components/ExternalLink/ExternalLink";

async function setUpProfile(uuid: string, author_handle: string) : Promise<boolean>
{
    //index tweets from the data profile and store a temporary list of tweets
    indexTweetsFromProfile(uuid, author_handle)
    
    //iteratively collect QRTs and replies to build tweet chains.
    if(!await BuildTweetChains(uuid))
        return false;

    //fifth step: download missing tweet media
    if(!await collectMedia(uuid))
        return false;

    //sixth step: download other author metadata
    //seventh step: clean up archive data
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
                            <button onClick={() => {setUpProfile(user!.uuid, user!.twitter_handle).then(success => {
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