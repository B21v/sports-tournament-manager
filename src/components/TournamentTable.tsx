import React, { useState, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Tooltip,
  Button
} from '@mui/material';
import { Team, Match } from '../types/tournament';
import html2canvas from 'html2canvas';

interface TeamStats {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function getTennisMatchResult(match: Match, teamId: string): string | null {
  if (!match.isCompleted) return '\u00A0\n\u00A0';
  const isHome = match.homeTeamId === teamId;
  const setScores: string[] = [];
  match.score.sets.forEach((set) => {
    const teamScore = isHome ? set.homeScore : set.awayScore;
    const oppScore = isHome ? set.awayScore : set.homeScore;
    setScores.push(`${teamScore}-${oppScore}`);
  });
  if (setScores.length === 0) return '\u00A0\n\u00A0';
  if (setScores.length === 3) {
    return setScores.slice(0, 2).join(', ') + '\n' + setScores[2];
  }
  // Если только 1 или 2 сета, добавляем неразрывный пробел на второй строке
  return setScores.join(', ') + '\n\u00A0';
}

interface TournamentTableProps {
  teams: Team[];
  matches: Match[];
  onEditMatch?: (match: Match, teamId: string) => void;
}

const TournamentTable: React.FC<TournamentTableProps> = ({ teams, matches, onEditMatch }) => {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleSaveAsImage = async () => {
    if (tableRef.current) {
      const canvas = await html2canvas(tableRef.current, { backgroundColor: '#fff' });
      const link = document.createElement('a');
      link.download = 'tournament-table.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  // Статистика по каждой команде
  const teamStats: TeamStats[] = teams.map(team => {
    let played = 0, won = 0, drawn = 0, lost = 0, goalsFor = 0, goalsAgainst = 0, points = 0;
    matches.forEach(match => {
      if (!match.isCompleted) return;
      let isHome = match.homeTeamId === team.id;
      let isAway = match.awayTeamId === team.id;
      if (!isHome && !isAway) return;
      played++;
      // Для сортировки считаем выигранные сеты как "голы"
      let teamSets = 0, oppSets = 0;
      match.score.sets.forEach(set => {
        const teamScore = isHome ? set.homeScore : set.awayScore;
        const oppScore = isHome ? set.awayScore : set.homeScore;
        if (teamScore > oppScore) teamSets++;
        else if (oppScore > teamScore) oppSets++;
      });
      goalsFor += teamSets;
      goalsAgainst += oppSets;
      if (teamSets > oppSets) {
        won++;
        points += 2; // Победа = 2 очка
      } else if (teamSets === oppSets) {
        drawn++;
        points += 1; // Ничья = 1 очко
      } else {
        lost++;
        // За поражение 0 очков
      }
    });
    return {
      team,
      played,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      points
    };
  });

  // Сортировка по очкам, разнице, выигранным сетам
  const sortedStats = [...teamStats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const diffA = a.goalsFor - a.goalsAgainst;
    const diffB = b.goalsFor - b.goalsAgainst;
    if (diffB !== diffA) return diffB - diffA;
    return b.goalsFor - a.goalsFor;
  });

  // Мапа: teamId -> место
  const placeMap = new Map<string, number>();
  sortedStats.forEach((stat, idx) => placeMap.set(stat.team.id, idx + 1));

  return (
    <Box sx={{ mt: 4, overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          Турнирная таблица (круговая)
        </Typography>
        <Button variant="outlined" size="small" onClick={handleSaveAsImage}>
          Сохранить таблицу как картинку
        </Button>
      </Box>
      <div ref={tableRef}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2} align="center">№</TableCell>
                <TableCell rowSpan={2}>Название команды</TableCell>
                <TableCell colSpan={teams.length} align="center">Игры</TableCell>
                <TableCell rowSpan={2} align="center">В</TableCell>
                <TableCell rowSpan={2} align="center">П</TableCell>
                <TableCell rowSpan={2} align="center">+/-</TableCell>
                <TableCell rowSpan={2} align="center">Очки</TableCell>
                <TableCell rowSpan={2} align="center">Место</TableCell>
                <TableCell rowSpan={2} align="center">Сеты</TableCell>
              </TableRow>
              <TableRow>
                {teams.map((team, idx) => (
                  <TableCell
                    key={team.id}
                    align="center"
                    sx={{
                      ...(hoveredCell && hoveredCell.col === idx
                        ? { background: '#ffe082' }
                        : {}),
                      maxWidth: 40,
                      minWidth: 40,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      p: 0.5,
                      borderRight: idx === teams.length - 1 ? 0 : '1px solid #ddd'
                    }}
                  >
                    {idx + 1}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((team, rowIdx) => {
                const stat = teamStats.find(s => s.team.id === team.id)!;
                return (
                  <TableRow key={team.id}>
                    <TableCell align="center">{rowIdx + 1}</TableCell>
                    <TableCell
                      sx={{
                        ...(hoveredCell && hoveredCell.row === rowIdx
                          ? { background: '#ffe082' }
                          : {}),
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        p: 0.5,
                        borderRight: '1px solid #ddd'
                      }}
                    >
                      {team.name}
                    </TableCell>
                    {teams.map((opponent, colIdx) => {
                      if (team.id === opponent.id) {
                        return <TableCell key={opponent.id} sx={{ background: '#222' }} />;
                      }
                      // Найти матч между team и opponent
                      const match = matches.find(
                        m => (m.homeTeamId === team.id && m.awayTeamId === opponent.id) ||
                             (m.homeTeamId === opponent.id && m.awayTeamId === team.id)
                      );
                      let cell = '';
                      let cellType: 'win' | 'draw' | 'lose' | null = null;
                      if (match) {
                        cell = getTennisMatchResult(match, team.id) || '';
                        // Определяем тип исхода
                        if (match.isCompleted) {
                          const isHome = match.homeTeamId === team.id;
                          let teamSets = 0, oppSets = 0;
                          match.score.sets.forEach(set => {
                            const teamScore = isHome ? set.homeScore : set.awayScore;
                            const oppScore = isHome ? set.awayScore : set.homeScore;
                            if (teamScore > oppScore) teamSets++;
                            else if (oppScore > teamScore) oppSets++;
                          });
                          if (teamSets > oppSets) cellType = 'win';
                          else if (teamSets < oppSets) cellType = 'lose';
                          else cellType = 'draw';
                        }
                      }
                      // Подсветка: если наведено на эту или на противоположную ячейку
                      const isHovered =
                        hoveredCell &&
                        ((hoveredCell.row === rowIdx && hoveredCell.col === colIdx) ||
                          (hoveredCell.row === colIdx && hoveredCell.col === rowIdx));
                      let baseColor: string | undefined = undefined;
                      if (cellType === 'win') baseColor = '#c8e6c9';
                      else if (cellType === 'lose') baseColor = '#ffcdd2';
                      else if (cellType === 'draw') baseColor = '#fff9c4';
                      return (
                        cell.trim() !== '' ? (
                          <Tooltip title={cell} arrow placement="top">
                            <TableCell
                              key={opponent.id}
                              align="center"
                              sx={{
                                background: isHovered
                                  ? '#ffe082'
                                  : baseColor,
                                cursor: 'pointer',
                                maxWidth: 130,
                                minWidth: 60,
                                fontSize: '0.75rem',
                                whiteSpace: 'pre-line',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                borderRight: colIdx === teams.length - 1 ? 0 : '1px solid #ddd',
                                p: 0.5
                              }}
                              onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={() => match && onEditMatch && onEditMatch(match, team.id)}
                            >
                              {cell}
                            </TableCell>
                          </Tooltip>
                        ) : (
                          <TableCell
                            key={opponent.id}
                            align="center"
                            sx={{
                              background: isHovered
                                ? '#ffe082'
                                : baseColor,
                              cursor: 'pointer',
                              maxWidth: 130,
                              minWidth: 60,
                              fontSize: '0.75rem',
                              whiteSpace: 'pre-line',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              borderRight: colIdx === teams.length - 1 ? 0 : '1px solid #ddd',
                              p: 0.5
                            }}
                            onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx })}
                            onMouseLeave={() => setHoveredCell(null)}
                            onClick={() => match && onEditMatch && onEditMatch(match, team.id)}
                          >
                            {cell}
                          </TableCell>
                        )
                      );
                    })}
                    <TableCell align="center">{stat.won}</TableCell>
                    <TableCell align="center">{stat.lost}</TableCell>
                    <TableCell align="center">{stat.goalsFor - stat.goalsAgainst}</TableCell>
                    <TableCell align="center">{stat.points}</TableCell>
                    <TableCell align="center">{placeMap.get(team.id)}</TableCell>
                    <TableCell align="center">{stat.goalsFor}:{stat.goalsAgainst}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </Box>
  );
};

export default TournamentTable; 