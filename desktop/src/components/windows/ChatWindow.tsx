import { Button, Card, InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { inputMessage, KernelMessage } from '@unternet/kernel';
import React from 'react';
import { useChat } from '../../hooks/useChat';

export function ChatWindow() {
  const [input, setInput] = React.useState('');
  const [messageHistory, setMessageHistory] = React.useState<KernelMessage[]>(
    []
  );

  const chat = useChat();

  const onPressSend = async () => {
    // Add input to history
    setMessageHistory((prev) => [...prev, inputMessage({ text: input })]);

    // Send message(s) to interpreter
    const resolved = await chat.resolve([
      ...messageHistory,
      inputMessage({
        text: input,
      }),
    ]);

    if (resolved == null) {
      console.error('No response from interpreter');
      return;
    }

    // Add resolved message to history
    setMessageHistory((prev) => [...prev, resolved]);

    console.log(`Resolved response: ${JSON.stringify(resolved)}`);

    // Clear input
    setInput('');
  };

  return (
    <Container>
      <ChatContainer>
        {messageHistory
          .filter((msg) => msg.type !== 'action')
          .map((msg, idx) => (
            <Card key={idx}>
              {msg.text} ({msg.type})
            </Card>
          ))}
      </ChatContainer>
      <ControlsContainer>
        <ChatInputGroup
          value={input}
          onValueChange={setInput}
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
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow: scroll;
`;

const ControlsContainer = styled.div`
  gap: 8px;
  display: flex;
`;

const ChatInputGroup = styled(InputGroup)`
  flex: 1;
`;
