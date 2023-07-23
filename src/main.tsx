import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.scss'
import {HashRouter} from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </HashRouter>,
)

postMessage({ payload: 'removeLoading' }, '*')
