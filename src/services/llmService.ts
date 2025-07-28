import axios from 'axios';
import { RootState } from '../store';
import { LLMProvider } from '../store/settingsSlice';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

const SYSTEM_PROMPT = `You are a quiz question generator for AI topics (including Machine Learning, Neural Network,Generative AI, Agents etc.).
Generate a multiple-choice question with exactly 4 options. Alternate questions so that topics about Machine Learning and Artificial Intelligence are covered equally over time.

IMPORTANT RULES:
1. NEVER repeat any question, create usnique questions each time.
2. Alternate between all AI topics to ensure equal coverage.
3. Each question must be unique in both content and structure.
4. Avoid variations of the same question (e.g., don't just change the options).
5. The question text should be clear and concise.
6. Options should be plausible and relevant to the question.
7. The correct answer must be one of the options provided.
8. Ensure the question is appropriate for the specified difficulty level (easy, medium, hard).
9. Do not include any personal or sensitive information in the questions.
10. The easy questions should not be as easy as "What is AI?" but rather something like "What is a common application of AI in everyday life?","In classification, what does the term “class label” refer to?","Which of the following is NOT a type of machine learning?","What is the main goal of artificial intelligence?","What does "Generative" mean in Generative AI?","Which is not a type of agent in artificial intelligence?" etc.
11. The medium questions should not be too complex, like "Explain the difference between supervised and unsupervised learning", but rather something like "What is a common algorithm used in supervised learning?","What is the main purpose of feature scaling in ML?","Which model architecture is fundamental to Large Language Models (LLMs) like GPT?","What does a discriminator do in a GAN (Generative Adversarial Network)?","What is the main advantage of data augmentation using Generative AI?" etc.
12. The hard questions should not be overly technical, like "What is the mathematical basis of backpropagation?", but rather something like "What is a common challenge faced when training deep neural networks?","Which neural network activation function is known for mitigating the vanishing gradient problem?","What does a transformer model rely on to achieve state-of-the-art results in NLP?","Which is a major ethical risk of deploying Generative AI models?" etc.

Format the response as a valid JSON object with the following structure:
{
  "text": "question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "correct option"
}
Make sure the response is ONLY the JSON object, with no additional text.`;

// Add question history tracking
const recentQuestions = new Set<string>();

const getRecentQuestionsText = () =>
  recentQuestions.size > 0
    ? `\nRecently asked questions (DO NOT generate similar ones):\n${Array.from(recentQuestions).slice(-5).join('\n')}`
    : '';

