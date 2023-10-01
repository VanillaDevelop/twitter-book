import { DataProfileContextType, DataProfileType } from "@/types";
import {ReactNode, createContext, useEffect, useMemo, useState} from "react";
import fs from "fs";
import path from "path";
import { APP_DATA_PATH } from "@/functions/general_utils";

export const DataProfileContext = createContext<DataProfileContextType | null>(null);

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

    const value = useMemo(() => ({ dataProfiles, setDataProfiles: setProfilesExternal }), [dataProfiles]);

    return (
        <DataProfileContext.Provider value={value}>
            {children}
        </DataProfileContext.Provider>
    );
};