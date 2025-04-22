import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { Kernel } from './ai/kernel';

/* Initialize kernel & LLMs */

/*const openAIModelProvider = new OpenAIModelProvider();
const ollamaModelProvider = new OllamaModelProvider();
const aiModelService = new AIModelService({
  openai: openAIModelProvider,
  ollama: ollamaModelProvider,
});
dependencies.registerSingleton('AIModelService', aiModelService);

const kernel = new Kernel({
  workspaceModel,
  configModel,
  aiModelService,
  resourceModel,
  protocols,
});
dependencies.registerSingleton('Kernel', kernel);*/

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
