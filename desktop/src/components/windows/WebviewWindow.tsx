import { Button, InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';

type Props = {
  initialUrl: string;
  onTitleChange?: (newTitle: string) => void;
  onUrlChange?: (newUrl: string) => void;
};

export function WebviewWindow({ initialUrl, onTitleChange, onUrlChange }: Props) {
  const webviewRef = useRef<Electron.WebviewTag | null>(null); // ✅ fix typing
  const inputValueRef = useRef<string>(initialUrl);
  const [url, setUrl] = useState(initialUrl);

  // Disable pointer events during resizing
  useEffect(() => {
    const handleResizeStart = () => webviewRef.current?.classList.add('disable-pointer-events');
    const handleResizeEnd = () => webviewRef.current?.classList.remove('disable-pointer-events');

    window.addEventListener('mousedown', handleResizeStart);
    window.addEventListener('mouseup', handleResizeEnd);

    return () => {
      window.removeEventListener('mousedown', handleResizeStart);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  // Listen for title updates
  useEffect(() => {
    const currentWebview = webviewRef.current;
    if (currentWebview && onTitleChange) {
      const handleTitle = (e: any) => onTitleChange(e.title);
      currentWebview.addEventListener('page-title-updated', handleTitle);
      return () => {
        currentWebview?.removeEventListener('page-title-updated', handleTitle);
      };
    }
    return undefined;
  }, [onTitleChange]);

  // Listen for URL navigation
  useEffect(() => {
    const currentWebview = webviewRef.current;
    if (currentWebview && onUrlChange) {
      const handleNavigate = (e: any) => onUrlChange(e.url);
      currentWebview.addEventListener('did-navigate', handleNavigate);
      return () => {
        currentWebview?.removeEventListener('did-navigate', handleNavigate);
      };
    }
    return undefined;
  }, [onUrlChange]);

  // Load new URL when Enter is pressed
  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = inputValueRef.current;
      if (value) setUrl(value);
      (e.target as HTMLInputElement).blur();
    }
  };

  // Browsing controls
  const handleBack = () => {
    const webview = webviewRef.current;
    if (webview?.canGoBack()) webview.goBack();
  };

  const handleForward = () => {
    const webview = webviewRef.current;
    if (webview?.canGoForward()) webview.goForward();
  };

  const handleReload = () => {
    webviewRef.current?.reload();
  };

  return (
      <Container>
        <HeaderContainer>
          <ButtonGroup>
            <StyledButton icon="arrow-left" onClick={handleBack} />
            <StyledButton icon="arrow-right" onClick={handleForward} />
            <StyledButton icon="refresh" onClick={handleReload} />
          </ButtonGroup>
          <StyledInputGroup
              defaultValue={url}
              onValueChange={(s) => (inputValueRef.current = s)}
              onBlur={() => setUrl(inputValueRef.current)}
              onKeyDown={onInputKeyDown}
              fill
          />
        </HeaderContainer>
        <StyledWebview ref={webviewRef} src={url} />
      </Container>
  );
}

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #1e1e1e;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  gap: 10px;
  background-color: #2b2f36;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  z-index: 1;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 6px;
`;

const StyledButton = styled(Button)`
  padding: 6px 8px;
  min-width: unset;
  border-radius: 4px;
`;

const StyledInputGroup = styled(InputGroup)`
  flex-grow: 1;

  input {
    border-radius: 6px;
    background-color: #1f1f1f;
    color: #f5f5f5;
    border: 1px solid #444;
    padding: 8px;
  }
`;

const StyledWebview = styled('webview')`
  flex-grow: 1;
  border: none;
  background-color: white;

  &.disable-pointer-events {
    pointer-events: none;
  }
`;
