import { setBaseUrl } from '@workspace/api-client-react';
import { createRoot } from 'react-dom/client';
import { z } from 'zod';

import App from './App';

import './index.css';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (apiBaseUrl) {
  setBaseUrl(z.string().url().parse(apiBaseUrl));
}

createRoot(document.getElementById('root')!).render(<App />);
