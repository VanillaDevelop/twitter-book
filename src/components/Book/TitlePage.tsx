import { DataProfileType } from "@/types";
import "./TweetPage.scss";
import "./TitlePage.scss";
import path from "path";
import { APP_DATA_PATH, formatDate } from "@/functions/general_utils";

export default function TitlePage(props : {dataProfile: DataProfileType, preview: boolean, dateSpan: [Date, Date]}) 
{
    const profile_image = props.dataProfile.profile_image_internal ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.dataProfile.profile_image_internal!) 
    : "images/unknownuser.png";
    const banner_image = props.dataProfile.banner_internal ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.dataProfile.banner_internal!) : null;

    function banner_wrapper() {

        return (
            <div className="headerWrapper">
                {banner_image && <img src={banner_image} className="headerBanner"/>}
                <img src={profile_image} className={`${banner_image ? "headerImage" : "standaloneImage"}`}/>
            </div>
        );
    }

    return (
        <div className={`page ${props.preview ? "preview" : ""}`}>
            <div className={`pageContent odd`}>
                <div className="titlePage">
                    {banner_wrapper()}
                    <h1 className="bookHeading">@{props.dataProfile.twitter_handle}</h1>
                    <p className="bookSubtitle">A collection of Tweets from {formatDate(props.dateSpan[0], false)} to {formatDate(props.dateSpan[1], false)}</p>
                </div>
            </div>
        </div>
    );
}