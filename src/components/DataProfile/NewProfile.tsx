import DataProfile from "./DataProfile";

export default function NewProfile(props: {small: boolean})
{
    return (
        <DataProfile image="images/newuser.png" name="Add New User" small={props.small}>
        </DataProfile>
    )
}
