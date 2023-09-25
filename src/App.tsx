import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import { DataProfileProvider } from "@/contexts/DataProfileContext";
import CollectProfile from './pages/CollectProfile';
import CustomizeBook from './pages/CustomizeBook';
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
            <Route path="/book/:username" element={<CustomizeBook />} />
            <Route path="/print" element={<Book preview={false}/>} />
          </Routes>
        </div>
      </CurrentBookProvider>
    </DataProfileProvider>
  )
}
