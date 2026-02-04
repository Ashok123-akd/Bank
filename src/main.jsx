import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './provider/AuthContextProvider';

import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   
      <AuthProvider >

    <BrowserRouter>
      <App />
    </BrowserRouter>
    </AuthProvider >
  </StrictMode>,
)
