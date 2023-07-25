import { User } from "types";
import DataProfile from "./DataProfile";

export default function UserProfile(props: {profile: User})
{
    return (
        <DataProfile image={props.profile.image} name={props.profile.name}>
        </DataProfile>
    )
}
