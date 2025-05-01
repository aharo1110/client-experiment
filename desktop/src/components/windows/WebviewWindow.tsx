import { Button, InputGroup, Menu, MenuItem, Popover } from '@blueprintjs/core';
import styled from '@emotion/styled';
import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';

type Props = {
  initialUrl: string;
  onTitleChange?: (newTitle: string) => void;
  onUrlChange?: (newUrl: string) => void;
};

export function WebviewWindow({ initialUrl, onTitleChange, onUrlChange }: Props) {
  const webviewRef = useRef<Electron.WebviewTag | null>(null);
  const inputValueRef = useRef<string>(initialUrl);
  const [url, setUrl] = useState(initialUrl);
  const [darkMode, setDarkMode] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  const normalizeUrl = (raw: string): string => {
    try {
      const url = new URL(raw);
      return url.href;
    } catch {
      return `https://${raw}`;
    }
  };

  const isFavorited = favorites.includes(url);

  const toggleFavorite = () => {
    setFavorites((prev) =>
        prev.includes(url) ? prev.filter((fav) => fav !== url) : [...prev, url]
    );
  };

  const handleBack = () => webviewRef.current?.canGoBack() && webviewRef.current.goBack();
  const handleForward = () => webviewRef.current?.canGoForward() && webviewRef.current.goForward();
  const handleReload = () => webviewRef.current?.reload();
  const handleHome = () => setUrl('https://www.google.com');

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const value = normalizeUrl(inputValueRef.current || '');
      setUrl(value);
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
    if (!webview || !onTitleChange) return;

    const handleTitle = (e: any) => onTitleChange(e.title);
    webview.addEventListener('page-title-updated', handleTitle);
    return () => {
      webview.removeEventListener('page-title-updated', handleTitle);
    };
  }, [onTitleChange]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview || !onUrlChange) return;

    const handleNav = (e: any) => onUrlChange(e.url);
    webview.addEventListener('did-navigate', handleNav);
    return () => {
      webview.removeEventListener('did-navigate', handleNav);
    };
  }, [onUrlChange]);

  return (
      <Container darkMode={darkMode}>
        <HeaderContainer darkMode={darkMode}>
          <ButtonGroup>
            <StyledButton icon="arrow-left" onClick={handleBack} />
            <StyledButton icon="arrow-right" onClick={handleForward} />
            <StyledButton icon="refresh" onClick={handleReload} />
            <StyledButton icon="home" onClick={handleHome} />
            <StyledButton
                icon={darkMode ? 'flash' : 'moon'}
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle dark mode"
            />
            <StyledButton
                icon={isFavorited ? 'star' : 'star-empty'}
                onClick={toggleFavorite}
                intent={isFavorited ? 'warning' : 'none'}
                title={isFavorited ? 'Unfavorite' : 'Add to Favorites'}
            />
            <Popover
                content={
                  <Menu>
                    {favorites.length === 0 ? (
                        <MenuItem text="No favorites yet" disabled />
                    ) : (
                        favorites.map((fav) => (
                            <MenuItem
                                key={fav}
                                text={fav}
                                onClick={() => setUrl(fav)}
                                icon="link"
                            />
                        ))
                    )}
                  </Menu>
                }
                position="bottom"
            >
              <StyledButton icon="bookmark" title="View favorites" />
            </Popover>
          </ButtonGroup>
          <Favicon src={`https://www.google.com/s2/favicons?sz=32&domain_url=${url}`} />
          <StyledInputGroup
              defaultValue={url}
              onValueChange={(s) => (inputValueRef.current = s)}
              onBlur={() => setUrl(normalizeUrl(inputValueRef.current || ''))}
              onKeyDown={onInputKeyDown}
              fill
              darkMode={darkMode}
          />
        </HeaderContainer>
        <StyledWebview ref={webviewRef} src={url} darkMode={darkMode} />
      </Container>
  );
}

// Styled Components
const Container = styled.div<{ darkMode: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ darkMode }) => (darkMode ? '#1e1e1e' : '#ffffff')};
`;

const HeaderContainer = styled.div<{ darkMode: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  gap: 10px;
  background-color: ${({ darkMode }) => (darkMode ? '#2b2f36' : '#e4e4e4')};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
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

const Favicon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 6px;
  border-radius: 4px;
`;

const StyledInputGroup = styled(InputGroup, {
  shouldForwardProp: (prop) => prop !== 'darkMode',
})<{ darkMode: boolean }>`
  flex-grow: 1;

  input {
    border-radius: 6px;
    background-color: ${({ darkMode }) => (darkMode ? '#1f1f1f' : '#fff')};
    color: ${({ darkMode }) => (darkMode ? '#f5f5f5' : '#111')};
    border: 1px solid ${({ darkMode }) => (darkMode ? '#444' : '#ccc')};
    padding: 8px;
  }
`;

const StyledWebview = styled('webview')<{ darkMode: boolean }>`
  flex-grow: 1;
  border: none;
  background-color: ${({ darkMode }) => (darkMode ? '#121212' : '#ffffff')};

  &.disable-pointer-events {
    pointer-events: none;
  }
`;
