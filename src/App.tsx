import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Collect from './pages/Collect'
import Book from './pages/Book'
import { DataProfileProvider } from "@/contexts/DataProfileContext";
export default function App() 
{
  return (
    <DataProfileProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/collect" element={<Collect />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </div>
    </DataProfileProvider>
  )
}
