import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Collect from './pages/Collect'
import Book from './pages/Book'
import { DataProfileProvider } from "@/contexts/DataProfileContext";
import CollectProfile from './pages/CollectProfile';

export default function App() 
{
  return (
    <DataProfileProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collect" element={<Collect />} />
          <Route path="/collect/:username" element={<CollectProfile />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </div>
    </DataProfileProvider>
  )
}
