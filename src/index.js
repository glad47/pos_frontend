import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import CustomerDisplayPage from './components/CusotmerDisplayPage';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/customer-display" element={<CustomerDisplayPage />} />
      <Route path="/*" element={<App />} />
    </Routes>
  </BrowserRouter>
);