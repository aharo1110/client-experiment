import {
  AIModelDescriptor,
  AIModelProviderConfig,
  AIModelProviderName,
} from './ai/ai-models';

export interface ConfigData {
  ai: {
    providers: {
      [id: string]: AIModelProviderConfig;
    };
    primaryModel: AIModelDescriptor | null;
    globalHint: string;
  };
}

export const initConfig: ConfigData = {
  ai: {
    providers: {},
    primaryModel: null,
    globalHint: '',
  },
};