import CollectTweets from "@/components/CollectProfilePages/CollectTweets";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import { DataProfileType } from "@/types";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function CollectProfile()
{
    const [user, setUser] = useState<DataProfileType | undefined>();
    const [tweets, setTweets] = useState([]);
    const {username} = useParams();
    const {dataProfiles, setDataProfiles} = useContext(DataProfileContext)
    const navigate = useNavigate();

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
        <div>
            <h1 className="text-center">Set Up Profile</h1>
            <div className="container">
                {user && !(user?.has_tweets) && <CollectTweets uuid={user.uuid} twitter_handle={user.twitter_handle}/>}
            </div>
        </div>
    )
}