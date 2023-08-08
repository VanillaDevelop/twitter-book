import { useContext, useRef } from "react"
import "./NewProfileContent.scss"
import {checkFileStructure, unpackZipFile} from "../../functions/fs_utils"
import { DataProfileContext } from "@/contexts/DataProfileContext"

export default function NewProfileContent(props : {addPopUp: (popUpText: string) => void})
{
    const fileInputRef = useRef<HTMLInputElement>(null)

    const profileContext = useContext(DataProfileContext)

    const handleImportDataClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileInputChange = async () => 
    {
        if(!fileInputRef.current?.files)
        {
            props.addPopUp("No file was selected.")
            return
        }
        const file = fileInputRef.current.files[0]

        // sanity check file
        const error = await checkFileStructure(file, profileContext.dataProfiles);

        if(error)
        {
            props.addPopUp(error)
            return;
        }

        const valid = unpackZipFile(file, profileContext)
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