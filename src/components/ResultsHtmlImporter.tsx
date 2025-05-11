import React, { useState } from 'react';
import { Box, Button, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow, MenuItem, Select, TextField, Paper, IconButton } from '@mui/material';
import { Team } from '../types/tournament';
import DeleteIcon from '@mui/icons-material/Delete';

interface MatchResult {
  team1: string;
  score: string;
  team2: string;
  team1Id?: string;
  team2Id?: string;
}

interface ResultsHtmlImporterProps {
  teams: Team[];
  onResultsConfirmed: (results: MatchResult[]) => void;
}

function parseHtmlResults(html: string, teams: Team[]): MatchResult[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const matches: MatchResult[] = [];
  const matchEls = Array.from(doc.querySelectorAll('.public-match-container'));
  for (const matchEl of matchEls) {
    const leftNames = Array.from(matchEl.querySelectorAll('.team-container:not(.right) .team-name'))
      .map(el => el.textContent?.trim()).filter(t => t && t !== '/').join(' / ');
    const rightNames = Array.from(matchEl.querySelectorAll('.team-container.right .team-name'))
      .map(el => el.textContent?.trim()).filter(t => t && t !== '/').join(' / ');
    let score = Array.from(matchEl.querySelectorAll('.result-container span'))
      .map(el => el.textContent?.trim()).join(' ');
    
    // Улучшенная обработка счёта
    score = score
      .replace(/\s*\/\s*/g, ', ') // заменяем слэш на запятую с пробелом
      .replace(/:/g, '-')         // заменяем двоеточие на дефис
      .replace(/\s+/g, ' ')       // убираем лишние пробелы
      .replace(/\s*,\s*/g, ', ')  // нормализуем запятые
      .trim();

    // Ищем все возможные форматы счёта
    const scorePatterns = [
      /\d+-\d+/g,           // обычный счёт (6-4)
      /\d+:\d+/g,           // счёт с двоеточием (6:4)
      /\d+\/\d+/g,          // счёт со слэшем (6/4)
      /\(\d+-\d+\)/g,       // счёт в скобках (6-4)
      /\[\d+-\d+\]/g        // счёт в квадратных скобках [6-4]
    ];

    // Собираем все найденные счета
    let scores: string[] = [];
    scorePatterns.forEach(pattern => {
      const matches = score.match(pattern);
      if (matches) {
        scores = scores.concat(matches.map(s => s.replace(/[\(\)\[\]:\/]/g, '-')));
      }
    });

    // Если нашли счета, объединяем их через запятую
    if (scores.length > 0) {
      score = scores.join(', ');
    } else {
      // Если не нашли счета, оставляем как есть
      console.log('Не удалось распарсить счёт:', score);
    }

    // Сопоставление с командами турнира
    const findTeamId = (name: string) => {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '');
      const nName = norm(name);
      const t = teams.find(t => norm(t.name) === nName);
      return t ? t.id : '';
    };

    // Добавляем отладочную информацию
    console.log('Распарсенный матч:', {
      team1: leftNames,
      score,
      team2: rightNames
    });

    matches.push({
      team1: leftNames,
      score,
      team2: rightNames,
      team1Id: findTeamId(leftNames),
      team2Id: findTeamId(rightNames)
    });
  }
  return matches;
}

const ResultsHtmlImporter: React.FC<ResultsHtmlImporterProps> = ({ teams, onResultsConfirmed }) => {
  const [html, setHtml] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);

  const handleParse = () => {
    const parsed = parseHtmlResults(html, teams);
    setResults(parsed);
    setEditorOpen(true);
  };

  const handleResultChange = (idx: number, field: keyof MatchResult, value: string) => {
    setResults(results => results.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleDelete = (idx: number) => {
    setResults(results => results.filter((_, i) => i !== idx));
  };

  const handleConfirm = () => {
    onResultsConfirmed(results.filter(r => r.team1Id && r.team2Id && r.score));
    setEditorOpen(false);
    setResults([]);
    setHtml('');
  };

  const handleCancel = () => {
    setEditorOpen(false);
    setResults([]);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>Импорт результатов из HTML</Typography>
      <TextField
        label="Вставьте HTML-код с результатами"
        value={html}
        onChange={e => setHtml(e.target.value)}
        multiline
        minRows={8}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Button variant="contained" onClick={handleParse} disabled={!html.trim()}>
        Распарсить
      </Button>
      <Dialog open={editorOpen} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>Проверьте и выберите команды для каждого результата</DialogTitle>
        <DialogContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Команда 1</TableCell>
                <TableCell>Счёт</TableCell>
                <TableCell>Команда 2</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select
                      value={r.team1Id || ''}
                      onChange={e => handleResultChange(idx, 'team1Id', e.target.value as string)}
                      displayEmpty
                      fullWidth
                      size="small"
                    >
                      <MenuItem value=""><em>Выберите команду</em></MenuItem>
                      {teams.map(team => (
                        <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary">
                      {r.team1}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 200 }}>
                    <TextField 
                      value={r.score} 
                      onChange={e => handleResultChange(idx, 'score', e.target.value)} 
                      size="small" 
                      fullWidth
                      multiline
                      maxRows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.team2Id || ''}
                      onChange={e => handleResultChange(idx, 'team2Id', e.target.value as string)}
                      displayEmpty
                      fullWidth
                      size="small"
                    >
                      <MenuItem value=""><em>Выберите команду</em></MenuItem>
                      {teams.map(team => (
                        <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary">
                      {r.team2}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDelete(idx)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Отмена</Button>
          <Button onClick={handleConfirm} variant="contained">Добавить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResultsHtmlImporter; 