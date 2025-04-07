import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App.js'
import './global.css'

// biome-ignore lint/style/noNonNullAssertion: react template
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
