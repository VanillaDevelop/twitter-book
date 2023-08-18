import ProfileWheel from "@/components/DataProfile/ProfileWheel";
import { useContext } from "react";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import Attributions from "@/components/Attributions/Attributions";

export default function Home()
{
    const {dataProfiles} = useContext(DataProfileContext)
    
    return (
            <div className="fullScreen center-flex-column no-overflow">
                <h1 className="text-center">Your Data Profiles</h1>
                <ProfileWheel profiles={dataProfiles}/>
                <Attributions />
            </div>
    )
}