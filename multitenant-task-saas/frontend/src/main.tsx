import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './styles.css';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { BoardPage } from './pages/BoardPage';
import { ReportsPage } from './pages/ReportsPage';
import { useAppStore } from './context/store';

function Protected({ children }: { children: React.ReactNode }) {
  const auth = useAppStore((s) => s.auth);
  return auth || localStorage.getItem('accessToken') ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/board/:boardId" element={<Protected><BoardPage /></Protected>} />
        <Route path="/reports" element={<Protected><ReportsPage /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
