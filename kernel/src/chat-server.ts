import express from 'express';
import path from 'path';
import 'dotenv/config';
import { 
    Interpreter, 
    DirectResponse, 
    ActionProposalResponse 
} from '@unternet/kernel';
import { openai } from '@ai-sdk/openai';
import { 
    inputMessage, 
    responseMessage,
    actionMessage,
    resource
} from '@unternet/kernel';
import { protocols } from './protocols';
import { ProcessRuntime } from '@unternet/kernel';

import cors from 'cors';
import MarkdownIt from 'markdown-it';

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

let messages: any[] = [];
let urls: string[] = [];
let applet_urls: string[] = ["https://applets.unternet.co/calculator"];

function assembleResources(urls: string[]) {
    const resources = urls.map(url => resource({ uri: url }));
    return resources;
}

let combinedUrls = Array.from(new Set([...urls, ...applet_urls]));
let resources = assembleResources(combinedUrls);

const model = openai('gpt-4o-mini');
const interpreter = new Interpreter({
    model, 
    resources, 
}); 
const runtime = new ProcessRuntime(protocols);

app.use((req, res, next) => {
    res.locals.md = md;
    next();
});

app.use('/node_modules', express.static(path.join(__dirname, '../../node_modules')));

app.get('/', (req, res) => { 
    res.render('index', { messages: [] });
});

app.get('/urls', (req, res) => {
    res.json({ urls });
});

app.post('/urls', (req, res) => {
    const { urls: newUrls } = req.body;
    if (Array.isArray(newUrls)) {
        urls = newUrls;
        res.json({ success: true });
        combinedUrls = Array.from(new Set([...urls, ...applet_urls]));
        resources = assembleResources(combinedUrls);
        interpreter.updateResources(resources);
    } else {
        res.status(400).json({ error: 'Invalid URLs' });
    }
});

app.get('/chat', (req, res) => {
    const renderedMessages = messages.map(msg => ({
        ...msg,
        html: md.render(msg.text || JSON.stringify(msg.content))
    }));
    res.json({ messages: renderedMessages });
});

app.post('/chat', async (req, res) => { 
    console.log('Received request:', req.body.user_input);
    const userInput = req.body.user_input; 
    if (!userInput) { 
        return res.status(400).json({ error: 'Say something!' }); 
    }
    
    const inputMsg = inputMessage({ text: userInput }); 
    messages.push(inputMsg);

    try { 
        const responses = interpreter.run(messages); 
        let iteration = await responses.next(); 
        while (!iteration.done) { 
            const response = iteration.value; 
            if (response.type === 'direct') { 
                const responseMsg = await createResponseMessage(response); 
                messages.push(responseMsg); 
            } else if (response.type === 'actionproposal') { 
                const actionMsg = await createActionMessage(response); 
                messages.push(actionMsg); 
            } else { 
                console.error('ERROR! on response type'); 
            } 
            iteration = await responses.next(messages); 
        } 
        const renderedMessages = messages.map(msg => ({
            ...msg,
            html: md.render(msg.text || JSON.stringify(msg.content))
        }));

        res.json({ messages: renderedMessages }); 
    } catch (error) { 
        console.error(error); 
        res.status(500).json({ error: 'ERROR! on kernel' }); 
    } 
});

async function createResponseMessage(response: DirectResponse) { 
    let total_text = ''; 
    for await (const part of response.contentStream) { 
        total_text += part; 
    } 
    return responseMessage({ text: total_text }); 
}

async function createActionMessage(response: ActionProposalResponse) { 
    const content = await runtime.dispatch(response); 
    return actionMessage({ 
        uri: response.uri, 
        actionId: response.actionId, 
        args: response.args, 
        content, 
    }); 
}

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => { 
    console.log(`Kernel chat server running on http://localhost:${PORT}`); 
});