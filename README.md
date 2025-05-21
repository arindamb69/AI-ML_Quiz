# AI-ML Quiz Game

An interactive team-based quiz game that generates questions using various Large Language Models (LLMs). Teams compete by answering multiple-choice questions with different difficulty levels, earning points and bonus questions for perfect rounds.

## Features

- 🎮 Team-based competition with customizable team names
- 🎯 Multiple difficulty levels (Easy, Medium, Hard) with different point values
- ⏱️ Timer-based question answering
- 🎁 Bonus questions for teams that answer all regular questions correctly
- 🤖 Support for multiple LLM providers:
  - Ollama (Local)
  - OpenAI
  - Gemini
  - Groq
- 📊 Real-time score tracking and team progress visualization
- 🎨 Modern, responsive UI with beautiful gradients and animations

## Prerequisites

- Node.js (v18 or higher)
- npm or Yarn package manager
- For local LLM support: [Ollama](https://ollama.ai/) installed and running

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AI-ML_Quiz.git
cd AI-ML_Quiz
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

1. Visit the Settings page to configure your LLM provider
2. For local LLM:
   - Select "Ollama" as the provider
   - Choose from available models
3. For cloud providers:
   - Select your preferred provider
   - Enter your API key
   - Save settings

## Game Rules

1. Create at least 2 teams to start the game
2. Each team gets 5 regular questions
3. Questions have different point values based on difficulty:
   - Easy: 1 point
   - Medium: 2 points
   - Hard: 3 points
4. Teams have 30 seconds to answer each question
5. Teams that answer all 5 questions correctly get a bonus question
6. The team with the highest score at the end wins

## Technologies Used

- React
- TypeScript
- Redux Toolkit
- Tailwind CSS
- Vite
- React Router
- Axios

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by traditional quiz games and modern AI capabilities
- Built with the goal of making AI more accessible and fun 