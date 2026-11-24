import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppProvider } from './context/AppContext';
import { CurriculumPage } from './pages/CurriculumPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { ReviewPage } from './pages/ReviewPage';
import { UnitStudyPage } from './pages/UnitStudyPage';

export function AppRoutes() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/diagnostic" element={<DiagnosticPage />} />
        <Route path="/curriculum" element={<CurriculumPage />} />
        <Route path="/unit/:unitId" element={<UnitStudyPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AppProvider>
  );
}
