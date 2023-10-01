import { DataProfileContext } from '@/contexts/DataProfileContext';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "./PreviewBook.scss"
import { AuthorData, TweetItemType } from '@/types';
import { getAuthors, getTweets } from '@/functions/renderer_utils';
import Book from '@/components/Book/Book';
import BookBuilder from '@/components/BookBuilder/BookBuilder';
import { CurrentBookContext } from '@/contexts/CurrentBookContext';
import {useReactToPrint} from 'react-to-print';

export default function PreviewBook()
{
    const {username} = useParams();
    const {dataProfiles} = useContext(DataProfileContext)!
    const [tweets, setTweets] = useState<TweetItemType[]>([]);
    const [authors, setAuthors] = useState<AuthorData[]>([]);
    const {currentBook} = useContext(CurrentBookContext)!;
    const navigate = useNavigate();
    const [printing, setPrinting] = useState(false);
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        pageStyle: `@page { size: 2480px 3508px; margin: 0 !important; padding: 0 !important;}`,
        onAfterPrint: () => setPrinting(false),
    });

    function printBook() {
        setPrinting(true);
        handlePrint();
    }

    const dataProfile = dataProfiles.find((profile) => profile.twitter_handle === username)!;

    useEffect(() => {
            setTweets(getTweets(dataProfile.uuid));
            setAuthors(getAuthors(dataProfile.uuid));
        }
    , []);

    return (
        <div className="h-100">
        {currentBook && 
            <>
            <button className="backButton" onClick={() => navigate("/")} disabled={printing} />
            <button className="printButton" onClick={printBook} disabled={printing}/>
            
            <div className="previewFrame">
                <div className="previewScale">
                    <Book preview={true}/>
                </div>
            </div>
            <div className="hiddenBook">
                <Book ref={componentRef} preview={false}/>
            </div>
            </>
        }
        {!currentBook && tweets.length > 0 && <BookBuilder tweets={tweets} authors={authors} dataProfile={dataProfile}/>}
        </div>
    )
}