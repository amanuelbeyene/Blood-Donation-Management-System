import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import { store } from './store';
import { LanguageProvider } from './contexts/LanguageContext';
import { MockDataProvider } from './contexts/MockDataContext';
import { AuthProvider } from './contexts/AuthContext';

const container = document.getElementById('root') as HTMLElement;

createRoot(container).render(
  <StrictMode>
    <Provider store={store}>
      <LanguageProvider>
        <MockDataProvider>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </MockDataProvider>
      </LanguageProvider>
    </Provider>
  </StrictMode>,
);


/*
// main.tsx
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root')!;
createRoot(container).render(<App />);
*/