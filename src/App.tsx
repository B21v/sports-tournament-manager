import React, { useState, useEffect } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import TournamentDashboard from './components/TournamentDashboard';
import TournamentManager from './components/TournamentManager';
import { Tournament } from './types/tournament';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

const STORAGE_KEY = 'tournament-list';

function App() {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tournaments));
  }, [tournaments]);

  const handleSelect = (id: string) => setSelectedId(id);
  const handleBack = () => setSelectedId(null);

  const handleUpdateTournament = (updated: Tournament) => {
    setTournaments(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const selectedTournament = tournaments.find(t => t.id === selectedId) || null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth={false} sx={{ maxWidth: 1400 }}>
        {!selectedTournament ? (
          <TournamentDashboard
            tournaments={tournaments}
            onSelect={handleSelect}
            onCreate={name => {
              const newTournament: Tournament = {
                id: (Math.random() + Date.now()).toString(36),
                name,
                teams: [],
                matches: [],
                type: 'round-robin',
                status: 'pending'
              };
              setTournaments(prev => [...prev, newTournament]);
            }}
            onDelete={id => {
              if (window.confirm('Удалить турнир?')) {
                setTournaments(prev => prev.filter(t => t.id !== id));
              }
            }}
            onRename={(id, name) => {
              setTournaments(prev => prev.map(t => t.id === id ? { ...t, name } : t));
            }}
          />
        ) : (
          <TournamentManager
            tournament={selectedTournament}
            onUpdate={handleUpdateTournament}
            onBack={handleBack}
          />
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App; 