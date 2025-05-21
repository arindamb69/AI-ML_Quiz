import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import Welcome from './components/Welcome';
import Game from './components/Game';
import Settings from './components/Settings';
import Results from './components/Results';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <Link to="/" className="text-xl font-semibold text-gray-800">
                  AI-ML Quiz Game
                </Link>
                <div className="flex gap-4">
                  <Link
                    to="/settings"
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          <main>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/game" element={<Game />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
};

export default App; 