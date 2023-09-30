import useModal from "@/hooks/useModal";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import { CollectTweets, cleanupDirectory, collectAuthorMedia, collectAuthors, collectMedia, getAuthors, indexTweetsFromProfile, resetScraper } from "@/functions/renderer_utils";
import { DataProfileType, ModalFooterType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExternalLink from "@/components/ExternalLink/ExternalLink";
import "./CollectProfile.scss"

export default function CollectProfile()
{
    const [user, setUser] = useState<DataProfileType | undefined>();
    const {username} = useParams();
    const [parsingState, setParsingState] = useState(0);
    const {dataProfiles, setDataProfiles} = useContext(DataProfileContext)
    const navigate = useNavigate();

    const {Modal, showModal} = useModal(ModalFooterType.None, "Warning")

    async function setUpProfile(uuid: string, author_handle: string) : Promise<boolean>
    {
        setParsingState(1);
        //reset the scraper
        if(!(await resetScraper()))
        {
            setParsingState(0);
            return false;
        }
        //index tweets from the data profile and store a temporary list of tweets
        indexTweetsFromProfile(uuid, author_handle)
        
        //iteratively collect QRTs and replies to build tweet chains.
        setParsingState(2);
        if(!await CollectTweets(uuid))
        {
            setParsingState(0);
            return false;
        }

        //collect tweet media.
        setParsingState(3);
        if(!await collectMedia(uuid))
        {
            setParsingState(0);
            return false;
        }
    
        //collect author metadata
        setParsingState(4);
        if(!await collectAuthors(uuid))
        {
            setParsingState(0);
            return false;
        }
    
        //collect author media
        setParsingState(5);
        if(!await collectAuthorMedia(uuid))
        {
            setParsingState(0);
            return false;
        }
    
        setParsingState(6);
        return true;
    }

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
                    If you are still having issues, feel free to open an issue 
                    on <ExternalLink url="https://github.com/VanillaDevelop/twitter-book">GitHub</ExternalLink>.
                </p>
            </Modal>

            <button className="backButton" onClick={() => navigate("/") } disabled={parsingState !== 0} />

            {user && (
                <div>
                    <h1 className="text-center">Set Up Profile</h1>
                    <div className="container">
                        <div className="centerContainer">
                            <h3>Set Up Profile For User {user.twitter_handle}</h3>
                            <p className="w60c">
                                Clicking the "Set Up Profile" Button will execute the following steps:
                            </p>
                            <ol>
                                <li style={{ fontWeight: parsingState === 1 ? "bold" : "normal"}}>Index and Restructure Archived User Tweets.</li>
                                <li style={{ fontWeight: parsingState === 2 ? "bold" : "normal"}}>Iteratively Collect External Tweets For Tweet Chains.</li>
                                <li style={{ fontWeight: parsingState === 3 ? "bold" : "normal"}}>Collect Tweet Media.</li>
                                <li style={{ fontWeight: parsingState === 4 ? "bold" : "normal"}}>Collect Author Metadata (Profile Picture, Banner, Display Name).</li>
                                <li style={{ fontWeight: parsingState === 5 ? "bold" : "normal"}}>Collect Author Media.</li>
                                <li style={{ fontWeight: parsingState === 6 ? "bold" : "normal"}}>Clean up Archive Data.</li>
                            </ol>
                            <p className="w60c">
                                The full process may take several minutes, depending on the number of tweets and external authors involved.
                                Please do not close the program while this process is running, or you may have to re-import the data profile 
                                or start from scratch.
                            </p>
                            <p className="w60c"> 
                                <strong>
                                    It is possible that an error occurs after a few minutes of scraping. This likely occurs due to rate limiting.
                                    In this case, your progress will be saved, and you may continue scraping by clicking the "Parse Tweets" button again 
                                    after waiting a while or using a VPN to circumvent rate limiting.
                                </strong>
                            </p>
                            {
                                parsingState === 0 
                                ?
                                <button onClick={() => {setUpProfile(user!.uuid, user!.twitter_handle).then(success => {
                                    if(!success)
                                    {
                                        showModal()
                                    }
                                    else
                                    {
                                        const authors = getAuthors(user!.uuid)
                                        const author = authors.find(author => author.handle === user!.twitter_handle)
                                        setDataProfiles((dataProfiles.map(profile => {
                                            if(profile.uuid === user!.uuid)
                                            {
                                                profile.is_setup = true
                                                profile.banner_internal = author!.banner?.internal_name ?? undefined
                                                profile.profile_image_internal = author!.profile_image?.internal_name ?? undefined
                                                return profile;
                                            }
                                            return profile;
                                        })))
                                        cleanupDirectory(user!.uuid)
                                        navigate(`/`)
                                    }
                                })}} className="parseTweetsButton">Parse Tweets</button>
                                :
                                <img src="images/spinner.svg" className="loading" alt="loading" />
                            }
                        </div>
                    </div>
                </div>
            )
        }
        </>
    )
}