import React from 'react';
import ReactDOM from 'react-dom/client';  // ✅ Add this import
import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import { store } from "./store";
import { BrowserRouter } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SocketProvider>
    </Provider>
  </React.StrictMode>
);