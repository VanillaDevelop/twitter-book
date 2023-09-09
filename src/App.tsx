import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import { DataProfileProvider } from "@/contexts/DataProfileContext";
import CollectProfile from './pages/CollectProfile';
import CustomizeBook from './pages/CustomizeBook';

export default function App() 
{
  return (
    <DataProfileProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collect/:username" element={<CollectProfile />} />
          <Route path="/book/:username" element={<CustomizeBook />} />
        </Routes>
      </div>
    </DataProfileProvider>
  )
}
