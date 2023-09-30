import { DataProfileContext } from '@/contexts/DataProfileContext';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import "./PreviewBook.scss"
import { AuthorData, CurrentBookType, TweetItemType } from '@/types';
import { getAuthors, getTweets } from '@/functions/renderer_utils';
import Book from '@/components/Book/Book';
import BookBuilder from '@/components/BookBuilder/BookBuilder';
import { CurrentBookContext } from '@/contexts/CurrentBookContext';
import {useReactToPrint} from 'react-to-print';

export default function PreviewBook()
{
    const {username} = useParams();
    const {dataProfiles} = useContext(DataProfileContext)
    const [tweets, setTweets] = useState<TweetItemType[]>([]);
    const [authors, setAuthors] = useState<AuthorData[]>([]);
    const {currentBook, setCurrentBook} = useContext(CurrentBookContext);
    const [preview, setPreview] = useState(true); 
    const navigate = useNavigate();
    const componentRef = useRef(null);
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        pageStyle: `@page { size: 2480px 3508px; margin: 0 !important; padding: 0 !important;}`,
    });

    function printBook() {
        setPreview(false);
        //THE BIG CHEESE ONCE AGAIN
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                handlePrint();
                setPreview(true);
            })
        })
    }

    const dataProfile = dataProfiles.find((profile) => profile.twitter_handle === username)!;

    useEffect(() => {
            //reset the current book
            const emptyBook = {
                pages: [],
                authors: [],
                dataProfile: dataProfile,
                dateSpan: [new Date(), new Date()]
            } as CurrentBookType;
            setCurrentBook(emptyBook);
            setTweets(getTweets(dataProfile.uuid));
            setAuthors(getAuthors(dataProfile.uuid));
        }
    , []);

    return (
        <div className="h-100">
        {currentBook.pages.length > 0 && 
            <>
            <button className="backButton" onClick={() => navigate("/") } />
            <button className="printButton" onClick={printBook} />
            
            <div className="previewFrame">
                <div className="previewScale">
                    <Book preview={preview} ref={componentRef}/>
                </div>
            </div>
            </>
        }
        {currentBook.pages.length == 0 && tweets.length > 0 && <BookBuilder tweets={tweets} authors={authors} dataProfile={dataProfile}/>}
        </div>
    )
}