import { DataProfileContext } from '@/contexts/DataProfileContext';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./CustomizeBook.scss"
import { AuthorData, TweetItemType, TweetRenderType } from '@/types';
import { getAuthors, getTweets } from '@/functions/renderer_utils';
import Book from '@/components/Book/Book';
import BookBuilder from '@/components/Book/BookBuilder';

export default function CustomizeBook()
{
    const {username} = useParams();
    const {dataProfiles} = useContext(DataProfileContext)
    const [tweets, setTweets] = useState<TweetItemType[]>([]);
    const [authors, setAuthors] = useState<AuthorData[]>([]);
    const [pages, setPages] = useState<TweetRenderType[][][] | null>(null)
    const [dateSpan, setDateSpan] = useState<[Date, Date]>([new Date(), new Date()])
    
    const updatePages = (pages: TweetRenderType[][][]) => {
        const last_page = pages[pages.length - 1]
        const last_page_col = last_page[last_page.length - 1]
        const end_tweet = tweets.find((tweet) => tweet.id === last_page_col[last_page_col.length - 1].id)!
        //start_tweet may be removed (end_tweet must be from the author, so cannot be removed)
        let start_tweet = tweets.find((tweet) => tweet.id === pages[0][0][0].id)!
        //if index 0 is removed, index 1 cannot be (we don't have chains of removed tweets)
        if (!start_tweet.item) {
            start_tweet = tweets.find((tweet) => tweet.id === pages[0][0][1].id)!
        }
        setDateSpan([start_tweet.item!.created_at, end_tweet.item!.created_at])
        setPages(pages);
    }

    const dataProfile = dataProfiles.find((profile) => profile.twitter_handle === username)!;

    useEffect(() => {
        setTweets(getTweets(dataProfile.uuid));
        setAuthors(getAuthors(dataProfile.uuid));
    }, [])

    return (
        <div className="h-100">
        {pages && 
            <div className="previewFrame">
                <div className="previewScale">
                    <Book pages={pages} preview={true} dataProfile={dataProfile} dateSpan={dateSpan}/>
                </div>
            </div>}
        {pages === null && tweets.length > 0 && <BookBuilder tweets={tweets} authors={authors} dataProfile={dataProfile} bookCallback={updatePages}/>}
        </div>
    )
}