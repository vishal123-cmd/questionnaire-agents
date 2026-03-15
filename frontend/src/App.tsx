import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Pages
import DashboardPage from './pages/DashboardPage';
import KnowledgePage from './pages/KnowledgePage';
import ChatPage from './pages/ChatPage';
import QuestionnairePage from './pages/QuestionnairePage';

// Layout
import AppShell from './components/layout/AppShell';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Main routes */}
          <Route
            path="/dashboard"
            element={
              <AppShell>
                <DashboardPage />
              </AppShell>
            }
          />
          <Route
            path="/knowledge"
            element={
              <AppShell>
                <KnowledgePage />
              </AppShell>
            }
          />
          <Route
            path="/chat"
            element={
              <AppShell>
                <ChatPage />
              </AppShell>
            }
          />
          <Route
            path="/questionnaire"
            element={
              <AppShell>
                <QuestionnairePage />
              </AppShell>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
