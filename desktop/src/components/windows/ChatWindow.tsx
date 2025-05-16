import { Button, InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { inputMessage, KernelMessage, responseMessage } from '@unternet/kernel';
import MarkdownIt from 'markdown-it';
import React, { useCallback, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

export function ChatWindow() {
  const [input, setInput] = React.useState('');
  const [messageHistory, setMessageHistory] = React.useState<KernelMessage[]>(
    []
  );

  // Add sample messages on mount
  useEffect(() => {
    messageHistory.length === 0 &&
      setMessageHistory([
        inputMessage({ text: 'Hello!' }),
        responseMessage({ text: 'Hi! How can I help you?' }),
      ]);
  }, []);

  const chat = useChat();

  const onPressSend = useCallback(async () => {
    // Add input to history
    setMessageHistory((prev) => [...prev, inputMessage({ text: input })]);

    // Clear input
    setInput('');

    // Send message(s) to interpreter
    const results = await chat.processMessages([
      ...messageHistory,
      inputMessage({
        text: input,
      }),
    ]);

    if (!results.length) {
      console.error('No response from interpreter');
      return;
    }

    // Add resolved message to history
    setMessageHistory((prev) => [...prev, ...results]);
  }, [input, messageHistory]);

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
      onPressSend();
    }
  };

  return (
    <Container>
      <ChatContainer>
        <ChatContainerInner>
          {messageHistory
            .slice()
            .reverse()
            .map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
        </ChatContainerInner>
        <div style={{ flex: 1, minHeight: 12 }} />
      </ChatContainer>

      <ControlsContainer>
        <ChatInputGroup
          value={input}
          onValueChange={setInput}
          onKeyDown={onInputKeyDown}
          placeholder="Chat"
        />
        <Button onClick={onPressSend}>Send</Button>
      </ControlsContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;

  font-family: monospace;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-x: hidden;
  overflow-y: scroll;
`;

const ChatContainerInner = styled.div`
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
`;

const ControlsContainer = styled.div`
  gap: 8px;
  display: flex;
`;

const ChatInputGroup = styled(InputGroup)`
  flex: 1;
`;

type ChatMessageProps = {
  message: KernelMessage;
};

function ChatMessage({ message }: ChatMessageProps) {
  // Handle action messages
  if (message.type === 'action') {
    return (
      <ChatMessageContainer>
        <span>
          <b>{message.actionId}</b> with args
        </span>

        {message.args as unknown as string}
      </ChatMessageContainer>
    );
  }

  return (
    <ChatMessageContainer
      style={{
        alignSelf: message.type === 'input' ? 'flex-end' : 'flex-start',
      }}
    >
      <h4>{message.type === 'input' ? 'User' : 'Chat'}</h4>
      <div dangerouslySetInnerHTML={{ __html: md.render(message.text) }} />
    </ChatMessageContainer>
  );
}

const ChatMessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  display: flex;
`;
