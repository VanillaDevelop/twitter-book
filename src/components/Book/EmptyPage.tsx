export default function EmptyPage(props: {preview: boolean})
{
    return (
        <div className={`page ${props.preview ? "preview" : ""}`}>
            <div className="pageContent even">
            </div>
        </div>
    );
}