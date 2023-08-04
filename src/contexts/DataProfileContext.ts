import {createContext} from "react";

export interface DataProfileType
{
    uuid: string;
    twitter_handle: string;
}

export interface DataProfileContextType
{
    dataProfiles: DataProfileType[];
    setDataProfiles: (dataProfiles: DataProfileType[]) => void;
}

export const DataProfileContext = createContext<DataProfileContextType>({
    dataProfiles: [],
    setDataProfiles: () => {}
});