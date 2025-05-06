import React from 'react';
import { Box, Button, TextField } from '@mui/material';

interface TournamentHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  onBack: () => void;
  onReset: () => void;
  showTeams: boolean;
  onToggleTeams: () => void;
}

const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  name,
  onNameChange,
  onBack,
  onReset,
  showTeams,
  onToggleTeams
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
    <Button onClick={onBack} variant="outlined" sx={{ mr: 2 }}>
      Назад к списку турниров
    </Button>
    <TextField
      value={name}
      onChange={e => onNameChange(e.target.value)}
      variant="standard"
      sx={{ fontSize: '2rem', flexGrow: 1, mr: 2 }}
      inputProps={{ style: { fontSize: '2rem', fontWeight: 500 } }}
    />
    <Button 
      variant="outlined" 
      color="primary"
      onClick={onToggleTeams}
      sx={{ mr: 2 }}
    >
      {showTeams ? 'Скрыть команды' : 'Редактировать команды'}
    </Button>
    <Button 
      variant="outlined" 
      color="error" 
      onClick={onReset}
    >
      Сбросить турнир
    </Button>
  </Box>
);

export default TournamentHeader; 