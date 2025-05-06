import React, { useState } from 'react';
import { Box } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { Team, Match, Tournament } from '../types/tournament';
import TournamentTable from './TournamentTable';
import TournamentHeader from './TournamentHeader';
import TeamEditor from './TeamEditor';
import ScoreDialog from './ScoreDialog';

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
          onRemoveTeam={removeTeam}
          canGenerate={localTournament.teams.length >= 2 && localTournament.status === 'pending'}
          onGenerate={generateMatches}
        />
      )}
      {localTournament.status === 'in-progress' && (
        <TournamentTable
          teams={localTournament.teams}
          matches={localTournament.matches}
          onEditMatch={openScoreDialog}
        />
      )}
      <ScoreDialog
        open={scoreDialogOpen}
        value={scoreInput}
        onChange={setScoreInput}
        onSave={updateMatchScore}
        onClose={() => setScoreDialogOpen(false)}
      />
    </Box>
  );
};

export default TournamentManager; 