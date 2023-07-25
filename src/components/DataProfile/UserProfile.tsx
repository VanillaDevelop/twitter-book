import { User } from "types";
import DataProfile from "./DataProfile";

export default function UserProfile(props: {profile: User, small: boolean})
{
    return (
        <DataProfile image={props.profile.image} name={props.profile.name} small={props.small}>
        </DataProfile>
    )
}
