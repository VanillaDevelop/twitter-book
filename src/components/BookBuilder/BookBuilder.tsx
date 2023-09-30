import { AuthorData, CurrentBookType, DataProfileType, TweetItemType, TweetRenderType } from "@/types";
import { useContext, useEffect, useRef, useState } from "react";
import "./BookBuilder.scss"
import { buildOrderedTweets } from "@/functions/react_utils";
import { CurrentBookContext } from "@/contexts/CurrentBookContext";

export default function BookBuilder(props: {tweets: TweetItemType[], authors: AuthorData[], 
                                            dataProfile: DataProfileType})
{
    const {setCurrentBook} = useContext(CurrentBookContext);
    const heightMeasureElem = useRef<HTMLDivElement>(null);
    const [measureTweet, setMeasureTweet] = useState<JSX.Element | null>(null);
    const [progress, setProgress] = useState(0);

    // Function to measure the height of a rendered tweet
    async function getTweetHeight(rendered_tweet: JSX.Element): Promise<number>
    {
        return new Promise((resolve, reject) => {
            setMeasureTweet(rendered_tweet);
            // Make sure the tweet is rendered (also known as THE BIG CHEESE)
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

    function updateBookContext(pages: TweetRenderType[][][])
    {
        const last_page = pages[pages.length - 1]
        const last_page_col = last_page[last_page.length - 1]
        const end_tweet = props.tweets.find((tweet) => tweet.id === last_page_col[last_page_col.length - 1].id)!
        //start_tweet may be removed (end_tweet must be from the author, so cannot be removed)
        let start_tweet = props.tweets.find((tweet) => tweet.id === pages[0][0][0].id)!
        //if index 0 is removed, index 1 cannot be (we don't have chains of removed tweets)
        if (!start_tweet.item) {
            start_tweet = props.tweets.find((tweet) => tweet.id === pages[0][0][1].id)!
        }
        const currentBook = {
            pages: pages,
            authors: props.authors,
            dataProfile: props.dataProfile,
            dateSpan: [start_tweet.item!.created_at, end_tweet.item!.created_at]
        } as CurrentBookType;
        setCurrentBook(currentBook);
    }

    useEffect(() => 
    {
        const get_heights = async() => 
        {
            let pages = [] as TweetRenderType[][][];
            let current_page = [] as TweetRenderType[][];
            let current_column = [] as TweetRenderType[];
            let current_height = 0;

            const ordered_tweets = buildOrderedTweets(props.tweets, props.authors, props.dataProfile);

            for (let i = 0; i < ordered_tweets.length; i++)
            {
                const tweet_item = ordered_tweets[i];
                const tweet_height = await getTweetHeight(tweet_item.rendered_item);
                tweet_item.height = tweet_height;
                if (current_height + tweet_height < 3058) //3058 is the content height of a page
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
                setProgress((i+1)/ordered_tweets.length);
            }
            //at the end, push the last column and page
            current_page.push(current_column);
            pages.push(current_page);
            updateBookContext(pages);
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
                <progress value={progress}></progress>
            </div>
        </>
    )
}