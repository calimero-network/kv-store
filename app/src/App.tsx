import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { CalimeroProvider, AppMode } from '@calimero-network/calimero-client';
import { ToastProvider } from '@calimero-network/mero-ui';

import HomePage from './pages/home';
import Authenticate from './pages/login/Authenticate';

export default function App() {
  return (
    <CalimeroProvider
      packageName={import.meta.env.VITE_PACKAGE_NAME || 'com.calimero.kv-store'}
      registryUrl={import.meta.env.VITE_REGISTRY_URL || 'https://apps.calimero.network'}
      mode={AppMode.SingleContext}
    >
      <ToastProvider>
        <BrowserRouter basename="/">
          <Routes>
            <Route path="/" element={<Authenticate />} />
            <Route path="/home" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </CalimeroProvider>
  );
}
