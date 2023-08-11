import { ReactNode } from "react"
import "./DataProfile.scss"
import { DataProfileType } from "@/types"
import { useNavigate } from "react-router-dom"

export default function DataProfile(props: {user?: DataProfileType, children?: ReactNode, small: boolean, moving: string, animationCallback: () => void})
{
    let userData = null
    const navigate = useNavigate()
    
    if(props.user && !(props.user.has_tweets && props.user.has_contexts))
    {
        userData = (
                <div className="profileContentWrapper">
                    <div>
                        <p>This profile is not fully set up and requires further steps before it can be turned into a book.</p>
                        <ul>
                            <li>Data {props.user.has_tweets ? "" : "NOT"} Analyzed</li>
                            <li>Context {props.user.has_contexts ? "" : "NOT"} Scraped</li>
                        </ul>
                    </div>
                    <button className="dataActionButton" onClick={() => navigate(`/collect/${props.user?.twitter_handle}`)}>Set Up Profile</button>
                </div>
        )
    }

    return (
        <div className={`profileCard ${props.small ? "small " : ""}${props.moving}`} onAnimationEnd={props.animationCallback}>
            <div className="profileHeader">
                <img src="images/newuser.png" alt="profile" />
                {props.user ? <h4>{props.user.twitter_handle}</h4> : <h4>Add New User</h4>}
            </div>
            <div className="profileContent">
                {props.user && userData}
                {!props.user && props.children}
            </div>
        </div>
    )
}