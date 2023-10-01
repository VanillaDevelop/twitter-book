import "./Book.scss"
import TweetPage from "./TweetPage";
import TitlePage from "./TitlePage";
import { forwardRef, useContext } from "react";
import { CurrentBookContext } from "@/contexts/CurrentBookContext";
import EmptyPage from "./EmptyPage";

function Book(props: {preview: boolean})
{
    const {pages, dataProfile, dateSpan} = useContext(CurrentBookContext).currentBook;

    const page_elements = pages.map((page, index) => {
        return <TweetPage preview={props.preview} tweets={page} page_number={index} key={page[0][0].id} />;
    });

    return (
        <>
            <div className={`book ${props.preview ? "preview" : ""}`}>
                <TitlePage preview={props.preview} dataProfile={dataProfile!} dateSpan={dateSpan} />
                <EmptyPage preview={props.preview} />
                {page_elements}
            </div>
        </>
    )
}

const BookPrintWrapper = forwardRef<HTMLDivElement, {preview: boolean}>((props, ref) => {
    return (
      <div ref={ref} className="bookWrapper">
        <Book preview={props.preview} />
      </div>
    );
});

export default  BookPrintWrapper