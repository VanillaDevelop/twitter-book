import { Tweet } from "@the-convocation/twitter-scraper";

export default function DisplayTweet(props: {tweet : Tweet})
{
    return (
        <div className="tweet">
            {props.tweet.text && <span>{props.tweet.text}</span>}
            {props.tweet.photos && props.tweet.photos.map((photo, index) => {
                return (
                    <img key={index} src={photo.url} alt="Tweet Image" />
                )
            })}
        </div>
    )
}