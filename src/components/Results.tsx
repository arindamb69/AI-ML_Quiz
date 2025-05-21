import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';

const Results = () => {
  const navigate = useNavigate();
  const teams = useSelector((state: RootState) => state.game.teams);

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Game Results</h2>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Final Scores</h3>
          <div className="space-y-2">
            {sortedTeams.map((team, index) => (
              <div
                key={team.id}
                className={`p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-lg font-bold">{team.score} points</span>
                </div>
                {index === 0 && (
                  <div className="text-yellow-600 font-medium mt-1">🏆 Winner!</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            New Game
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results; 