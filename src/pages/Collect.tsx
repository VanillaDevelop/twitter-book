import ProfileWheel from "@/components/DataProfile/ProfileWheel";
import {useNavigate} from "react-router-dom"

export default function Collect()
{
    const navigate = useNavigate()

    return (
        <div className="fullScreen center-flex-column">
            <button className="backButton" onClick={() => navigate("/")}/>
            <h1 className="text-center">Your Data Profiles</h1>
            <ProfileWheel profiles={[]} />
        </div>
    )
}