import { DataProfileType } from "@/types";
import "./TweetPage.scss";
import "./TitlePage.scss";
import path from "path";
import { APP_DATA_PATH, formatDate } from "@/functions/general_utils";

export default function TitlePage(props : {dataProfile: DataProfileType, preview: boolean, dateSpan: [Date, Date]}) 
{
    const profile_image = props.dataProfile.profile_image_internal ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.dataProfile.profile_image_internal!) 
    : "images/unknownuser.png";
    const banner_image = props.dataProfile.banner_internal ? "app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.dataProfile.banner_internal!).replace(/\\/g, "/") : null;

    function banner_wrapper() {
        const img_element = <img src={profile_image} className="headerImage"/>
        const banner_style = banner_image ? {backgroundImage: `url(${banner_image})`, border: "3px solid black"} : {};

        return (
            <div className="headerWrapper">
                <div className="headerBanner" style={banner_style}>
                    {img_element}
                </div>
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