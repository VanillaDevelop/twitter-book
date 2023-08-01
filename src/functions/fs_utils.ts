import JSZip from "jszip";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from 'uuid';

const APP_DATA_PATH = path.join(os.homedir(), "AppData", "Roaming", "TwitterBook");

export function unpackZipFile(file: File) 
{
    if(!fs.existsSync(APP_DATA_PATH))
    {
        fs.mkdirSync(APP_DATA_PATH);
    }
    let existing_profiles = {profiles: {}};
    if(fs.existsSync(path.join(APP_DATA_PATH, "dataprofiles.json")))
    {
        existing_profiles = JSON.parse(fs.readFileSync(path.join(APP_DATA_PATH, "dataprofiles.json"), "utf-8"));
    }
    
    //generate random uuid for the dataprofile
    const uuid = uuidv4();
    
    //extract zip into the new folder
    const reader = new FileReader();
    reader.onload = async () => {
        const zip = await JSZip.loadAsync(reader.result as ArrayBuffer);
        zip.forEach(async (relativePath, zipEntry) => {
        if (!zipEntry.dir) {
            const content = await zipEntry.async("nodebuffer");
            const filePath = path.join(APP_DATA_PATH, uuid, relativePath);
            fs.writeFileSync(filePath, content);
        }
        });
    };
    reader.readAsArrayBuffer(file);
}