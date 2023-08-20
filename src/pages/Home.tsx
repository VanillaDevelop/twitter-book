import ProfileWheel from "@/components/DataProfile/ProfileWheel";
import { useContext } from "react";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import Attributions from "@/components/Attributions/Attributions";

export default function Home()
{
    const {dataProfiles} = useContext(DataProfileContext)
    
    return (
            <div className="fullScreen center-flex-column">
                <h1 className="text-center">Twitter Book Generator</h1>
                <ProfileWheel profiles={dataProfiles}/>
                <Attributions />
            </div>
    )
}