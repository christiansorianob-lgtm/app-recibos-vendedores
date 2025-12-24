import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { TicketForm } from './components/tickets/TicketForm';
import { TicketList } from './components/tickets/TicketList';
import { TicketDetailsPanel } from './components/tickets/TicketDetailsPanel';
import { EmpresasPage } from './components/catalogs/EmpresasPage';
import { CompradoresPage } from './components/catalogs/CompradoresPage';
import { MigrationPanel } from './components/admin/MigrationPanel';
import { useTickets } from './hooks/useTickets';
import { useState } from 'react';
import type { TiqueteFruta, TiqueteInput } from './types';

function AppContent() {
  const [editingTicket, setEditingTicket] = useState<TiqueteFruta | undefined>(undefined);
  const [selectedTicket, setSelectedTicket] = useState<TiqueteFruta | undefined>(undefined);
  const navigate = useNavigate();

  const {
    filteredTiquetes,
    addTiquete,
    updateTiquete,
    toggleRevisado,
    filters,
    uniqueEmpresas,
    tiquetes
  } = useTickets();

  const handleCreateOrUpdate = (data: TiqueteInput) => {
    if (editingTicket) {
      updateTiquete(editingTicket.id, data);
      setEditingTicket(undefined);
    } else {
      addTiquete(data);
    }
    navigate('/tickets');
  };

  const handleToggleRevisadoFromPanel = () => {
    if (selectedTicket) {
      toggleRevisado(selectedTicket.id);
      setSelectedTicket(prev => prev ? ({ ...prev, revisado: !prev.revisado }) : undefined);
    }
  }

  return (
    <Layout
      rightPanel={selectedTicket ? (
        <TicketDetailsPanel
          ticket={selectedTicket}
          onClose={() => {
            setSelectedTicket(undefined);
          }}
          onEdit={() => {
            setEditingTicket(selectedTicket);
            setSelectedTicket(undefined);
            navigate('/nuevo');
          }}
          onToggleStatus={handleToggleRevisadoFromPanel}
        />
      ) : undefined}
    >
      <Routes>
        <Route path="/" element={<DashboardView tiquetes={tiquetes} />} />

        <Route path="/tickets" element={
          <TicketList
            tiquetes={filteredTiquetes}
            onEdit={(t) => {
              setEditingTicket(t);
              setSelectedTicket(undefined);
            }}
            onToggleRevisado={toggleRevisado}
            filters={filters}
            uniqueEmpresas={uniqueEmpresas}
            selectedId={selectedTicket?.id}
            onSelect={setSelectedTicket}
          />
        } />

        <Route path="/nuevo" element={
          <TicketForm
            initialData={editingTicket}
            onSubmit={handleCreateOrUpdate}
            onCancel={() => {
              setEditingTicket(undefined);
              navigate(-1);
            }}
          />
        } />

        <Route path="/catalogos/empresas" element={<EmpresasPage />} />
        <Route path="/catalogos/compradores" element={<CompradoresPage />} />

        <Route path="/admin/migration" element={<MigrationPanel />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
