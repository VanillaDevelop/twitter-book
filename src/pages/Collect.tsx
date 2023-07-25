import ProfileWheel from "@/components/DataProfile/ProfileWheel";

export default function Collect()
{
    return (
        <div>
            <ProfileWheel profiles={[{"image": "images/newuser.png", "name": "Filler User"},{"image": "images/newuser.png", "name": "Filler User"}]} />
        </div>
    )
}