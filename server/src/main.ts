import { openai } from '@ai-sdk/openai';
import {
  ActionProposalResponse,
  DirectResponse,
  Interpreter,
  KernelMessage,
  Resource,
} from '@unternet/kernel';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import MarkdownIt from 'markdown-it';
import path from 'path';

const app = express();
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: 'http://localhost:5173' }));

const model = openai('gpt-4o-mini');
const interpreter = new Interpreter({
  model,
  hint: `
  If asked to 'do' something, ALWAYS respond with an action.
  NEVER generate a direct response unless the user is directly asking a question.
  If not explicitly generating an action, respond with human-readable markdown.
  Never try to change the state directly.`,
});

app.use((_req, res, next) => {
  res.locals.md = md;
  next();
});

app.use(
  '/node_modules',
  express.static(path.join(__dirname, '../../node_modules'))
);

// NOTE: Mirrored in useChat.tsx (client)
namespace Interpret {
  export type Request = {
    resources: Resource[];
    messages: KernelMessage[];
  };

  export type Response = (
    | (Omit<DirectResponse, 'content'> & { content: string })
    | (Omit<ActionProposalResponse, 'args'> & {
        args: string;
      })
  )[];
}

app.post('/interpret', async (req, res) => {
  const { messages, resources } = req.body as Interpret.Request;

  console.log('Received messages:', JSON.stringify(messages, null, 2));

  // Call interpreter with new resources.
  interpreter.updateResources(resources);
  const responses = interpreter.run(messages);

  // Process response(s). Not clear if there can actually be multiple.
  const results: Interpret.Response = [];
  for await (const response of responses) {
    if (response.type === 'direct') {
      let contentString = '';
      for await (const part of response.contentStream) {
        contentString += part;
      }

      results.push({
        ...response,
        content: contentString,
      });
    } else if (response.type === 'actionproposal') {
      results.push({
        ...response,
        args: JSON.stringify(response.args ?? {}),
      });
    }

    // TODO: We don't actually want to break here. Update when we know why
    // the generator isn't returning.
    break;
  }

  res.json(results);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chat server running on http://localhost:${PORT}`);
});
