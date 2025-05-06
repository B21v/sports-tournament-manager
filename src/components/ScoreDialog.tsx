import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';

interface ScoreDialogProps {
  open: boolean;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}

const ScoreDialog: React.FC<ScoreDialogProps> = ({ open, value, onChange, onSave, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Введите счёт матча</DialogTitle>
    <DialogContent>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Введите счёт в формате: 6-4, 6-3 (сет за сетом через запятую)
        </Typography>
        <TextField
          fullWidth
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Например: 6-4, 6-3"
          sx={{ mt: 1 }}
          autoFocus
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSave();
            }
          }}
        />
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Отмена</Button>
      <Button onClick={onSave} variant="contained" color="primary">
        Сохранить
      </Button>
    </DialogActions>
  </Dialog>
);

export default ScoreDialog; 