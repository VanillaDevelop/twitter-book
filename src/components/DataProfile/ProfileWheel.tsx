import {User} from "types"
import UserProfile from "./UserProfile"
import {ReactNode, useState} from "react"
import NewProfile from "./NewProfile"
import "./ProfileWheel.scss"
import EmptyProfile from "./EmptyProfile"

export default function ProfileWheel(props: {profiles: User[]})
{

    const [profileId, setProfileId] = useState(props.profiles.length > 1 ? 1 : 0)
    const [moving, setMoving] = useState("")
    
    function returnProfileAtId(id: number) : ReactNode
    {
        if(id >= 0 && id < props.profiles.length)
        {
            return <UserProfile profile={props.profiles[id]} small={id!=profileId}/>
        }
        else if(id == props.profiles.length)
        {
            return <NewProfile small={id!=profileId}/>
        }
        else
        {
            return <EmptyProfile />
        }
    }

    return (
        <div className="profileWheel">
            <button style={profileId > 0 ? {} : {visibility: "hidden"}} onClick={() => setProfileId(profileId - 1)} className="navigateButton">
                <img src="images/arrow-left-solid.svg" alt="left arrow" />
            </button>
            {returnProfileAtId(profileId - 1)}
            {returnProfileAtId(profileId)}
            {returnProfileAtId(profileId + 1)}
            <button style={profileId < props.profiles.length ? {} : {visibility: "hidden"}} className="navigateButton" onClick={() => setProfileId(profileId + 1)}>
                <img src="images/arrow-right-solid.svg" alt="right arrow" />
            </button>
        </div>
    )
}