import { useContext, useRef, useState } from "react"
import {isValidTwitterFile, tryAddProfile} from "../../functions/renderer_utils"
import { DataProfileContext } from "@/contexts/DataProfileContext"

export default function NewProfileContent(props : {addPopUp: (popUpText: string) => void})
{
    const fileInputRef = useRef<HTMLInputElement>(null)
    const profileContext = useContext(DataProfileContext)!
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
        const {valid, value} = await isValidTwitterFile(file);
        if(!valid)
        {
            props.addPopUp(value)
            setButtonDisabled(false);
            return;
        }

        // check if a profile with the Twitter handle already exists
        if(profileContext.dataProfiles.find(profile => profile.twitter_handle === value))
        {
            props.addPopUp("A profile with this Twitter handle already exists.")
            setButtonDisabled(false);
            return;
        }

        const profile = await tryAddProfile(file)


        if(profile)
        {
            profileContext.setDataProfiles([...profileContext.dataProfiles, profile])
        }
        else
        {
            props.addPopUp("An error occurred while creating the profile.")
        }

        //re-enable button
        setButtonDisabled(false);
    }

    return (
        <div className="profileContentWrapper">
            <p className="text-center">
                Start a new data profile by importing your Twitter data. 
                To do this, download your Twitter data from your account settings,
                then import the .zip file. 
            </p>

            <button className="dataActionButton" onClick={handleImportDataClick} disabled={buttonDisabled}>Import Twitter Data</button>
            <input ref={fileInputRef} type="file" accept=".zip" style={{display: "none"}} onChange={handleFileInputChange}/>
        </div>
    )
}