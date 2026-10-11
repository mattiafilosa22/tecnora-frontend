import { Route, Routes } from 'react-router';
import { Layout } from './components/Layout';
import { BuildingDetailPage } from './pages/BuildingDetailPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { IntroPage } from './pages/IntroPage';
import { NewActivityPage } from './pages/NewActivityPage';
import { NewTicketPage } from './pages/NewTicketPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SchedulePage } from './pages/SchedulePage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { TicketsPage } from './pages/TicketsPage';
import { PrototypeProvider } from './prototype/PrototypeProvider';

function App() {
  return (
    <PrototypeProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<IntroPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="edifici" element={<BuildingsPage />} />
          <Route path="edifici/:id" element={<BuildingDetailPage />} />
          <Route path="programma" element={<SchedulePage />} />
          <Route path="programma/nuova" element={<NewActivityPage />} />
          <Route path="ticket" element={<TicketsPage />} />
          <Route path="ticket/nuovo" element={<NewTicketPage />} />
          <Route path="ticket/:id" element={<TicketDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </PrototypeProvider>
  );
}

export default App;
