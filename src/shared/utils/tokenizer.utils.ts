import GPT3Tokenizer from 'gpt3-tokenizer';
import { ChatCompletionRequestMessage } from 'openai';

const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
const tokenLimit = parseInt(process.env.OPENAI_TOKEN_LIMIT || 'NaN');

export const checkTokenLimit = (chat: ChatCompletionRequestMessage[], context: any) => {
  const input = chat.map((x) => x.content).join();
  const encoded: { bpe: number[]; text: string[] } = tokenizer.encode(input);
  const tokens = encoded.bpe.length;

  if (tokens > tokenLimit) {
    throw new Error('Token limit exceeded');
  } else {
    logRequestTokens(tokens, context);
  }
};

const logRequestTokens = (tokens: number, context: any = {}) => {
  const requestArgs = { tokens, ...context };
  console.log(`Request monitoring: ${JSON.stringify(requestArgs)}`);
};
