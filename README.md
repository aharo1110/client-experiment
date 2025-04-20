# client-experiment
Experimental web applets client for Capstone project. Now based off of Unternet's client.

## Setup

# DON'T RUN YET!
### This hasn't been fully refactored yet.

- Run `npm install`
- Copy `.env.example` to `.env` and fill in the required environment variables
- Start the native client with `npm run dev`

## Local Models

Operator has support for running LLM inference locally using [Ollama](https://ollama.com/).
By default, this will be used if no Vite OpenAI API key has been provided as an environment variable.

To set this up on Linux use this to download and install Ollama:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Or download the binary from [their webisite](https://ollama.com/download).

Once installed use this to download the qwen2.5-coder:3b model which is the default.

```bash
ollama run qwen2.5-coder:3b
```