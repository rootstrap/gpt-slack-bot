import GPT3Tokenizer from 'gpt3-tokenizer';
import { ChatCompletionRequestMessage } from 'openai';

const tokenizer = new GPT3Tokenizer({ type: 'gpt3' });
const tokenLimit = parseInt(process.env.OPENAI_TOKEN_LIMIT || 'NaN');

export const checkTokenLimit = (chat: ChatCompletionRequestMessage[]) => {
  const input = chat.map((x) => x.content).join();
  const encoded: { bpe: number[]; text: string[] } = tokenizer.encode(input);

  if (encoded.bpe.length > tokenLimit) {
    throw new Error('Token limit exceeded');
  }
};
