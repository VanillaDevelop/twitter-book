import Book from '@/components/Book/Book';
import { CurrentBookContext } from '@/contexts/CurrentBookContext';
import { useContext } from 'react';

export default function PrintBook()
{
    const {pages, dataProfile, dateSpan} = useContext(CurrentBookContext).currentBook

    return (
        <Book pages={pages} preview={false} dataProfile={dataProfile!} dateSpan={dateSpan} />
    );
};