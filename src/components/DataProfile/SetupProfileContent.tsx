import { DataProfileType } from "@/types"
import { useNavigate } from "react-router-dom"

export default function SetupProfileContent(props : {user: DataProfileType})
{
    const navigate = useNavigate()

    return (
        <div className="profileContentWrapper">
            {!props.user.is_setup &&
            <>
                <div className="text-center">
                    <p>This profile is not fully set up and requires further steps before it can be turned into a book.</p>
                    <p>Click the button below to start the setup process.</p>
                </div>
                <button className="dataActionButton" onClick={() => navigate(`/collect/${props.user?.twitter_handle}`)}>Set Up Profile</button>
            </>
            }
            {props.user.is_setup &&
            <>
                <div className="text-center">
                    <p>This profile is set up and ready to be turned into a book.</p>
                    <p>To start the creation process, click the button below.</p>
                </div>
                <button className="dataActionButton" onClick={() => navigate(`/book/${props.user?.twitter_handle}`)}>Create Book</button>
            </>
            }
        </div>
    )
}
