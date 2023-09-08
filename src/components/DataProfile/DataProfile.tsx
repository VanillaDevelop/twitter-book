import { ReactNode } from "react"
import "./DataProfile.scss"
import { DataProfileType } from "@/types"
import { APP_DATA_PATH } from "@/functions/general_utils"
import path from "path";

export default function DataProfile(props: {user?: DataProfileType, children?: ReactNode, small: boolean, moving: string, animationCallback: () => void})
{    
    const profile_picture = props.user?.profile_image_internal ? path.join(APP_DATA_PATH, props.user.uuid, "structured_data", "media", props.user.profile_image_internal) : "images/unknownuser.png"

    return (
        <div className={`profileCard ${props.small ? "small " : ""}${props.moving}`} onAnimationEnd={props.animationCallback}>
            <span className="deleteProfileButton"><img src="images/trash-solid.svg" /></span>
            <div className="profileHeader">
                {!props.user && <img src="images/newuser.png" alt="profile" />}
                {props.user && !props.user.is_setup && <img src="images/unknownuser.png" alt="profile" />}
                {props.user && props.user.is_setup && <img src={`app://${profile_picture}`} alt="profile" className="profilePicture" />}
                {props.user ? <h4>{props.user.twitter_handle}</h4> : <h4>Add New User</h4>}
            </div>
            <div className="profileContent">
                {props.children}
            </div>
        </div>
    )
}