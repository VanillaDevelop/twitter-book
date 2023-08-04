import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Collect from './pages/Collect'
import Book from './pages/Book'
import { useState, useEffect } from "react";
import { DataProfileContext, DataProfileContextType, DataProfileType } from "@/contexts/DataProfileContext";
import { getProfiles } from './functions/fs_utils';

export default function App() {

  const [dataProfiles, setDataProfiles] = useState([] as DataProfileType[])

  //on initial load, load data profiles from file if there are any
  useEffect(() => {
    setDataProfiles(getProfiles())
  }, [])

  return (
    <DataProfileContext.Provider value={{dataProfiles, setDataProfiles} as DataProfileContextType}>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collect" element={<Collect />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </div>
        </DataProfileContext.Provider>
  )
}
