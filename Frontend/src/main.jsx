import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Toaster } from './components/ui/sonner'
import { Provider } from 'react-redux'
import { ThemeProvider } from "@material-tailwind/react"
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './redux/store'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </ThemeProvider>
    </Provider>
    <Toaster />
  </StrictMode>
)