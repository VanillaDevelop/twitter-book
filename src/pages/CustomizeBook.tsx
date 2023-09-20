import { DataProfileContext } from '@/contexts/DataProfileContext';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import "./CustomizeBook.scss"
import { AuthorData, TweetItemType } from '@/types';
import { getAuthors, getTweets } from '@/functions/renderer_utils';
import Book from '@/components/Book/Book';

export default function CustomizeBook()
{
    const {username} = useParams();
    const {dataProfiles} = useContext(DataProfileContext)
    const [tweets, setTweets] = useState<TweetItemType[]>([]);
    const [authors, setAuthors] = useState<AuthorData[]>([]);
    const [height, setHeight] = useState(0);
    
    const dataProfile = dataProfiles.find((profile) => profile.twitter_handle === username)!;

    useEffect(() => {
        setTweets(getTweets(dataProfile.uuid));
        setAuthors(getAuthors(dataProfile.uuid));
    }, [])

    return (
        <div className="previewFrame">
            <div className="previewScale">
                <Book tweets={tweets} authors={authors} dataProfile={dataProfile} preview={true}/>
            </div>
        </div>
    )
}