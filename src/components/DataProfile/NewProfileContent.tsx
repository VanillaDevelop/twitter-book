import { useRef } from "react"
import "./NewProfileContent.scss"

export default function NewProfileContent()
{
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImportDataClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileInputChange = () => {
        if(fileInputRef.current?.files)
        {
            const file = fileInputRef.current.files[0]
            console.log(file)
        }
    }

    return (
        <div className="newProfileContentWrapper">
            <p className="uploadNewDataParagraph">
                Start a new data profile by importing your Twitter data. 
                To do this, request your Twitter data from your account settings,
                then point to the .zip file. Twitter may take 24 hours or more to 
                prepare your data.
            </p>
            <button className="importDataButton" onClick={handleImportDataClick}>Import Twitter Data</button>
            <input ref={fileInputRef} type="file" accept=".zip" style={{display: "none"}} onChange={handleFileInputChange}/>
        </div>
    )
}