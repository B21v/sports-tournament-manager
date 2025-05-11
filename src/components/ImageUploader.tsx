import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@mui/material';
import { createWorker } from 'tesseract.js';
import TeamListEditor from './TeamListEditor';

interface ImageUploaderProps {
  onPlayersRecognized: (players: string[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onPlayersRecognized }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [pendingTeams, setPendingTeams] = useState<string[]>([]);
  const [rawText, setRawText] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPendingTeams([]);
    setRawText(null);

    try {
      const worker = await createWorker();
      // @ts-ignore - Tesseract.js types are not complete
      await worker.load();
      // @ts-ignore - Tesseract.js types are not complete
      const { data: { text } } = await worker.recognize(file, 'eng');
      await worker.terminate();

      setRawText(text);

      // Новый способ: разбиваем на строки и ищем все пары в каждой строке
      const players: string[] = [];
      const lines = text.split(/\r?\n/);
      const regex = /([A-Za-zА-Яа-яЁё\s]+?\/[A-Za-zА-Яа-яЁё\s]+)/g;
      for (const line of lines) {
        let match;
        while ((match = regex.exec(line)) !== null) {
          players.push(match[1].trim());
        }
      }
      setPendingTeams(players);
      setEditorOpen(true);
    } catch (err) {
      setError('Ошибка при обработке изображения');
      console.error('OCR Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditorConfirm = (teams: string[]) => {
    setEditorOpen(false);
    setPendingTeams([]);
    onPlayersRecognized(teams);
  };

  const handleEditorCancel = () => {
    setEditorOpen(false);
    setPendingTeams([]);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="image-upload"
        type="file"
        onChange={handleImageUpload}
      />
      <label htmlFor="image-upload">
        <Button
          variant="contained"
          component="span"
          disabled={isProcessing}
        >
          Загрузить список игроков
        </Button>
      </label>
      
      {isProcessing && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography>Обработка изображения...</Typography>
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {rawText && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Распознанный текст:</Typography>
          <Paper sx={{ p: 1, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', background: '#fafafa' }}>
            {rawText}
          </Paper>
        </Box>
      )}

      <TeamListEditor
        open={editorOpen}
        initialTeams={pendingTeams}
        onConfirm={handleEditorConfirm}
        onCancel={handleEditorCancel}
      />
    </Box>
  );
};

export default ImageUploader; 