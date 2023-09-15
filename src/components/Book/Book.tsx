import { AuthorData, DataProfileType, TweetItemType, TweetRelation, TweetRenderType } from "@/types";
import "./Book.scss"
import { useEffect, useState } from "react";
import TweetPage from "./TweetPage";
import DisplayTweet from "./DisplayTweet";
import RemovedTweet from "./RemovedTweet";
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

    function orderTweets(tweets: TweetItemType[]): TweetRenderType[]
    {
        //create a dictionary that maps tweet ids to their children
        const tweet_children = {} as {[key: string]: {tweet: string, relation: TweetRelation}[]};
        tweets.forEach((tweet) => {
            let parent_id, relation;
            if(tweet.item?.qrt_tweet_source_id)
            {
                parent_id = tweet.item?.qrt_tweet_source_id;
                relation = TweetRelation.Quote;
            }
            else if(tweet.item?.parent_tweet_id)
            {
                parent_id = tweet.item?.parent_tweet_id;
                relation = TweetRelation.Reply;
            }
            else
            {
                parent_id = null;
                relation = TweetRelation.None;
            }

            if(parent_id)
            {
                if(tweet_children[parent_id])
                {
                    tweet_children[parent_id].push({tweet: tweet.id, relation: relation});
                }
                else
                {
                    tweet_children[parent_id] = [{tweet: tweet.id, relation: relation}];
                }
            }
        });

        //get top level tweets, sorted by creation date
        const top_level_tweets = tweets.filter((tweet) => tweet.item && !tweet.item.parent_tweet_id && !tweet.item.qrt_tweet_source_id).sort((a, b) => {
            return a.item!.created_at.getTime() - b.item!.created_at.getTime();
        });

        const tweet_elements = top_level_tweets.map((tweet) => buildTweetChain(tweet, tweet_children)).flat();
        return tweet_elements;
    }

    function buildTweetChain(tweet: TweetItemType, tweet_children: {[key: string]: {tweet: string, relation: TweetRelation}[]}, prev_relation: TweetRelation = TweetRelation.None, prev_chain?: TweetRenderType[]): TweetRenderType[]
    {
        const tweet_chain = prev_chain ?? [] as TweetRenderType[];
        //add the current tweet to the chain
        let rendered_tweet : React.ReactNode;
        if(tweet.item === null) 
        {
            rendered_tweet = <RemovedTweet prev_relation={prev_relation}/>
        }
        else 
        {
            const author = props.authors.find((author) => author.handle === tweet.item!.author_handle)!;
            rendered_tweet = <DisplayTweet tweet={tweet.item} author={author} dataProfile={props.dataProfile} prev_relation={prev_relation}/>
        }
        tweet_chain.push({
            id: tweet.id,
            height: 0,
            rendered_item: rendered_tweet,
        } as TweetRenderType);

        //add the children in a depth first manner
        const children = tweet_children[tweet.id];
        for (let i = 0; i < children?.length ?? 0; i++)
        {
            const child_tweet = props.tweets.find((tweet) => tweet.id === children[i].tweet)!;
            const child_relation = children[i].relation;
            buildTweetChain(child_tweet, tweet_children, child_relation, tweet_chain);
        }

        return tweet_chain;
    }

    useEffect(() => 
    {
        const get_heights = async() => {
            let pages = [] as TweetRenderType[][][];
            let current_page = [] as TweetRenderType[][];
            let current_column = [] as TweetRenderType[];
            let current_height = 0;

            const ordered_tweets = orderTweets(props.tweets);

            for (let i = 0; i < ordered_tweets.length; i++)
            {
                const tweet_item = ordered_tweets[i];
                const tweet_height = await getTweetHeight(tweet_item.rendered_item);
                tweet_item.height = tweet_height;
                if (current_height + tweet_height < 3400)
                {
                    current_column.push(tweet_item);
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
                    current_column.push(tweet_item);
                    current_height += tweet_item.height;
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