export const generateQuestion = async (
  settings: RootState['settings'],
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question> => {
  const { provider, apiKey, ollamaModel } = settings;

  if (!settings.isConfigured) {
    throw new Error('LLM settings are not configured. Please configure settings first.');
  }

  try {
    switch (provider) {
      case 'ollama':
        if (!ollamaModel) {
          throw new Error('No Ollama model selected. Please select a model in settings.');
        }
        return generateOllamaQuestion(ollamaModel, difficulty);
      case 'openai':
        if (!apiKey) {
          throw new Error('OpenAI API key is missing. Please add your API key in settings.');
        }
        return generateOpenAIQuestion(apiKey, difficulty);
      case 'gemini':
        if (!apiKey) {
          throw new Error('Gemini API key is missing. Please add your API key in settings.');
        }
        return generateGeminiQuestion(apiKey, difficulty);
      case 'groq':
        if (!apiKey) {
          throw new Error('Groq API key is missing. Please add your API key in settings.');
        }
        return generateGroqQuestion(apiKey, difficulty);
      default:
        throw new Error('Unsupported LLM provider');
    }
  } catch (error) {
    console.error('Error generating question:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate question: ${error.message}`);
    }
    throw new Error('Failed to generate question. Please check your settings and try again.');
  }
};

const generateOllamaQuestion = async (
  model: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question> => {
  try {
    const prompt = `${SYSTEM_PROMPT}${getRecentQuestionsText()}\n\nGenerate a ${difficulty} difficulty question.`;
    const response = await axios.post('http://localhost:11434/api/generate', {
      model,
      prompt: `${SYSTEM_PROMPT}\n\nGenerate a ${difficulty} difficulty question.`,
      stream: false,
    });

    if (!response.data.response) {
      throw new Error('No response from Ollama');
    }

    try {
      const questionData = JSON.parse(response.data.response);
      validateQuestionData(questionData);

      // Add the new question to history
      if (questionData.text) {
        recentQuestions.add(questionData.text);
        if (recentQuestions.size > 20) {
          const firstQuestion = Array.from(recentQuestions)[0];
          recentQuestions.delete(firstQuestion);
        }
      }
      
      return {
        id: Date.now().toString(),
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        difficulty,
      };
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', response.data.response);
      throw new Error('Invalid response format from Ollama');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Could not connect to Ollama. Make sure Ollama is running on localhost:11434');
      }
      throw new Error(`Ollama API error: ${error.message}`);
    }
    throw error;
  }
};

const generateOpenAIQuestion = async (
  apiKey: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question> => {
  try {
    const recentQuestionsText = getRecentQuestionsText();
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Generate a ${difficulty} difficulty question.${recentQuestionsText}`,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('No response from OpenAI');
    }

    try {
      const questionData = JSON.parse(response.data.choices[0].message.content);
      validateQuestionData(questionData);

      // Add the new question to history
      if (questionData.text) {
        recentQuestions.add(questionData.text);
        if (recentQuestions.size > 20) {
          const firstQuestion = Array.from(recentQuestions)[0];
          recentQuestions.delete(firstQuestion);
        }
      }
      
      return {
        id: Date.now().toString(),
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        difficulty,
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', response.data.choices[0].message.content);
      throw new Error('Invalid response format from OpenAI');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid OpenAI API key');
      }
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
};

const generateGeminiQuestion = async (
  apiKey: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question> => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Add recent questions to the prompt to help prevent repetition
    const recentQuestionsText = recentQuestions.size > 0 
      ? `\nRecently asked questions (DO NOT generate similar ones):\n${Array.from(recentQuestions).slice(-5).join('\n')}`
      : '';

    const prompt = `${SYSTEM_PROMPT}${recentQuestionsText}\n\nGenerate a ${difficulty} difficulty question.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Raw Gemini response:', text);

    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const questionData = JSON.parse(cleanedText);
      validateQuestionData(questionData);
      
      // Add the new question to history
      if (questionData.text) {
        recentQuestions.add(questionData.text);
        // Keep only last 20 questions in history
        if (recentQuestions.size > 20) {
          const firstQuestion = Array.from(recentQuestions)[0];
          recentQuestions.delete(firstQuestion);
        }
      }
      
      return {
        id: Date.now().toString(),
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        difficulty,
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      console.error('Parse error details:', parseError);
      throw new Error(`Invalid response format from Gemini. Raw response: ${text.substring(0, 200)}...`);
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Gemini API key');
      }
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw error;
  }
};

const generateGroqQuestion = async (
  apiKey: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<Question> => {
  try {
    const recentQuestionsText = getRecentQuestionsText();
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: `Generate a ${difficulty} difficulty question.${recentQuestionsText}`,

          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('No response from Groq');
    }

    try {
      const questionData = JSON.parse(response.data.choices[0].message.content);
      validateQuestionData(questionData);

      // Add the new question to history
      if (questionData.text) {
        recentQuestions.add(questionData.text);
        if (recentQuestions.size > 20) {
          const firstQuestion = Array.from(recentQuestions)[0];
          recentQuestions.delete(firstQuestion);
        }
      }
      
      return {
        id: Date.now().toString(),
        text: questionData.text,
        options: questionData.options,
        correctAnswer: questionData.correctAnswer,
        difficulty,
      };
    } catch (parseError) {
      console.error('Failed to parse Groq response:', response.data.choices[0].message.content);
      throw new Error('Invalid response format from Groq');
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Invalid Groq API key');
      }
      throw new Error(`Groq API error: ${error.message}`);
    }
    throw error;
  }
};

const validateQuestionData = (data: any): void => {
  if (!data.text || typeof data.text !== 'string') {
    throw new Error('Invalid question text');
  }
  if (!Array.isArray(data.options) || data.options.length !== 4) {
    throw new Error('Question must have exactly 4 options');
  }
  if (!data.correctAnswer || !data.options.includes(data.correctAnswer)) {
    throw new Error('Correct answer must be one of the options');
  }
};