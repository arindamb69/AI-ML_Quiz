import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { resetGame } from '../store/gameSlice';

const Results = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const teams = useSelector((state: RootState) => state.game.teams);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const highestScore = sortedTeams[0]?.score;
  const winners = sortedTeams.filter(team => team.score === highestScore);
  const isTie = winners.length === teams.length;

  const handleNewGame = () => {
    dispatch(resetGame());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-white/20">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            Game Results
          </h2>

          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-white">Final Scores</h3>
            <div className="space-y-4">
              {sortedTeams.map((team, index) => {
                const isWinner = team.score === highestScore;
                return (
                  <div
                    key={team.id}
                    className={`p-4 rounded-lg backdrop-blur-sm transition-all duration-200 ${
                      isWinner 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500/50' 
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-medium text-white">{team.name}</span>
                      <span className="text-2xl font-bold text-purple-300">{team.score} points</span>
                    </div>
                    {isWinner && (
                      <div className="text-yellow-300 font-medium mt-2">
                        {isTie ? '🏆 Tie!' : '🏆 Winner!'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleNewGame}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              New Game
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results; 