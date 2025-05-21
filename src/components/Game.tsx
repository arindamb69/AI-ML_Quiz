import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { 
  setCurrentQuestion, 
  nextTeam, 
  updateScore, 
  endGame, 
  setSelectingDifficulty,
  showAnswer,
  setWaitingForNext,
} from '../store/gameSlice';
import { generateQuestion } from '../services/llmService';

interface DifficultyOption {
  level: 'easy' | 'medium' | 'hard';
  points: number;
  description: string;
}

interface QuestionHistory {
  questionNumber: number;
  isCorrect: boolean;
  points: number;
}

interface Team {
  id: string;
  name: string;
  score: number;
  questionsAnswered: number;
  bonusEligible: boolean;
  questionHistory: QuestionHistory[];
}

interface GameState {
  teams: Team[];
  currentTeamIndex: number;
  currentQuestion: {
    text: string;
    options: string[];
    correctAnswer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    isBonus?: boolean;
  } | null;
  isSelectingDifficulty: boolean;
  questionsPerTeam: number;
  showAnswer: boolean;
  waitingForNext: boolean;
  isGameComplete: boolean;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { level: 'easy', points: 1, description: 'Easy (1 point)' },
  { level: 'medium', points: 2, description: 'Medium (2 points)' },
  { level: 'hard', points: 3, description: 'Hard (3 points)' },
];

