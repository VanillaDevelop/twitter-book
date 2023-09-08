import { ReactNode, useContext } from "react"
import "./DataProfile.scss"
import { DataProfileType, ModalFooterType } from "@/types"
import { APP_DATA_PATH } from "@/functions/general_utils"
import path from "path";
import useModal from "@/hooks/useModal";
import { DataProfileContext } from "@/contexts/DataProfileContext";
import { deleteProfile } from "@/functions/renderer_utils";

export default function DataProfile(props: {user?: DataProfileType, children?: ReactNode, small: boolean, moving: string, animationCallback: () => void})
{    
    const profile_picture = props.user?.profile_image_internal ? path.join(APP_DATA_PATH, props.user.uuid, "structured_data", "media", props.user.profile_image_internal) : "images/unknownuser.png"
    const {dataProfiles, setDataProfiles} = useContext(DataProfileContext);
    function deleteProfileCallback(confirm: boolean) 
    {
        if(confirm){
            if(props.user){
                deleteProfile(props.user.uuid)
                setDataProfiles(dataProfiles.filter(profile => profile.uuid !== props.user?.uuid));
            }
        }
    }
    
    const {Modal, showModal} = useModal(ModalFooterType.Confirm, "Delete User?", deleteProfileCallback)

    

    return (
        <>
            <Modal>
                <p>
                    You are about to delete the user <strong>{props.user?.twitter_handle}</strong>.
                </p>
                <p>
                    This will delete all data associated with this user, including tweets, media, and metadata.
                    This action <strong>CANNOT</strong> be undone.
                </p>
                <p>
                    Please confirm you want to delete this user and all associated data below.
                </p>
            </Modal>
            <div className={`profileCard ${props.small ? "small " : ""}${props.moving}`} onAnimationEnd={props.animationCallback}>
                {props.user && <span className="deleteProfileButton" onClick={showModal}><img src="images/trash-solid.svg" /></span>}
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
        </>
    )
}