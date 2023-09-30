import { CurrentBookContextType, CurrentBookType } from "@/types";
import {ReactNode, createContext} from "react";
import {useState} from "react";

export const CurrentBookContext = createContext<CurrentBookContextType>({ currentBook: {pages: [], dateSpan: [new Date(), new Date()]}, setCurrentBook: () => {}, resetCurrentBook: () => {}});

export const CurrentBookProvider = ({ children }: { children: ReactNode }) => {
    const [currentBook, setCurrentBook] = useState<CurrentBookType>({pages: [], dateSpan: [new Date(), new Date()]});
    function resetCurrentBook()
    {
        setCurrentBook({pages: [], dateSpan: [new Date(), new Date()]});
    }

    return (
        <CurrentBookContext.Provider value={{ currentBook, setCurrentBook, resetCurrentBook }}>
            {children}
        </CurrentBookContext.Provider>
    );
};