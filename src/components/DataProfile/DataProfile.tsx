import { ReactNode } from "react"
import "./DataProfile.scss"

export default function DataProfile(props: {image: string, name: string, children?: ReactNode, small: boolean})
{
    return (
        <div className={`profileCard ${props.small ? "small" : ""}`}>
            <div className="profileHeader">
                <img src={props.image} alt="profile" />
                <h4>{props.name}</h4>
            </div>
            <div className="profileContent">
                {props.children}
            </div>
        </div>
    )
}