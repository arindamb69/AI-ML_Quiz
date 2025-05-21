import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setTeams } from '../store/gameSlice';

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

const Welcome = () => {
  const [teamNames, setTeamNames] = useState<string[]>(['']);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const addTeam = () => {
    setTeamNames([...teamNames, '']);
  };

  const removeTeam = (index: number) => {
    setTeamNames(teamNames.filter((_, i) => i !== index));
  };

  const updateTeamName = (index: number, name: string) => {
    const newTeams = [...teamNames];
    newTeams[index] = name;
    setTeamNames(newTeams);
  };

  const startGame = () => {
    const validTeams: Team[] = teamNames
      .map((name, index) => ({
        id: `team-${index}`,
        name: name.trim() || `Team ${index + 1}`,
        score: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        bonusEligible: false,
        questionHistory: [],
      }))
      .filter(team => team.name.trim() !== '');

    if (validTeams.length >= 2) {
      dispatch(setTeams(validTeams));
      navigate('/game');
    } else {
      alert('Please add at least 2 teams to start the game.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              AI-ML Quiz Game
            </h1>
            <p className="text-xl text-gray-200">
              Create your teams and start the competition!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-white/20">
            <div className="space-y-4">
              {teamNames.map((team, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <input
                    type="text"
                    value={team}
                    onChange={(e) => updateTeamName(index, e.target.value)}
                    placeholder={`Team ${index + 1}`}
                    className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  {teamNames.length > 1 && (
                    <button
                      onClick={() => removeTeam(index)}
                      className="p-3 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <button
                onClick={addTeam}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors"
              >
                Add Team
              </button>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-semibold"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 