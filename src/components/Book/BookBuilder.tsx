import { AuthorData, DataProfileType, TweetItemType, TweetRelation, TweetRenderType } from "@/types";
import { useEffect, useRef, useState } from "react";
import DisplayTweet from "./DisplayTweet";
import RemovedTweet from "./RemovedTweet";
import "./BookBuilder.scss"

/**
 * Recursively builds a chain of child-tweets, starting with the given tweet
 * @param tweet The tweet to start the chain with
 * @param tweets A list of all tweets, in data representation
 * @param tweet_children A dictionary that maps tweet ids to their children
 * @param authors A list of all authors
 * @param dataProfile The data profile for the book
 * @param prev_relation The relation to the previous tweet in the chain
 * @param prev_chain The chain of tweets that have already been built
 * @returns A chain of tweets, in rendered representation
 */
function buildTweetChain(tweet: TweetItemType, tweets: TweetItemType[], tweet_children: {[key: string]: {tweet: string, relation: TweetRelation}[]}, 
                        authors: AuthorData[], dataProfile: DataProfileType, prev_relation: TweetRelation = TweetRelation.None,
                        prev_chain?: TweetRenderType[]): TweetRenderType[]
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
        const author_handle = tweet.item!.direct_rt_author_handle ?? tweet.item!.author_handle
        const relation = tweet.item?.direct_rt_author_handle ? TweetRelation.Retweet : prev_relation
        const author = authors.find((author) => author.handle === author_handle)!;
        rendered_tweet = <DisplayTweet tweet={tweet.item} author={author} dataProfile={dataProfile} 
                            standalone={(tweet_children[tweet.id]?.length ?? 0) == 0} prev_relation={relation} />
    }
    tweet_chain.push({
        id: tweet.id,
        height: 0,
        rendered_item: rendered_tweet,
    } as TweetRenderType);

    //add the children in a depth first manner
    const children = tweet_children[tweet.id];
    //sorted by creation date, oldest first
    children?.sort((a, b) => {
        const a_time = tweets.find((tweet) => tweet.id === a.tweet)?.item?.created_at.getTime() ?? 0;
        const b_time = tweets.find((tweet) => tweet.id === b.tweet)?.item?.created_at.getTime() ?? 0;
        return a_time - b_time;
    });
    for (let i = 0; i < children?.length ?? 0; i++)
    {
        const child_tweet = tweets.find((tweet) => tweet.id === children[i].tweet)!;
        const child_relation = children[i].relation;
        buildTweetChain(child_tweet, tweets, tweet_children, authors, dataProfile, child_relation, tweet_chain);
    }
    return tweet_chain;
}

/**
 * Builds and returns the tweets in order of their appearance in the book.
 * @param tweets A list of all tweets, in data representation
 * @param authors A list of all authors
 * @param dataProfile The data profile for the book
 * @returns A list of tweets, in rendered representation
 */
function buildOrderedTweets(tweets: TweetItemType[], authors: AuthorData[], dataProfile: DataProfileType): TweetRenderType[]
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
        const top_level_tweets = tweets.filter((tweet) => !tweet.item || (!tweet.item.parent_tweet_id && !tweet.item.qrt_tweet_source_id)).sort((a, b) => {
            //if the tweet is null (removed), use the creation date of the first child
            const a_time = a.item?.created_at.getTime() ?? tweets.filter((tweet) => tweet.id === tweet_children[a.id][0].tweet)[0].item!.created_at.getTime();
            const b_time = b.item?.created_at.getTime() ?? tweets.filter((tweet) => tweet.id === tweet_children[b.id][0].tweet)[0].item!.created_at.getTime();
            return a_time - b_time;
        });

        //Build all tweet chains and flatten them into a single list
        const tweet_elements = top_level_tweets.map((tweet) => buildTweetChain(tweet, tweets, tweet_children, authors, dataProfile)).flat();

        return tweet_elements;
    }

export default function BookBuilder(props: {tweets: TweetItemType[], authors: AuthorData[], dataProfile: DataProfileType, bookCallback: (pages: TweetRenderType[][][]) => void})
{
    const [pages, setPages] = useState([] as TweetRenderType[][][]);
    const heightMeasureElem = useRef<HTMLDivElement>(null);
    const [measureTweet, setMeasureTweet] = useState<JSX.Element | null>(null);
    const [progress, setProgress] = useState(0);
    const [tweetCount, setTweetCount] = useState(100);

    // Function to measure tweet height
    const getTweetHeight = async (rendered_tweet: JSX.Element): Promise<number> => {
        return new Promise((resolve, reject) => {
            setMeasureTweet(rendered_tweet);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const elem = heightMeasureElem.current!;
                    const computedStyle = window.getComputedStyle(elem);
                    const height = elem.offsetHeight;
                    const marginTop = parseFloat(computedStyle.marginTop);
                    const marginBottom = parseFloat(computedStyle.marginBottom);
                    const totalHeight = height + marginTop + marginBottom;
                    resolve(totalHeight);
                })
            })
        })
    };

    useEffect(() => 
    {
        const get_heights = async() => {
            let pages = [] as TweetRenderType[][][];
            let current_page = [] as TweetRenderType[][];
            let current_column = [] as TweetRenderType[];
            let current_height = 0;

            const ordered_tweets = buildOrderedTweets(props.tweets, props.authors, props.dataProfile);
            setTweetCount(ordered_tweets.length);

            for (let i = 0; i < ordered_tweets.length; i++)
            {
                const tweet_item = ordered_tweets[i];
                const tweet_height = await getTweetHeight(tweet_item.rendered_item);
                tweet_item.height = tweet_height;
                if (current_height + tweet_height < 3058)
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
                setProgress(i+1);
            }
            //at the end, push the last column and page
            current_page.push(current_column);
            pages.push(current_page);
            setPages(pages);
            props.bookCallback(pages);
        }
        get_heights();
    }, [props.tweets])

    return (
        <>
            <div className="heightMeasure" ref={heightMeasureElem}>
                {measureTweet}
            </div>
            <div className="progress_section">
                <h1> Building Your Tweets </h1>
                <h3> This may take a while, please wait... </h3>
                <progress value={progress / tweetCount}></progress>
            </div>
        </>
    )
}