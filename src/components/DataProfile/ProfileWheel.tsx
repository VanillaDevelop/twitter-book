import DataProfile from "./DataProfile"
import {ReactNode, useState} from "react"
import "./ProfileWheel.scss"
import NewProfileContent from "./NewProfileContent"
import { DataProfileType, PopUpType } from "@/types"
import PopUpHolder from "../PopUp/PopUpHolder"
import {v4 as uuidv4} from "uuid"

export default function ProfileWheel(props: {profiles: DataProfileType[]})
{

    const [profileId, setProfileId] = useState(props.profiles.length > 1 ? 1 : 0)
    const [popUps, setPopUps] = useState<PopUpType[]>([]);
    const [moving, setMoving] = useState("")
    
    function addPopUp(popUpText: string)
    {
        setPopUps(oldPopUps => [...oldPopUps, {id: uuidv4(), text: popUpText, title: "Error"}])
    }

    function doneMoving()
    {
        if(moving === "movingLeft")
        {
            setProfileId(profileId - 1)
        }
        else if(moving === "movingRight")
        {
            setProfileId(profileId + 1)
        }
        setMoving("")
    }

    function returnProfileAtId(id: number) : ReactNode
    {
        if(id >= 0 && id < props.profiles.length)
        {
            return <DataProfile user={props.profiles[id]} small={id!=profileId} moving={moving} animationCallback={doneMoving}/>
        }
        else if(id == props.profiles.length)
        {
            return (
            <DataProfile small={id!=profileId} moving={moving} animationCallback={doneMoving}>
                <NewProfileContent addPopUp={addPopUp} />
            </DataProfile> )
        }
        else
        {
            return <div className="emptyProfile"/>
        }
    }

    return (
        <div className="profileWheel">
            <button style={profileId > 0 ? {} : {visibility: "hidden"}} onClick={() => setMoving("movingLeft")} className="navigateButton">
                <img src="images/arrow-left-solid.svg" alt="left arrow" />
            </button>
            {returnProfileAtId(profileId - 1)}
            {returnProfileAtId(profileId)}
            {returnProfileAtId(profileId + 1)}
            <button style={profileId < props.profiles.length ? {} : {visibility: "hidden"}} className="navigateButton" onClick={() => setMoving("movingRight")}>
                <img src="images/arrow-right-solid.svg" alt="right arrow" />
            </button>
            <PopUpHolder popUps={popUps} destroyPopUp={(id) => setPopUps(oldPopUps => oldPopUps.filter((popUp) => popUp.id !== id))}/>
        </div>
    )
}