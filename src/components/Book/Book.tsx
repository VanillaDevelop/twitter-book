import { TweetRenderType } from "@/types";
import "./Book.scss"
import TweetPage from "./TweetPage";

export default function Book(props: {pages: TweetRenderType[][][], preview: boolean})
{
    const page_elements = props.pages.map((page, index) => {
        return <TweetPage preview={props.preview} tweets={page} page_number={index} key={index} />;
    });

    return (
        <>
            <div className={`book ${props.preview ? "preview" : ""}`}>
                {page_elements}
            </div>
        </>
    )
}