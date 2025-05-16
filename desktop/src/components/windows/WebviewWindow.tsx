import { Button, InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { HOMEPAGE_URL } from '../../App';

type Props = {
  initialUrl: string;
  onTitleChange?: (newTitle: string) => void;
  onUrlChange?: (newUrl: string) => void;
};

type Favorite = {
  title: string;
  url: string;
};

export function WebviewWindow({
  initialUrl,
  onTitleChange,
  onUrlChange,
}: Props) {
  const webviewRef = useRef<Electron.WebviewTag | null>(null);
  const inputValueRef = useRef<string>(initialUrl);
  const [inputValue, setInputValue] = useState(initialUrl);
  const [url, setUrl] = useState(initialUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const normalizeUrl = (raw: string): string => {
    try {
      const url = new URL(raw);
      return url.href;
    } catch {
      return `https://${raw}`;
    }
  };

  const handleBack = () =>
    webviewRef.current?.canGoBack() && webviewRef.current.goBack();
  const handleForward = () =>
    webviewRef.current?.canGoForward() && webviewRef.current.goForward();
  const handleReload = () => webviewRef.current?.reload();
  const handleHome = () => setUrl(HOMEPAGE_URL);

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = normalizeUrl(inputValueRef.current || '');
      setUrl(value);
      setInputValue(value);
      (e.target as HTMLInputElement).blur();
    }
  };

  useEffect(() => {
    const webview = webviewRef.current;
    const start = () => webview?.classList.add('disable-pointer-events');
    const end = () => webview?.classList.remove('disable-pointer-events');

    window.addEventListener('mousedown', start);
    window.addEventListener('mouseup', end);
    return () => {
      window.removeEventListener('mousedown', start);
      window.removeEventListener('mouseup', end);
    };
  }, []);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleTitle = (e: any) => {
      if (onTitleChange) onTitleChange(e.title);
    };

    webview.addEventListener('page-title-updated', handleTitle);
    return () => {
      webview.removeEventListener('page-title-updated', handleTitle);
    };
  }, [onTitleChange]);

  useEffect(() => {
    const updateNavState = () => {
      if (webviewRef.current) {
        setCanGoBack(webviewRef.current.canGoToOffset(-1));
        setCanGoForward(webviewRef.current.canGoToOffset(1));
      }
    };

    const webview = webviewRef.current;
    if (!webview) return;
    const handleNav = (e: any) => {
      setUrl(e.url);
      setInputValue(e.url);
      if (onUrlChange) onUrlChange(e.url);
      // Also update the inputValueRef if needed:
      inputValueRef.current = e.url;
      updateNavState();
    };
    webview.addEventListener('did-navigate', handleNav);
    return () => {
      webview.removeEventListener('did-navigate', handleNav);
    };
  }, [onUrlChange]);

  return (
    <Container>
      <HeaderContainer>
        <ButtonGroup>
          <StyledButton
            icon="arrow-left"
            onClick={handleBack}
            variant="minimal"
            disabled={canGoBack ? false : true}
          />
          <StyledButton
            icon="arrow-right"
            onClick={handleForward}
            variant="minimal"
            disabled={canGoForward ? false : true}
          />
          <StyledButton
            icon={webviewRef.current?.isLoading ? 'refresh' : 'stop'}
            onClick={handleReload}
            variant="minimal"
          />
          <StyledButton icon="home" onClick={handleHome} variant="minimal" />
        </ButtonGroup>

        <StyledInputGroup
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            inputValueRef.current = e.target.value;
          }}
          onBlur={() => {
            // Optionally, commit on blur if you want.
            setInputValue(normalizeUrl(inputValueRef.current || ''));
          }}
          onKeyDown={onInputKeyDown}
          fill
          leftElement={
            <Favicon
              src={`https://www.google.com/s2/favicons?sz=32&domain_url=${url}`}
            />
          }
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

const StyledWebview = styled('webview')`
  flex-grow: 1;
  border: none;
  background-color: #ffffff;

  &.disable-pointer-events {
    pointer-events: none;
  }
`;
