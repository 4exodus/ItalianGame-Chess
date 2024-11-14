import { ChatWorker, ChatModule, type ModelRecord } from '@mlc-ai/web-llm';

let chatWorker: ChatWorker | null = null;
let chatModule: ChatModule | null = null;

const MODEL_URL = 'https://huggingface.co/mlc-ai/Llama-2-7b-chat-hf-q4f32_1/resolve/main/';
const MODEL_CONFIG = {
  model_url: MODEL_URL,
  local_id: 'Llama-2-7b-chat',
  required_features: ['shader-f16'],
  max_gen_len: 256,
  conv_template: 'llama-2',
  temperature: 0.7,
  repetition_penalty: 1.1,
  top_p: 0.9
};

export async function initializeLlama(): Promise<void> {
  if (chatModule) return;

  try {
    chatWorker = new ChatWorker();
    await chatWorker.initChat();
    
    chatModule = new ChatModule(chatWorker);
    await chatModule.reload(MODEL_CONFIG as ModelRecord);
  } catch (error) {
    console.error('Failed to initialize LLaMA:', error);
    throw error;
  }
}

export async function generateAnalysis(
  fen: string,
  stockfishEval: string,
  moveHistory: string[]
): Promise<string> {
  if (!chatModule) {
    throw new Error('LLaMA not initialized');
  }

  try {
    const prompt = `You are a chess expert analyzing a position.
    
Current position (FEN): ${fen}
Stockfish evaluation: ${stockfishEval}
Recent moves: ${moveHistory.slice(-5).join(', ')}

Provide a clear, concise analysis of:
1. The current position's key features
2. Strategic ideas for both sides
3. Any tactical opportunities
4. Recommendations for the next moves

Keep the analysis focused and use chess terminology appropriately.`;

    const response = await chatModule.generate(prompt);
    return response.trim();
  } catch (error) {
    console.error('LLaMA analysis error:', error);
    throw error;
  }
}

export async function generateExplanation(
  query: string,
  context: {
    fen: string;
    evaluation: string;
    moveHistory: string[];
  }
): Promise<string> {
  if (!chatModule) {
    throw new Error('LLaMA not initialized');
  }

  try {
    const prompt = `As a chess expert, answer the following question about the current position:

Position (FEN): ${context.fen}
Engine evaluation: ${context.evaluation}
Recent moves: ${context.moveHistory.slice(-5).join(', ')}

Question: ${query}

Provide a clear, helpful explanation using appropriate chess terminology.`;

    const response = await chatModule.generate(prompt);
    return response.trim();
  } catch (error) {
    console.error('LLaMA explanation error:', error);
    throw error;
  }
}

export function cleanup(): void {
  if (chatWorker) {
    chatWorker.terminate();
    chatWorker = null;
  }
  chatModule = null;
}