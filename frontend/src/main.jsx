import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import { Toaster } from './components/ui/sonner'
import store, { persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import { Provider } from 'react-redux'

createRoot(document.getElementById('root')).render(
  <StrictMode>
  <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
  <BrowserRouter>
   <App />
<Toaster />
   </BrowserRouter>
   </PersistGate>
  </Provider>
  </StrictMode>,
)
