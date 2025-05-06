import React from 'react';
import { Box, Button, TextField, Typography, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Team } from '../types/tournament';

interface TeamEditorProps {
  teams: Team[];
  newTeamName: string;
  onNewTeamNameChange: (name: string) => void;
  onAddTeam: () => void;
  onRemoveTeam: (id: string) => void;
  canGenerate: boolean;
  onGenerate: () => void;
}

const TeamEditor: React.FC<TeamEditorProps> = ({
  teams,
  newTeamName,
  onNewTeamNameChange,
  onAddTeam,
  onRemoveTeam,
  canGenerate,
  onGenerate
}) => (
  <Paper sx={{ p: 2, mb: 2 }}>
    <Typography variant="h6" gutterBottom>
      Добавить команду
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <TextField
        value={newTeamName}
        onChange={e => onNewTeamNameChange(e.target.value)}
        placeholder="Название команды"
        size="small"
      />
      <Button variant="contained" onClick={onAddTeam}>
        Добавить
      </Button>
    </Box>
    <Typography variant="h6" gutterBottom>
      Команды
    </Typography>
    <List>
      {teams.map(team => (
        <ListItem
          key={team.id}
          secondaryAction={
            <IconButton edge="end" onClick={() => onRemoveTeam(team.id)}>
              <DeleteIcon />
            </IconButton>
          }
        >
          <ListItemText primary={team.name} />
        </ListItem>
      ))}
    </List>
    {canGenerate && (
      <Button
        variant="contained"
        color="primary"
        onClick={onGenerate}
        sx={{ mt: 2 }}
      >
        Начать турнир
      </Button>
    )}
  </Paper>
);

export default TeamEditor; 