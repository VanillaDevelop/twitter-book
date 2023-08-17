import { ReactNode } from "react"
import "./DataProfile.scss"
import { DataProfileType } from "@/types"
import { APP_DATA_PATH } from "@/contexts/DataProfileContext";
import path from "path";

export default function DataProfile(props: {user?: DataProfileType, children?: ReactNode, small: boolean, moving: string, animationCallback: () => void})
{
    return (
        <div className={`profileCard ${props.small ? "small " : ""}${props.moving}`} onAnimationEnd={props.animationCallback}>
            <div className="profileHeader">
                {!props.user && <img src="images/newuser.png" alt="profile" />}
                {props.user && !props.user.is_setup && <img src="images/newuser.png" alt="profile" />}
                {props.user && props.user.is_setup && <img src={`app://${path.join(APP_DATA_PATH, props.user.uuid, "structured_data", "avatar.jpg")}`} alt="profile" />}
                {props.user ? <h4>{props.user.twitter_handle}</h4> : <h4>Add New User</h4>}
            </div>
            <div className="profileContent">
                {props.children}
            </div>
        </div>
    )
}