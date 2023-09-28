import { DataProfileType } from "@/types";
import "./TweetPage.scss";
import "./TitlePage.scss";
import path from "path";
import { APP_DATA_PATH, formatDate } from "@/functions/general_utils";

export default function TitlePage(props : {dataProfile: DataProfileType, preview: boolean, dateSpan: [Date, Date]}) 
{
    const profile_image = props.dataProfile.profile_image_internal ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.dataProfile.profile_image_internal!) 
    : "images/unknownuser.png"

    return (
        <div className={`page ${props.preview ? "preview" : ""}`}>
            <div className={`pageContent even`}>
                <div className="titlePage">
                    <img src={profile_image} className="headerImage"/>
                    <h1 className="bookHeading">@{props.dataProfile.twitter_handle}</h1>
                    <p className="bookSubtitle">A collection of Tweets from {formatDate(props.dateSpan[0], false)} to {formatDate(props.dateSpan[1], false)}</p>
                </div>
            </div>
        </div>
    );
}