import { DataProfileType, TweetRenderType } from "@/types";
import "./Book.scss"
import TweetPage from "./TweetPage";
import TitlePage from "./TitlePage";

export default function Book(props: {pages: TweetRenderType[][][], preview: boolean, dataProfile: DataProfileType, dateSpan: [Date, Date]})
{
    const page_elements = props.pages.map((page, index) => {
        return <TweetPage preview={props.preview} tweets={page} page_number={index} key={index} />;
    });

    return (
        <>
            <div className={`book ${props.preview ? "preview" : ""}`}>
                <TitlePage preview={props.preview} dataProfile={props.dataProfile} dateSpan={props.dateSpan} />
                {page_elements}
            </div>
        </>
    )
}