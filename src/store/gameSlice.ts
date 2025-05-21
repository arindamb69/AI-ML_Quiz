import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Team {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  bonusEligible: boolean;
  questionHistory: {
    questionNumber: number;
    isCorrect: boolean;
    points: number;
  }[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isBonus: boolean;
}

interface GameState {
  teams: Team[];
  currentTeamIndex: number;
  currentQuestion: Question | null;
  isGameActive: boolean;
  isSelectingDifficulty: boolean;
  questionsPerTeam: number;
  showAnswer: boolean;
  waitingForNext: boolean;
  isGameComplete: boolean;
}

const initialState: GameState = {
  teams: [],
  currentTeamIndex: 0,
  currentQuestion: null,
  isGameActive: false,
  isSelectingDifficulty: true,
  questionsPerTeam: 5,
  showAnswer: false,
  waitingForNext: false,
  isGameComplete: false,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    addTeam: (state, action: PayloadAction<Team>) => {
      state.teams.push({
        ...action.payload,
        questionsAnswered: 0,
        correctAnswers: 0,
        bonusEligible: false,
        questionHistory: [],
      });
    },
    setTeams: (state, action: PayloadAction<Team[]>) => {
      state.teams = action.payload.map(team => ({
        ...team,
        questionsAnswered: 0,
        correctAnswers: 0,
        bonusEligible: false,
        questionHistory: [],
      }));
    },
    setCurrentTeamIndex: (state, action: PayloadAction<number>) => {
      state.currentTeamIndex = action.payload;
    },
    setCurrentQuestion: (state, action: PayloadAction<Question>) => {
      state.currentQuestion = action.payload;
      state.isSelectingDifficulty = false;
      state.showAnswer = false;
      state.waitingForNext = false;
    },
    nextTeam: (state) => {
      const currentTeam = state.teams[state.currentTeamIndex];
      currentTeam.questionsAnswered += 1;

      // Check if team is eligible for bonus question (all 5 questions correct)
      if (currentTeam.questionsAnswered === state.questionsPerTeam && 
          currentTeam.correctAnswers === state.questionsPerTeam &&
          !currentTeam.bonusEligible) {
        currentTeam.bonusEligible = true;
      }

      // Check if all teams have completed their questions
      const allTeamsComplete = state.teams.every(team => 
        team.questionsAnswered >= state.questionsPerTeam && 
        (!team.bonusEligible || team.questionsAnswered > state.questionsPerTeam)
      );

      if (allTeamsComplete) {
        state.isGameComplete = true;
        state.isGameActive = false;
        return;
      }

      // Move to next team if:
      // 1. Team has answered all regular questions (5) and either:
      //    - Not eligible for bonus, or
      //    - Has already answered their bonus question
      if (currentTeam.questionsAnswered >= state.questionsPerTeam && 
          (!currentTeam.bonusEligible || currentTeam.questionsAnswered > state.questionsPerTeam)) {
        // Find next team that hasn't completed their questions
        let nextTeamIndex = (state.currentTeamIndex + 1) % state.teams.length;
        let attempts = 0;
        
        while (state.teams[nextTeamIndex].questionsAnswered >= state.questionsPerTeam &&
               (!state.teams[nextTeamIndex].bonusEligible || 
                state.teams[nextTeamIndex].questionsAnswered > state.questionsPerTeam) &&
               attempts < state.teams.length) {
          nextTeamIndex = (nextTeamIndex + 1) % state.teams.length;
          attempts++;
        }
        
        if (attempts < state.teams.length) {
          state.currentTeamIndex = nextTeamIndex;
        }
      }

      state.isSelectingDifficulty = true;
      state.showAnswer = false;
      state.waitingForNext = false;
    },
    updateScore: (state, action: PayloadAction<{ teamId: string; points: number; isCorrect: boolean }>) => {
      const team = state.teams.find(t => t.id === action.payload.teamId);
      if (team) {
        if (action.payload.isCorrect) {
          team.score += action.payload.points;
          team.correctAnswers += 1;
        }
        team.questionHistory.push({
          questionNumber: team.questionsAnswered + 1,
          isCorrect: action.payload.isCorrect,
          points: action.payload.isCorrect ? action.payload.points : 0,
        });
      }
    },
    showAnswer: (state) => {
      state.showAnswer = true;
    },
    setWaitingForNext: (state, action: PayloadAction<boolean>) => {
      state.waitingForNext = action.payload;
    },
    startGame: (state) => {
      state.isGameActive = true;
      state.isSelectingDifficulty = true;
      state.isGameComplete = false;
    },
    endGame: (state) => {
      state.isGameActive = false;
      state.isGameComplete = true;
    },
    resetGame: () => initialState,
    setSelectingDifficulty: (state, action: PayloadAction<boolean>) => {
      state.isSelectingDifficulty = action.payload;
    },
  },
});

export const {
  addTeam,
  setTeams,
  setCurrentTeamIndex,
  setCurrentQuestion,
  nextTeam,
  updateScore,
  showAnswer,
  setWaitingForNext,
  startGame,
  endGame,
  resetGame,
  setSelectingDifficulty,
} = gameSlice.actions;

export default gameSlice.reducer; 