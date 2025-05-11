import React, { useState } from 'react';
import { Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { Team, Match, Tournament } from '../types/tournament';
import TournamentTable from './TournamentTable';
import TournamentHeader from './TournamentHeader';
import TeamEditor from './TeamEditor';
import ScoreDialog from './ScoreDialog';
import ResultsHtmlImporter from './ResultsHtmlImporter';

interface TournamentManagerProps {
  tournament: Tournament;
  onUpdate: (t: Tournament) => void;
  onBack: () => void;
}

const TournamentManager: React.FC<TournamentManagerProps> = ({ tournament, onUpdate, onBack }) => {
  const [localTournament, setLocalTournament] = useState<Tournament>(tournament);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState('');
  const [showTeams, setShowTeams] = useState(false);

  React.useEffect(() => {
    setLocalTournament(tournament);
  }, [tournament]);

  const saveTournament = (t: Tournament) => {
    setLocalTournament(t);
    onUpdate(t);
  };

  const addTeam = () => {
    if (newTeamName.trim()) {
      const newTeam: Team = {
        id: uuidv4(),
        name: newTeamName.trim()
      };
      saveTournament({
        ...localTournament,
        teams: [...localTournament.teams, newTeam]
      });
      setNewTeamName('');
    }
  };

  const addTeams = (names: string[]) => {
    const newTeams = names
      .filter(name => name.trim())
      .map(name => ({
        id: uuidv4(),
        name: name.trim()
      }));
    if (newTeams.length) {
      saveTournament({
        ...localTournament,
        teams: [...localTournament.teams, ...newTeams]
      });
    }
    setNewTeamName('');
  };

  const removeTeam = (teamId: string) => {
    saveTournament({
      ...localTournament,
      teams: localTournament.teams.filter(team => team.id !== teamId),
      matches: localTournament.matches.filter(
        match => match.homeTeamId !== teamId && match.awayTeamId !== teamId
      )
    });
  };

  const generateMatches = () => {
    const teams = localTournament.teams;
    const matches: Match[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          id: uuidv4(),
          homeTeamId: teams[i].id,
          awayTeamId: teams[j].id,
          score: {
            sets: [],
            isCompleted: false
          },
          isCompleted: false
        });
      }
    }
    saveTournament({
      ...localTournament,
      matches,
      status: 'in-progress'
    });
  };

  const openScoreDialog = (match: Match, teamId?: string) => {
    setSelectedMatch(match);
    setSelectedTeamId(teamId || null);
    setScoreInput(formatTennisScore(match, teamId));
    setScoreDialogOpen(true);
  };

  const parseScore = (scoreStr: string) => {
    const sets = scoreStr.split(',').map(set => {
      const [home, away] = set.trim().split('-').map(Number);
      return {
        homeScore: home || 0,
        awayScore: away || 0
      };
    });
    return sets;
  };

  const updateMatchScore = () => {
    if (selectedMatch) {
      let sets = parseScore(scoreInput);
      if (selectedTeamId && selectedMatch.awayTeamId === selectedTeamId) {
        sets = sets.map(set => ({ homeScore: set.awayScore, awayScore: set.homeScore }));
      }
      saveTournament({
        ...localTournament,
        matches: localTournament.matches.map(match =>
          match.id === selectedMatch.id
            ? {
                ...match,
                score: {
                  sets,
                  isCompleted: true
                },
                isCompleted: true
              }
            : match
        )
      });
      setScoreDialogOpen(false);
    }
  };

  const deleteMatch = () => {
    if (selectedMatch) {
      saveTournament({
        ...localTournament,
        matches: localTournament.matches.map(match =>
          match.id === selectedMatch.id
            ? {
                ...match,
                score: {
                  sets: [],
                  isCompleted: false
                },
                isCompleted: false
              }
            : match
        )
      });
      setScoreDialogOpen(false);
    }
  };

  const formatTennisScore = (match: Match, teamId?: string) => {
    if (!match.score.sets.length) return '';
    if (teamId && match.awayTeamId === teamId) {
      return match.score.sets
        .map(set => `${set.awayScore}-${set.homeScore}`)
        .join(', ');
    }
    return match.score.sets
      .map(set => `${set.homeScore}-${set.awayScore}`)
      .join(', ');
  };

  const resetTournament = () => {
    if (window.confirm('Вы уверены, что хотите сбросить турнир? Все данные будут удалены.')) {
      const newTournament: Tournament = {
        id: localTournament.id,
        name: localTournament.name,
        teams: [],
        matches: [],
        type: 'round-robin',
        status: 'pending'
      };
      saveTournament(newTournament);
    }
  };

  // Встроенная функция Левенштейна
  function levenshtein(a: string, b: string): number {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) return bn;
    if (bn === 0) return an;
    const matrix = Array.from({ length: an + 1 }, () => new Array(bn + 1).fill(0));
    for (let i = 0; i <= an; i++) matrix[i][0] = i;
    for (let j = 0; j <= bn; j++) matrix[0][j] = j;
    for (let i = 1; i <= an; i++) {
      for (let j = 1; j <= bn; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[an][bn];
  }

  // Функция очистки имени от шума
  function cleanName(name: string) {
    return name
      .split(/\s+/)
      .filter(word => word.length > 2 && word !== 'L' && word !== 'W')
      .join(' ')
      .trim();
  }

  // Фаззи-поиск по существующим командам с диагностикой
  function findBestTeamId(name: string, teams: Team[]): string | null {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '');
    const nName = norm(cleanName(name));
    let bestId: string | null = null;
    let bestScore = Infinity;
    let bestTeamName = '';
    teams.forEach(team => {
      const nTeam = norm(team.name);
      const dist = levenshtein(nName, nTeam);
      if (dist < bestScore) {
        bestScore = dist;
        bestId = team.id;
        bestTeamName = team.name;
      }
    });
    // Диагностика
    console.log(`OCR: '${name}' | Clean: '${cleanName(name)}' | Best: '${bestTeamName}' | Dist: ${bestScore}`);
    if (bestScore > 5) return null;
    return bestId;
  }

  // Импорт результатов матчей
  const handleResultsImport = (results: { team1: string; score: string; team2: string }[]) => {
    let updatedMatches = [...localTournament.matches];
    results.forEach(({ team1, score, team2 }) => {
      const team1Id = findBestTeamId(team1, localTournament.teams);
      const team2Id = findBestTeamId(team2, localTournament.teams);
      if (!team1Id || !team2Id) return;

      // Найти матч
      const matchIdx = updatedMatches.findIndex(
        m => (m.homeTeamId === team1Id && m.awayTeamId === team2Id) ||
             (m.homeTeamId === team2Id && m.awayTeamId === team1Id)
      );
      if (matchIdx === -1) return;

      const match = updatedMatches[matchIdx];
      const isTeam1Home = match.homeTeamId === team1Id;

      // Парсим счёт
      const sets = score.split(',').map(setStr => {
        const [a, b] = setStr.trim().split('-').map(Number);
        // Если team1 не является домашней командой, меняем местами счёт
        return isTeam1Home 
          ? { homeScore: a || 0, awayScore: b || 0 }
          : { homeScore: b || 0, awayScore: a || 0 };
      });

      // Добавляем отладочную информацию
      console.log('Импортируемый матч:', {
        team1,
        team2,
        score,
        isTeam1Home,
        parsedSets: sets,
        matchId: match.id
      });

      updatedMatches[matchIdx] = {
        ...match,
        score: { sets, isCompleted: true },
        isCompleted: true
      };
    });
    saveTournament({ ...localTournament, matches: updatedMatches });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <TournamentHeader
        name={localTournament.name}
        onNameChange={name => saveTournament({ ...localTournament, name })}
        onBack={onBack}
        onReset={resetTournament}
        showTeams={showTeams}
        onToggleTeams={() => setShowTeams(v => !v)}
      />
      {showTeams && (
        <TeamEditor
          teams={localTournament.teams}
          newTeamName={newTeamName}
          onNewTeamNameChange={setNewTeamName}
          onAddTeam={addTeam}
          onAddTeams={addTeams}
          onRemoveTeam={removeTeam}
          canGenerate={localTournament.teams.length >= 2 && localTournament.status === 'pending'}
          onGenerate={generateMatches}
        />
      )}
      {localTournament.status === 'in-progress' && (
        <>
          <ResultsHtmlImporter teams={localTournament.teams} onResultsConfirmed={handleResultsImport} />
          <TournamentTable
            teams={localTournament.teams}
            matches={localTournament.matches}
            onEditMatch={openScoreDialog}
          />
        </>
      )}
      <ScoreDialog
        open={scoreDialogOpen}
        value={scoreInput}
        onChange={setScoreInput}
        onSave={updateMatchScore}
        onClose={() => setScoreDialogOpen(false)}
        onDelete={deleteMatch}
      />
    </Box>
  );
};

export default TournamentManager; 