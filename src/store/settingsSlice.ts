import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type LLMProvider = 'ollama' | 'openai' | 'gemini' | 'groq';

interface SettingsState {
  provider: LLMProvider;
  apiKey: string;
  ollamaModel: string;
  isConfigured: boolean;
}

const initialState: SettingsState = {
  provider: 'ollama',
  apiKey: '',
  ollamaModel: '',
  isConfigured: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setProvider: (state, action: PayloadAction<LLMProvider>) => {
      state.provider = action.payload;
    },
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
    },
    setOllamaModel: (state, action: PayloadAction<string>) => {
      state.ollamaModel = action.payload;
    },
    saveSettings: (state) => {
      state.isConfigured = true;
    },
    resetSettings: (state) => {
      return initialState;
    },
  },
});

export const {
  setProvider,
  setApiKey,
  setOllamaModel,
  saveSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer; 