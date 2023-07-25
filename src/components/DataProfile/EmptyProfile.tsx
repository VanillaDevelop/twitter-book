import "./DataProfile.scss"

export default function EmptyProfile(props : {small: boolean})
{
    return (
        <div className={`emptyProfile ${props.small ? "small" : ""}`}>

        </div>
    )
}