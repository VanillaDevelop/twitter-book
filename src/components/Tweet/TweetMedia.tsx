import { APP_DATA_PATH } from "@/functions/general_utils";
import { DataProfileType, MediaType, TweetMediaType } from "@/types";
import path from "path"
import "./TweetMedia.scss"

export default function TweetMedia(props: {media: TweetMediaType, dataProfile: DataProfileType}) 
{
    return (
        <div className="tweet_media_element">
            <img src={"app:///" + path.join(APP_DATA_PATH, props.dataProfile.uuid, "structured_data", "media", props.media.internal_name!)} className="tweet_media_item"/>
            {props.media.type === MediaType.Gif && <img src="images/gif-overlay.png" className="tweet_media_overlay"/>}
            {props.media.type === MediaType.Video && <img src="images/video-overlay.png" className="tweet_media_overlay"/>}
        </div>
    )
}