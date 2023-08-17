import { loadAllUserTweets } from "@/functions/renderer_utils";
import TweetPage from "../components/TweetPage/TweetPage";
import { TweetType } from "@/types";
import { useEffect, useState } from "react";

export default function Book(uuid: string) 
{
  const [tweets, setTweets] = useState<TweetType[]>([]);
  
  useEffect(() => {
      setTweets(loadAllUserTweets(uuid));
  }, [uuid]);

  //map 10 tweets to one TweetPage each
  const generateTweetPages = (tweets: TweetType[]) => 
  {
    const numOfPages = Math.ceil(tweets.length / 10);
  
    return Array.from({ length: numOfPages }).map((_, index) => {
      const start = index * 10;
      const end = start + 10;
      const tweetPageTweets = tweets.slice(start, end);
  
      return <TweetPage renderBorder={true} tweets={tweetPageTweets} />;
    });
  };
  
  const tweetPages = generateTweetPages(tweets);


  return (
    <>
      {tweetPages}
    </>
  )
}
