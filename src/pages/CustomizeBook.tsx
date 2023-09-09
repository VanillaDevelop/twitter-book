import { DataProfileContext } from '@/contexts/DataProfileContext';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./CustomizeBook.scss"
import { AuthorData, TweetChainType } from '@/types';
import { getAuthors, getTweets } from '@/functions/renderer_utils';
import Book from '@/components/Book/Book';

export default function CustomizeBook()
{
    const {username} = useParams();
    const {dataProfiles, setDataProfiles} = useContext(DataProfileContext)
    const [tweets, setTweets] = useState<TweetChainType[]>([]);
    const [authors, setAuthors] = useState<AuthorData[]>([]);
    
    const dataProfile = dataProfiles.find((profile) => profile.twitter_handle === username)!;

    useEffect(() => {
        setTweets(getTweets(dataProfile.uuid));
        setAuthors(getAuthors(dataProfile.uuid));
    }, [])


    return (
        <div className="splitFrame">
            <div className="splitFrame__left">
                <h1 className="text-center">Settings for {username}</h1>
            </div>
            <div className="splitFrame__right">
                <Book tweets={tweets} authors={authors} dataProfile={dataProfile}/>
            </div>
        </div>
    )
}