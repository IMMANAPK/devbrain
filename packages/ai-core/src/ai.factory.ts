import { OllamaProvider } from './ollama.provider.js';
import { ClaudeProvider } from './claude.provider.js';
import { AIProvider, AIMode } from './types.js';

export function createAIProvider(mode: AIMode, options: {
  ollamaUrl?: string;
  ollamaModel?: string;
  claudeApiKey?: string;
  claudeModel?: string;
}): AIProvider {
  if (mode === 'claude') {
    if (!options.claudeApiKey) throw new Error('CLAUDE_API_KEY is required for claude mode');
    return new ClaudeProvider(options.claudeApiKey, options.claudeModel);
  }
  return new OllamaProvider(options.ollamaUrl, options.ollamaModel);
}
