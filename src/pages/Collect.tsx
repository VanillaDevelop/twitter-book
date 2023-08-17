import ProfileWheel from "@/components/DataProfile/ProfileWheel";
import {useNavigate} from "react-router-dom"
import { useContext } from "react";
import { DataProfileContext } from "@/contexts/DataProfileContext";

export default function Collect()
{
    const navigate = useNavigate()

    const {dataProfiles} = useContext(DataProfileContext)
    
    return (
            <div className="fullScreen center-flex-column">
                <button className="backButton" onClick={() => navigate("/")}/>
                <h1 className="text-center">Your Data Profiles</h1>
                <ProfileWheel profiles={dataProfiles} collectPage={true}/>
            </div>
    )
}