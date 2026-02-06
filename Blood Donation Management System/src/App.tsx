import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './contexts/ToastContext';

const App = () => {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  );
};

export default App;
