import { AppProvider } from '@shopify/polaris';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuestsPage from './pages/QuestsPage';
import CreateQuestPage from './pages/CreateQuestPage';
import QuestDetailPage from './pages/QuestDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <AppProvider i18n={{}}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QuestsPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/quests/new" element={<CreateQuestPage />} />
          <Route path="/quests/:id" element={<QuestDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
