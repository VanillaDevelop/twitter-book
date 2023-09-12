import { AuthorData, DataProfileType, TweetItemType, TweetRelation, TweetRenderType } from "@/types";
import "./Book.scss"
import { useEffect, useState } from "react";
import TweetPage from "./TweetPage";
import DisplayTweet from "./DisplayTweet";
import RemovedTweet from "./RemovedTweet";
import { createPortal, render, unmountComponentAtNode } from "react-dom";
import { createRoot } from "react-dom/client";

export default function Book(props: {tweets: TweetItemType[], authors: AuthorData[], dataProfile: DataProfileType, preview: boolean})
{
    const [pages, setPages] = useState([] as TweetRenderType[][][]);

    function getTweetHeight(rendered_tweet: JSX.Element): Promise<number> {
        return new Promise((resolve) => {
          const offDomEl = document.createElement('div');
          document.body.appendChild(offDomEl); // Temporarily attach to the DOM
          
          const MeasureComponent = () => {
            useEffect(() => {
              const height = offDomEl.offsetHeight;
              const computedStyle = window.getComputedStyle(offDomEl);
              const marginTop = parseFloat(computedStyle.marginTop);
              const marginBottom = parseFloat(computedStyle.marginBottom);
              resolve(height + marginTop + marginBottom);
              
              // Cleanup
              document.body.removeChild(offDomEl);
            }, []);
      
            return rendered_tweet;
          };
      
          const root = createRoot(offDomEl);
          root.render(<MeasureComponent />);
        });
    }

    useEffect(() => 
    {
        const get_heights = async() => {
            let pages = [] as TweetRenderType[][][];
            let current_page = [] as TweetRenderType[][];
            let current_column = [] as TweetRenderType[];
            let current_height = 0;
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
                const tweet_height = await getTweetHeight(rendered_tweet);
                const tweet_data = {
                    id: tweet_item.id,
                    height: tweet_height,
                    rendered_item: rendered_tweet,
                    prev_relation: TweetRelation.None
                }
                if (current_height + tweet_height < 3400)
                {
                    current_column.push(tweet_data);
                    current_height += tweet_height;
                }
                else
                {
                    current_page.push(current_column);
                    if(current_page.length === 3)
                    {
                        pages.push(current_page);
                        current_page = [];
                    }
                    current_column = [];
                    current_height = 0;
                    current_column.push(tweet_data);
                    current_height += tweet_data.height;
                }
            }
            //at the end, push the last column and page
            current_page.push(current_column);
            pages.push(current_page);
            setPages(pages);
        }
        get_heights();
    }, [props.tweets])

    const page_elements = pages.map((page) => {
        return <TweetPage preview={props.preview} tweets={page} key={pages.indexOf(page)} />;
    });

    return (
        <div className="book">
            {page_elements}
        </div>
    )
}