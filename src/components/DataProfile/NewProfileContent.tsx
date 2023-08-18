import { useContext, useRef, useState } from "react"
import {checkFileStructure, unpackZipFile} from "../../functions/renderer_utils"
import { DataProfileContext } from "@/contexts/DataProfileContext"

export default function NewProfileContent(props : {addPopUp: (popUpText: string) => void})
{
    const fileInputRef = useRef<HTMLInputElement>(null)
    const profileContext = useContext(DataProfileContext)
    const [buttonDisabled, setButtonDisabled] = useState(false)

    const handleImportDataClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileInputChange = async () => 
    {
        //disable button
        setButtonDisabled(true);

        if(!fileInputRef.current?.files)
        {
            props.addPopUp("No file was selected.")
            setButtonDisabled(false);
            return
        }
        const file = fileInputRef.current.files[0]

        // sanity check file
        const error = await checkFileStructure(file, profileContext.dataProfiles);

        if(error)
        {
            props.addPopUp(error)
            setButtonDisabled(false);
            return;
        }

        await unpackZipFile(file, profileContext)

        //re-enable button
        setButtonDisabled(false);
    }

    return (
        <div className="profileContentWrapper">
            <p className="text-center">
                Start a new data profile by importing your Twitter data. 
                To do this, request your Twitter data from your account settings,
                then point to the .zip file. Twitter may take 24 hours or more to 
                prepare your data.
            </p>

            <button className="dataActionButton" onClick={handleImportDataClick} disabled={buttonDisabled}>Import Twitter Data</button>
            <input ref={fileInputRef} type="file" accept=".zip" style={{display: "none"}} onChange={handleFileInputChange}/>
        </div>
    )
}