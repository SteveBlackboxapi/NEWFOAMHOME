import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerMediaCache } from './lib/mediaCache'
import { registerWebsiteUpdates } from './lib/websiteUpdates'

registerMediaCache()
registerWebsiteUpdates()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
