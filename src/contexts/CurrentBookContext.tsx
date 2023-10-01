import { ReactNode, createContext, useState, useMemo } from 'react';
import { CurrentBookContextType, CurrentBookType } from '@/types';

// Set the default context value to null
export const CurrentBookContext = createContext<CurrentBookContextType | null>(null);

export const CurrentBookProvider = ({ children }: { children: ReactNode }) => {
    const [currentBook, setCurrentBook] = useState<CurrentBookType | null>(null);

    const value = useMemo(() => ({
        currentBook,
        setCurrentBook,
    }), [currentBook]);

    return (
        <CurrentBookContext.Provider value={value}>
            {children}
        </CurrentBookContext.Provider>
    );
};