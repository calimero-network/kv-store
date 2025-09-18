import React, { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';

import HomePage from './pages/home';
import Authenticate from './pages/login/Authenticate';

export default function App() {
  const [clientAppId] = useState<string>(
    '8seLjoBTEZS9odraP9ePZvYCXEFw5bsbyyRxafXqrMEy',
  );

  return (
    <CalimeroProvider
      clientApplicationId={clientAppId}
      applicationPath={window.location.pathname || '/'}
      mode={AppMode.MultiContext}
    >
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Authenticate />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </CalimeroProvider>
  );
}
