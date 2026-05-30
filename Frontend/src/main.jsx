import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from './components/ui/sonner'
import {Provider} from 'react-redux'
import store from './redux/store.js'
import './index.css'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
    <App />
    </Provider>
    <Toaster />
  </StrictMode>,
)
