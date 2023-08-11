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
            <h1>Collect Profile</h1>

        </div>
    )
}