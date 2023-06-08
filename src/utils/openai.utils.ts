import { ChatCompletionRequestMessage } from 'openai';

export const getOpenAiPayload = (message: string, action: string): ChatCompletionRequestMessage[] => {
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
};

export const getMessageContent = (result: any) => {
  const choice = result.data.choices.shift();
  const message = choice ? choice.message : null;

  if (!message || !message.content) {
    throw new Error('Invalid response content');
  }

  return message.content;
};
