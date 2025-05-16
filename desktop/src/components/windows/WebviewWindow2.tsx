import { Button, InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { DidNavigateEvent, PageTitleUpdatedEvent } from 'electron';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { HOMEPAGE_URL } from '../../App';
import { useAppletContext } from '../../contexts/AppletContext';
import { useChat } from '../../hooks/useChat';
import { urlNormalize, urlStrip } from '../../util/urlUtils';

type Props = {
  initialUrl: string;
  onTitleChange?: (newTitle: string) => void;
  onUrlChange?: (newUrl: string) => void;
};

export function WebviewWindow2({
  initialUrl,
  onTitleChange,
  onUrlChange,
}: Props) {
  const [url, setUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);

  const frameRef = useRef<HTMLIFrameElement>(null);

  const appletContext = useAppletContext();
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
      // Connect applet factory to iframe
      // await appletContext.connect(frameRef.current.contentWindow, url);

      if (frameRef.current) {
        await chat.connect(frameRef.current.contentWindow, new URL(url));
      }
    })();
  }, [url, frameRef.current]);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setUrl(urlNormalize(inputUrl));
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

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const onPageTitleUpdated = (e: PageTitleUpdatedEvent) =>
      onTitleChange?.(e.title);

    frame.addEventListener('page-title-updated', onPageTitleUpdated);
    return () => {
      frame.removeEventListener('page-title-updated', onPageTitleUpdated);
    };
  }, [onTitleChange]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) {
      return;
    }

    const onDidNavigate = (e: DidNavigateEvent) => setUrl(e.url);

    frame.addEventListener('did-navigate', onDidNavigate);
    return () => {
      frame.removeEventListener('did-navigate', onDidNavigate);
    };
  }, [onUrlChange]);

  return (
    <Container>
      <HeaderContainer>
        <ButtonGroup>
          <StyledButton
            icon="arrow-left"
            // onClick={handleBack}
            variant="minimal"
            // disabled={canGoBack ? false : true}
          />
          <StyledButton
            icon="arrow-right"
            // onClick={handleForward}
            variant="minimal"
            // disabled={canGoForward ? false : true}
          />
          <StyledButton
            icon="refresh"
            // icon={webviewRef.current?.isLoading ? 'refresh' : 'stop'}
            // onClick={handleReload}
            variant="minimal"
          />
          <StyledButton
            icon="home"
            onClick={() => setUrl(HOMEPAGE_URL)}
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
