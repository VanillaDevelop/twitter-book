import './App.scss'
import {Routes, Route} from 'react-router-dom'
import Home from './pages/Home'
import Collect from './pages/Collect'
import Book from './pages/Book'

export default function App() {

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/collect" element={<Collect />} />
        <Route path="/book" element={<Book />} />
      </Routes>
    </div>
  )
}
