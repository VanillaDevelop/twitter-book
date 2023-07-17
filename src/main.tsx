import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './pages/App.tsx'
import Book from './pages/Book.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import Collect from './pages/Collect.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/book",
    element: <Book />
  },
  {
    path: "/collect",
    element: <Collect />
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
