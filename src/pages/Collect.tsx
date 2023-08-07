import ProfileWheel from "@/components/DataProfile/ProfileWheel";
import {useNavigate} from "react-router-dom"
import { useContext, useState } from "react";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import PopUpHolder from "@/components/PopUp/PopUpHolder";
import { PopUpType } from "@/types";

export default function Collect()
{
    const navigate = useNavigate()
    const [popUps, setPopUps] = useState<PopUpType[]>([]);

    const {dataProfiles} = useContext(DataProfileContext)
    
    return (
            <div className="fullScreen center-flex-column">
                <button className="backButton" onClick={() => navigate("/")}/>
                <h1 className="text-center">Your Data Profiles</h1>
                <ProfileWheel profiles={dataProfiles} />
                <PopUpHolder popUps={popUps} destroyPopUp={(id) => setPopUps(oldPopUps => oldPopUps.filter((popUp) => popUp.id !== id))}/>
            </div>
    )
}