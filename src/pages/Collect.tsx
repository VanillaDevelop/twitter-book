import ProfileWheel from "@/components/DataProfile/ProfileWheel";

export default function Collect()
{
    return (
        <div className="fullScreen">
            <h1>Your Data Profiles</h1>
            <ProfileWheel profiles={[{"image": "images/newuser.png", "name": "Filler User"},{"image": "images/newuser.png", "name": "Filler User"}]} />
        </div>
    )
}