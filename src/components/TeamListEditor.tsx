import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, List, ListItem, ListItemText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface TeamListEditorProps {
  open: boolean;
  initialTeams: string[];
  onConfirm: (teams: string[]) => void;
  onCancel: () => void;
}

const TeamListEditor: React.FC<TeamListEditorProps> = ({ open, initialTeams, onConfirm, onCancel }) => {
  const [teams, setTeams] = useState<string[]>(initialTeams);

  useEffect(() => {
    if (open) setTeams(initialTeams);
  }, [open, initialTeams]);

  const handleTeamChange = (idx: number, value: string) => {
    setTeams(teams => teams.map((t, i) => (i === idx ? value : t)));
  };

  const handleDelete = (idx: number) => {
    setTeams(teams => teams.filter((_, i) => i !== idx));
  };

  const handleAdd = () => {
    setTeams(teams => [...teams, '']);
  };

  const handleConfirm = () => {
    onConfirm(teams.filter(t => t.trim()));
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Проверьте и отредактируйте команды</DialogTitle>
      <DialogContent>
        <List>
          {teams.map((team, idx) => (
            <ListItem key={idx} secondaryAction={
              <IconButton edge="end" onClick={() => handleDelete(idx)}>
                <DeleteIcon />
              </IconButton>
            }>
              <TextField
                value={team}
                onChange={e => handleTeamChange(idx, e.target.value)}
                fullWidth
                size="small"
                variant="standard"
                margin="dense"
              />
            </ListItem>
          ))}
        </List>
        <Button onClick={handleAdd} variant="outlined" fullWidth sx={{ mt: 1 }}>
          Добавить команду
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Отмена</Button>
        <Button onClick={handleConfirm} variant="contained">Добавить</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeamListEditor; 