import { DataProfileContextType, DataProfileType } from "@/types";
import {ReactNode, createContext, useEffect} from "react";
import fs from "fs";
import path from "path";
import os from "os";
import {useState} from "react";

export const APP_DATA_PATH = path.join(os.homedir(), "AppData", "Roaming", "TwitterBook");

if(!fs.existsSync(APP_DATA_PATH))
{
    fs.mkdirSync(APP_DATA_PATH);
}

export const DataProfileContext = createContext<DataProfileContextType>({ dataProfiles: [], setDataProfiles: () => {} });

export const DataProfileProvider = ({ children }: { children: ReactNode }) => {
    const [dataProfiles, setDataProfiles] = useState<DataProfileType[]>([]);

    const setProfilesExternal = (profiles: DataProfileType[]) => {
        setDataProfiles(profiles);
        //save to file
        fs.writeFileSync(path.join(APP_DATA_PATH, "dataprofiles.json"), JSON.stringify(profiles));
    };

    useEffect(() => {
        if (!fs.existsSync(APP_DATA_PATH)) {
            fs.mkdirSync(APP_DATA_PATH);
        }

        let existing_profiles = [];

        if (fs.existsSync(path.join(APP_DATA_PATH, "dataprofiles.json"))) {
            existing_profiles = JSON.parse(fs.readFileSync(path.join(APP_DATA_PATH, "dataprofiles.json"), "utf-8"));
            setDataProfiles(existing_profiles);
        }
    }, []);

    return (
        <DataProfileContext.Provider value={{ dataProfiles, setDataProfiles: setProfilesExternal }}>
            {children}
        </DataProfileContext.Provider>
    );
};