const Game = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    teams, 
    currentTeamIndex, 
    currentQuestion, 
    isSelectingDifficulty, 
    questionsPerTeam,
    showAnswer: showCorrectAnswer,
    waitingForNext,
    isGameComplete,
  } = useSelector((state: RootState) => state.game as GameState);
  const settings = useSelector((state: RootState) => state.settings);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTeam = teams[currentTeamIndex];
  const questionsRemaining = questionsPerTeam - currentTeam.questionsAnswered;
  const isBonusQuestion = currentTeam.bonusEligible && currentTeam.questionsAnswered === questionsPerTeam;

  useEffect(() => {
    if (!settings.isConfigured) {
      navigate('/settings');
      return;
    }
  }, []);

  useEffect(() => {
    if (isGameComplete) {
      navigate('/results');
    }
  }, [isGameComplete, navigate]);

  const loadQuestion = async (difficulty: 'easy' | 'medium' | 'hard') => {
    try {
      setIsLoading(true);
      setError(null);
      const question = await generateQuestion(settings, difficulty);
      dispatch(setCurrentQuestion({ ...question, isBonus: isBonusQuestion }));
    } catch (error) {
      console.error('Error loading question:', error);
      setError(error instanceof Error ? error.message : 'Failed to load question. Please check your settings.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0 && !isSelectingDifficulty && !waitingForNext) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSelectingDifficulty && !waitingForNext) {
      handleTimeUp();
    }
  }, [timeLeft, isSelectingDifficulty, waitingForNext]);

  const handleTimeUp = () => {
    if (currentQuestion) {
      dispatch(showAnswer());
      dispatch(updateScore({ 
        teamId: currentTeam.id, 
        points: 0, 
        isCorrect: false 
      }));
      dispatch(setWaitingForNext(true));
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion?.correctAnswer;
    const points = currentQuestion?.difficulty === 'easy' ? 1 : 
                  currentQuestion?.difficulty === 'medium' ? 2 : 3;
    
    dispatch(updateScore({ 
      teamId: currentTeam.id, 
      points: isCorrect ? points : 0, 
      isCorrect 
    }));
    dispatch(showAnswer());
    dispatch(setWaitingForNext(true));
  };

  const handleNext = () => {
    dispatch(nextTeam());
    setSelectedAnswer(null);
    setTimeLeft(30);
  };

  const handleEndGame = () => {
    dispatch(endGame());
    navigate('/results');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">Loading question...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-white/20">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4 text-red-400">Error</h2>
              <p className="text-gray-200 mb-4">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => loadQuestion(currentQuestion?.difficulty || 'easy')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSelectingDifficulty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-white/20">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {isBonusQuestion ? '🎉 Bonus Question! 🎉' : `Question ${currentTeam.questionsAnswered + 1} of ${questionsPerTeam}`}
              </h2>
              <p className="text-gray-200 text-lg">
                {isBonusQuestion 
                  ? 'Choose difficulty for your bonus question'
                  : `Team ${currentTeam.name}'s turn`}
              </p>
              {isBonusQuestion && (
                <div className="mt-2 p-2 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30">
                  Congratulations! You've earned a bonus question by answering all questions correctly!
                </div>
              )}
            </div>

            <div className="space-y-4">
              {DIFFICULTY_OPTIONS.map((option) => (
                <button
                  key={option.level}
                  onClick={() => {
                    dispatch(setSelectingDifficulty(false));
                    loadQuestion(option.level);
                  }}
                  className="w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                  style={{
                    borderColor: option.level === 'easy' ? '#34D399' : 
                                option.level === 'medium' ? '#60A5FA' : '#F87171',
                    backgroundColor: option.level === 'easy' ? 'rgba(52, 211, 153, 0.1)' : 
                                   option.level === 'medium' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                  }}
                >
                  <div className="font-medium text-lg text-white">{option.description}</div>
                  {option.level === 'hard' && (
                    <div className="text-sm text-gray-300 mt-1">
                      Recommended for bonus questions
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white">No question available</h2>
            <button
              onClick={() => dispatch(setSelectingDifficulty(true))}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Select Difficulty
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 mb-6 border border-white/20">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Team: {currentTeam.name}
                </h2>
                <p className="text-gray-200 text-lg mt-1">
                  {isBonusQuestion ? '🎉 Bonus Question 🎉' : `Question ${currentTeam.questionsAnswered + 1} of ${questionsPerTeam}`}
                </p>
                <p className="text-lg font-semibold text-purple-300 mt-1">
                  Score: {currentTeam.score} points
                </p>
              </div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                Time: {timeLeft}s
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-3 text-white">Question:</h3>
              <p className="text-xl text-gray-200 bg-white/5 p-4 rounded-lg border border-white/10">
                {currentQuestion.text}
              </p>
            </div>

            <div className="space-y-4">
              {currentQuestion.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={selectedAnswer !== null || waitingForNext}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === option
                      ? option === currentQuestion.correctAnswer
                        ? 'bg-green-500/20 border-green-500 scale-105 text-white'
                        : 'bg-red-500/20 border-red-500 scale-105 text-white'
                      : showCorrectAnswer && option === currentQuestion.correctAnswer
                      ? 'bg-green-500/20 border-green-500 scale-105 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:scale-105 text-white'
                  }`}
                >
                  <span className="text-lg">{option}</span>
                </button>
              ))}
            </div>

            {waitingForNext && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 text-lg font-semibold shadow-lg"
                >
                  Next Question
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-between mb-8">
            <button
              onClick={() => dispatch(setSelectingDifficulty(true))}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-md"
            >
              Change Difficulty
            </button>
            <button
              onClick={handleEndGame}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-md"
            >
              End Game
            </button>
          </div>

          {/* Team Progress */}
          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-white/20">
            <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Team Progress
            </h3>
            <div className="space-y-6">
              {teams.map((team: Team) => (
                <div key={team.id} className="border-b border-white/10 pb-6 last:border-b-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xl font-semibold text-white">{team.name}</span>
                    <span className="text-2xl font-bold text-purple-300">{team.score} points</span>
                  </div>
                  <div className="flex gap-3">
                    {team.questionHistory.map((q: QuestionHistory, i: number) => (
                      <div
                        key={i}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transform hover:scale-110 transition-all duration-200 ${
                          q.isCorrect 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                        title={`Question ${q.questionNumber}: ${q.isCorrect ? 'Correct' : 'Incorrect'} (${q.points} points)`}
                      >
                        {q.isCorrect ? '✓' : '✗'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game; 