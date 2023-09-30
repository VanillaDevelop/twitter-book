import {Routes, Route} from 'react-router-dom'
import Home from './pages/HomePage/Home'
import { DataProfileProvider } from "@/contexts/DataProfileContext";
import CollectProfile from './pages/CollectProfilePage/CollectProfile';
import PreviewBook from './pages/PreviewBookPage/PreviewBook';
import { CurrentBookProvider } from './contexts/CurrentBookContext';
import Book from './components/Book/Book';

export default function App() 
{
  return (
    <DataProfileProvider>
      <CurrentBookProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/collect/:username" element={<CollectProfile />} />
            <Route path="/book/:username" element={<PreviewBook />} />
            <Route path="/print" element={<Book preview={false}/>} />
          </Routes>
        </div>
      </CurrentBookProvider>
    </DataProfileProvider>
  )
}
