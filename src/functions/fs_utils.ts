import JSZip from "jszip";
import fs from "fs";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from 'uuid';

const APP_DATA_PATH = path.join(os.homedir(), "AppData", "Roaming", "TwitterBook");

export async function unpackZipFile(file: File) 
{
    if(!fs.existsSync(APP_DATA_PATH))
    {
        fs.mkdirSync(APP_DATA_PATH);
    }
    let existing_profiles = {profiles: {} as {[key: string]: string}};
    if(fs.existsSync(path.join(APP_DATA_PATH, "dataprofiles.json")))
    {
        existing_profiles = JSON.parse(fs.readFileSync(path.join(APP_DATA_PATH, "dataprofiles.json"), "utf-8"));
    }
    
    //generate random uuid for the dataprofile
    const uuid = uuidv4();

    //generate folder for the dataprofile
    fs.mkdirSync(path.join(APP_DATA_PATH, uuid));
    
    // Wrap the reader logic in a Promise
    const unpacking = new Promise<void>(async (resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const zip = await JSZip.loadAsync(reader.result as ArrayBuffer);

                // Check if the file exists within the ZIP
                const requiredFile = "data/account.js";
                if (!zip.file(requiredFile)) {
                reject(new Error(`The required file ${requiredFile} does not exist in the ZIP.`));
                return;
                }

                const promises = [] as Promise<void>[];
                zip.forEach((relativePath, zipEntry) => {
                    if (!zipEntry.dir) {
                        const promise = zipEntry.async("nodebuffer").then(content => {
                            const directoryPath = path.join(APP_DATA_PATH, uuid, path.dirname(relativePath));
                            if (!fs.existsSync(directoryPath)) {
                                fs.mkdirSync(directoryPath, { recursive: true });
                            }
                            const filePath = path.join(directoryPath, path.basename(relativePath));
                            fs.writeFileSync(filePath, content);
                        });
                        promises.push(promise);
                    }
                });
                await Promise.all(promises);
                resolve(); // Resolve the Promise when done
            } catch (error) {
                reject(error); // Reject the Promise if an error occurs
            }
        };
        reader.readAsArrayBuffer(file);
    });

    // Await the resolution of the unpacking Promise
    try
    {
        await unpacking;
    }
    catch(e)
    {
        //clean up the directory if it exists
        if(fs.existsSync(path.join(APP_DATA_PATH, uuid)))
            fs.rmdirSync(path.join(APP_DATA_PATH, uuid), {recursive: true});
        return false;
    }

    //try to extract a twitter handle, return false if not possible
    let twitter_handle : string;
    try
    {
        const account_file = fs.readFileSync(path.join(APP_DATA_PATH, uuid, "data", "account.js"), "utf-8");
        const account_json = JSON.parse(account_file.substring(account_file.indexOf("{"), account_file.lastIndexOf("}") + 1));
        twitter_handle = account_json.account.username;
    }
    catch(e)
    {
        //clean up the directory
        fs.rmdirSync(path.join(APP_DATA_PATH, uuid), {recursive: true});
        return false;
    }

    //add the new dataprofile to the existing profiles
    existing_profiles.profiles[twitter_handle] = uuid;

    //save the new dataprofile
    fs.writeFileSync(path.join(APP_DATA_PATH, "dataprofiles.json"), JSON.stringify(existing_profiles));

    console.log("Successfully unpacked zip file for user " + twitter_handle + " with uuid " + uuid + ".")
    return true;
}