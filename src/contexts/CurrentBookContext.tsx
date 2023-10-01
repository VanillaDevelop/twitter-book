import { CurrentBookContextType, CurrentBookType } from "@/types";
import {ReactNode, createContext, useState, useMemo} from "react";

export const CurrentBookContext = createContext<CurrentBookContextType>({ currentBook: {pages: [], dateSpan: [new Date(), new Date()]}, setCurrentBook: () => {}, resetCurrentBook: () => {}});

export const CurrentBookProvider = ({ children }: { children: ReactNode }) => {
    const [currentBook, setCurrentBook] = useState<CurrentBookType>({pages: [], dateSpan: [new Date(), new Date()]});
    
    function resetCurrentBook()
    {
        setCurrentBook({pages: [], dateSpan: [new Date(), new Date()]});
    }

    const value = useMemo(() => {
        return { currentBook, setCurrentBook, resetCurrentBook };
    }
    , [currentBook]);

    return (
        <CurrentBookContext.Provider value={value}>
            {children}
        </CurrentBookContext.Provider>
    );
};