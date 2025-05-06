import React, { useState } from 'react';
import { Box, Button, List, ListItem, IconButton, TextField, Typography, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tournament } from '../types/tournament';

interface TournamentDashboardProps {
  tournaments: Tournament[];
  onSelect: (tournamentId: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}

const TournamentDashboard: React.FC<TournamentDashboardProps> = ({ tournaments, onSelect, onCreate, onDelete, onRename }) => {
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate(newName.trim());
    setNewName('');
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, width: '100%' }}>
        <Typography variant="h5" gutterBottom>Турниры</Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Название нового турнира"
            size="small"
            fullWidth
          />
          <Button variant="contained" onClick={handleCreate}>Создать</Button>
        </Box>
        <List>
          {tournaments.map(t => (
            <ListItem key={t.id} secondaryAction={
              <IconButton edge="end" onClick={() => onDelete(t.id)}><DeleteIcon /></IconButton>
            }>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                <TextField
                  value={t.name}
                  onChange={e => onRename(t.id, e.target.value)}
                  variant="standard"
                  sx={{ flexGrow: 1 }}
                />
                <Button variant="outlined" size="small" onClick={() => onSelect(t.id)}>
                  Открыть
                </Button>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default TournamentDashboard; 