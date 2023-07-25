import {User} from "types"
import UserProfile from "./UserProfile"
import {ReactNode, useState} from "react"
import NewProfile from "./NewProfile"
import "./ProfileWheel.scss"
import EmptyProfile from "./EmptyProfile"

export default function ProfileWheel(props: {profiles: User[]})
{

    const [profileId, setProfileId] = useState(props.profiles.length > 1 ? 1 : 0)
    
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
            return <EmptyProfile small={id==profileId}/>
        }
    }

    return (
        <div className="profileWheel">
            {profileId > 0 && <button onClick={() => setProfileId(profileId - 1)}>&lt;</button>}
            {returnProfileAtId(profileId - 1)}
            {returnProfileAtId(profileId)}
            {returnProfileAtId(profileId + 1)}
            {profileId < props.profiles.length && <button onClick={() => setProfileId(profileId + 1)}>&gt;</button>}
        </div>
    )
}