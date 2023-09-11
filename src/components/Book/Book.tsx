import { AuthorData, DataProfileType, TweetItemType, TweetRelation, TweetRenderType } from "@/types";
import "./Book.scss"
import { useEffect, useState } from "react";
import TweetPage from "./TweetPage";
import DisplayTweet from "./DisplayTweet";
import RemovedTweet from "./RemovedTweet";

export default function Book(props: {tweets: TweetItemType[], authors: AuthorData[], dataProfile: DataProfileType, preview: boolean})
{
    const [pages, setPages] = useState([] as TweetRenderType[][]);

    useEffect(() => {
        let pages = [] as TweetRenderType[][];
        let current_page = [] as TweetRenderType[];
        for (let i = 0; i < props.tweets.length; i++)
        {
            const tweet_item = props.tweets[i];
            let rendered_tweet;
            if(tweet_item.item === null) rendered_tweet = <RemovedTweet />
            else 
            {
                const author = props.authors.find((author) => author.handle === tweet_item.item!.author_handle)!;
                rendered_tweet = <DisplayTweet tweet={tweet_item.item} author={author} dataProfile={props.dataProfile}/>
            }
            const tweet_data = {
                id: tweet_item.id,
                height: 600,
                rendered_item: rendered_tweet,
                prev_relation: TweetRelation.None
            }
            current_page.push(tweet_data);
            if (current_page.length === 10)
            {
                pages.push(current_page);
                current_page = [];
            }
        }
        setPages(pages);
    }, [props.tweets])

    const page_elements = pages.map((page) => {
        return <TweetPage preview={props.preview} tweets={page} key={page[0].id} />;
    });

    return (
        <div className="book">
            {page_elements}
        </div>
    )
}