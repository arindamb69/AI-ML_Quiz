import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { RootState } from '../store';
import { setProvider, setApiKey, setOllamaModel, saveSettings } from '../store/settingsSlice';

const PROVIDERS = [
  { label: 'Ollama (Local)', value: 'ollama' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Gemini', value: 'gemini' },
  { label: 'Groq', value: 'groq' },
];

const Settings = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings.provider === 'ollama') {
      fetchOllamaModels();
    }
  }, [settings.provider]);

  const fetchOllamaModels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get('http://localhost:11434/api/tags');
      setOllamaModels(response.data.models.map((model: any) => model.name));
    } catch (error) {
      console.error('Error fetching Ollama models:', error);
      setError('Failed to fetch Ollama models. Please ensure Ollama is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    dispatch(saveSettings());
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Game Settings
            </h1>
            <p className="text-xl text-gray-200">
              Configure your LLM provider and API settings
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-white text-lg font-medium mb-2">
                  LLM Provider
                </label>
                <select
                  value={settings.provider}
                  onChange={(e) => dispatch(setProvider(e.target.value as any))}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="ollama">Ollama (Local)</option>
                  <option value="openai">OpenAI</option>
                  <option value="gemini">Gemini</option>
                  <option value="groq">Groq</option>
                </select>
              </div>

              {settings.provider === 'ollama' && (
                <div>
                  <label className="block text-white text-lg font-medium mb-2">
                    Ollama Model
                  </label>
                  {isLoading ? (
                    <div className="text-gray-300">Loading models...</div>
                  ) : error ? (
                    <div className="text-red-400">{error}</div>
                  ) : (
                    <select
                      value={settings.ollamaModel}
                      onChange={(e) => dispatch(setOllamaModel(e.target.value))}
                      className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">Select a model</option>
                      {ollamaModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {settings.provider !== 'ollama' && (
                <div>
                  <label className="block text-white text-lg font-medium mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => dispatch(setApiKey(e.target.value))}
                    placeholder="Enter your API key"
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-semibold"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 