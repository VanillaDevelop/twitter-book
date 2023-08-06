import ProfileWheel from "@/components/DataProfile/ProfileWheel";
import {useNavigate} from "react-router-dom"
import { useContext } from "react";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import PopUp from "@/components/PopUp/PopUp";

export default function Collect()
{
    const navigate = useNavigate()

    const {dataProfiles} = useContext(DataProfileContext)
    
    return (
            <div className="fullScreen center-flex-column">
                <button className="backButton" onClick={() => navigate("/")}/>
                <h1 className="text-center">Your Data Profiles</h1>
                <ProfileWheel profiles={dataProfiles} />
                <PopUp title="Test" text="Test"/>
            </div>
    )
}