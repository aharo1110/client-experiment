import { Button, InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { HOMEPAGE_URL } from '../../App';
import { useChat } from '../../hooks/useChat';
import { urlNormalize, urlStrip } from '../../util/urlUtils';

type Props = {
  initialUrl: string;
  onTitleChange?: (newTitle: string) => void;
  onUrlChange?: (newUrl: string) => void;
};

export function WebviewWindow({
  initialUrl,
  onTitleChange,
  onUrlChange,
}: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);

  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyStack, setHistoryStack] = useState<string[]>([initialUrl]);

  const frameRef = useRef<HTMLIFrameElement>(null);

  const chat = useChat();

  // URL change handler (also runs on mount)
  useEffect(() => {
    // Update input box
    setInputUrl(url);

    // Invoke callback
    onUrlChange?.(url);

    // Just use the url as the title
    onTitleChange?.(urlStrip(url));

    (async () => {
      // Register iframe with chat
      if (frameRef.current) {
        await chat.connect(frameRef.current.contentWindow, new URL(url));
      }
    })();
  }, [url, frameRef.current]);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigateTo(urlNormalize(inputUrl));
    }
  };

  useEffect(() => {
    const frame = frameRef.current;
    const onMouseDown = () => frame?.classList.add('disable-pointer-events');
    const onMouseUp = () => frame?.classList.remove('disable-pointer-events');

    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const navigateTo = (newUrl: string) => {
    // Ignore navigation to same URL
    if (newUrl == url) {
      return;
    }

    // Perform "navigation" (update history)
    // Erase history ahead (if applicable)
    if (historyIndex !== historyStack.length - 1) {
      setHistoryStack((prev) => prev.slice(0, historyIndex + 1));
    }

    // Add the new URL to history
    setHistoryStack((prev) => [...prev, newUrl]);
    setHistoryIndex((prev) => prev + 1);

    // Apply the URL change
    setUrl(newUrl);
  };

  const handleBack = useCallback(() => {
    // Update current index
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);

    // Apply the URL change
    setUrl(historyStack[newIndex]);
  }, [historyStack, historyIndex]);

  const handleForward = useCallback(() => {
    // Update current index
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);

    // Apply the URL change
    setUrl(historyStack[newIndex]);
  }, [historyStack, historyIndex]);

  const canGoBack = historyStack.length > 1 && historyIndex > 0;
  const canGoForward =
    historyStack.length > 1 && historyIndex < historyStack.length - 1;

  const handleReload = () => {
    // Reload the current URL
    if (frameRef.current) {
      frameRef.current.src = frameRef.current.src;
    }
  }

  return (
    <Container>
      <HeaderContainer>
        <ButtonGroup>
          <StyledButton
            icon="arrow-left"
            onClick={handleBack}
            variant="minimal"
            disabled={!canGoBack}
          />
          <StyledButton
            icon="arrow-right"
            onClick={handleForward}
            variant="minimal"
            disabled={!canGoForward}
          />
          <StyledButton
            icon="repeat"
            onClick={handleReload}
            variant="minimal"
          />
          <StyledButton
            icon="home"
            onClick={() => navigateTo(HOMEPAGE_URL)}
            variant="minimal"
          />
        </ButtonGroup>

        <StyledInputGroup
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={onInputKeyDown}
          fill
          leftElement={
            <Favicon
              src={`https://www.google.com/s2/favicons?sz=32&domain_url=${url}`}
            />
          }
        />
      </HeaderContainer>
      <StyledFrame ref={frameRef} src={url} />
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #ffffff;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #e4e4e4;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0;
  padding-left: 7px;
`;

const StyledButton = styled(Button)`
  padding: 6px 0;
  width: 32px;
  min-width: unset;
  border-radius: 4px;
`;

const Favicon = styled.img`
  width: 20px;
  height: 20px;
  margin: 5px;
  border-radius: 4px;
`;

const StyledInputGroup = styled(InputGroup)`
  flex-grow: 1;

  input {
    border-radius: 0;
    background-color: #fff;
    color: #111;
    border: 1px solid #ccc;
    padding: 8px;
    font-family: 'Segoe UI', system-ui, sans-serif;
  }
`;

const StyledFrame = styled.iframe`
  flex-grow: 1;
  border: none;
  background-color: #ffffff;

  &.disable-pointer-events {
    pointer-events: none;
  }
`;
