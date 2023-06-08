import { ChatCompletionRequestMessage } from 'openai';

export function getOpenAiPayload(message: string, action: string): ChatCompletionRequestMessage[] {
  return [
    {
      role: 'system',
      content: action
    },
    {
      role: 'user',
      content: message
    }
  ];
}
