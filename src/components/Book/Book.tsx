import "./Book.scss"
import TweetPage from "./TweetPage";
import TitlePage from "./TitlePage";
import { useContext } from "react";
import { CurrentBookContext } from "@/contexts/CurrentBookContext";
import React from "react";

function Book(props: {preview: boolean})
{
    const {pages, dataProfile, dateSpan} = useContext(CurrentBookContext).currentBook;

    const page_elements = pages.map((page, index) => {
        return <TweetPage preview={props.preview} tweets={page} page_number={index} key={index} />;
    });

    return (
        <>
            <div className={`book ${props.preview ? "preview" : ""}`}>
                <TitlePage preview={props.preview} dataProfile={dataProfile!} dateSpan={dateSpan} />
                {page_elements}
            </div>
        </>
    )
}

const BookPrintWrapper = React.forwardRef<HTMLDivElement, {preview: boolean}>((props, ref) => {
    return (
      <div ref={ref} className="bookWrapper">
        <Book preview={props.preview} />
      </div>
    );
});

export default  BookPrintWrapper