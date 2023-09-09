import { AuthorData, DataProfileType, TweetChainType } from "@/types";
import TweetChain from "./TweetChain";
import "./Book.scss"

export default function Book(props: {tweets: TweetChainType[], authors: AuthorData[], dataProfile: DataProfileType})
{
    return (
        <div className="book">
            {props.tweets.map((chain) => <TweetChain tweets={chain} authors={props.authors} dataProfile={props.dataProfile} />)}
        </div>
    )
}