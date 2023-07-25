import {User} from "types"
import UserProfile from "./UserProfile"
import {ReactNode, useState} from "react"
import NewProfile from "./NewProfile"
import "./ProfileWheel.scss"

export default function ProfileWheel(props: {profiles: User[]})
{

    const [profileId, setProfileId] = useState(props.profiles.length > 1 ? 1 : 0)
    
    function returnProfileAtId(id: number) : ReactNode
    {
        if(id < props.profiles.length)
        {
            return <UserProfile profile={props.profiles[id]}/>
        }
        else
        {
            return <NewProfile />
        }
    }

    return (
        <div className="profileWheel">
            {profileId > 0 && <button onClick={() => setProfileId(profileId - 1)}>&lt;</button>}
            {profileId > 0 && returnProfileAtId(profileId - 1)}
            {returnProfileAtId(profileId)}
            {profileId < props.profiles.length && returnProfileAtId(profileId + 1)}
            {profileId < props.profiles.length && <button onClick={() => setProfileId(profileId + 1)}>&gt;</button>}
        </div>
    )
}