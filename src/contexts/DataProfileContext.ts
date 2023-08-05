import { DataProfileContextType } from "@/types";
import {createContext} from "react";

export const DataProfileContext = createContext<DataProfileContextType>({
    dataProfiles: [],
    setDataProfiles: () => {}
});