import {
  Button,
  InputGroup,
  Menu,
  MenuItem,
  Popover,
} from '@blueprintjs/core';
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
  const [url, setUrl] = useState(initialUrl);
  const [inputValue, setInputValue] = useState(initialUrl);
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>('Untitled');

  const normalizeUrl = (raw: string): string => {
    try {
      const url = new URL(raw);
      return url.href;
    } catch {
      return `https://${raw}`;
    }
  };

  const isFavorited = favorites.some((fav) => fav.url === url);

  const toggleFavorite = () => {
    setFavorites((prev) =>
        isFavorited
            ? prev.filter((fav) => fav.url !== url)
            : [...prev, { url, title: currentTitle }]
    );
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
      setCurrentTitle(e.title);
      if (onTitleChange) onTitleChange(e.title);
    };

    webview.addEventListener('page-title-updated', handleTitle);
    return () => {
      webview.removeEventListener('page-title-updated', handleTitle);
    };
  }, [onTitleChange]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;
    const handleNav = (e: any) => {
      setUrl(e.url);
      setInputValue(e.url);
      if (onUrlChange) onUrlChange(e.url);
      // Also update the inputValueRef if needed:
      inputValueRef.current = e.url;
    };
    webview.addEventListener('did-navigate', handleNav);
    return () => {
      webview.removeEventListener('did-navigate', handleNav);
    };
  }, [onUrlChange]);

  return (
      <Container darkMode={darkMode}>
        <HeaderContainer darkMode={darkMode}>
          <ButtonGroup>
            <StyledButton icon="arrow-left" 
            onClick={handleBack} variant="minimal"
            disabled={webviewRef.current?.canGoBack ? true : false} />
            <StyledButton icon="arrow-right" 
            onClick={handleForward} variant="minimal" 
            disabled={webviewRef.current?.canGoForward ? true : false} />
            <StyledButton icon={webviewRef.current?.isLoading ? 'refresh' : 'stop'} 
            onClick={handleReload} variant="minimal" />
            <StyledButton icon="home" onClick={handleHome} variant="minimal" />
            {/*<StyledButton
                icon={darkMode ? 'flash' : 'moon'}
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle dark mode"
                variant="minimal"
            />
            <StyledButton
                icon={isFavorited ? 'star' : 'star-empty'}
                onClick={toggleFavorite}
                intent={isFavorited ? 'warning' : 'none'}
                title={isFavorited ? 'Unfavorite' : 'Add to Favorites'}
                variant="minimal"
            />
            <Popover
                content={
                  <StyledMenu darkMode={darkMode}>
                    {favorites.length === 0 ? (
                        <MenuItem text="No favorites yet" disabled />
                    ) : (
                        favorites.map((fav) => (
                            <StyledMenuItem
                                key={fav.url}
                                text={fav.title}
                                label={fav.url}
                                icon="link"
                                onClick={() => setUrl(fav.url)}
                                darkMode={darkMode}
                            />
                        ))
                    )}
                  </StyledMenu>
                }
                position="bottom"
            >
              <StyledButton icon="bookmark" title="View favorites" variant="minimal"/>
            </Popover>*/}
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
              darkMode={darkMode}
              leftElement={<Favicon src={`https://www.google.com/s2/favicons?sz=32&domain_url=${url}`} />}
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
  gap: 10px;
  background-color: ${({ darkMode }) => (darkMode ? '#2b2f36' : '#e4e4e4')};
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

const StyledInputGroup = styled(InputGroup, {
  shouldForwardProp: (prop) => prop !== 'darkMode',
})<{ darkMode: boolean }>`
  flex-grow: 1;

  input {
    border-radius: 0;
    background-color: ${({ darkMode }) => (darkMode ? '#1f1f1f' : '#fff')};
    color: ${({ darkMode }) => (darkMode ? '#f5f5f5' : '#111')};
    border: 1px solid ${({ darkMode }) => (darkMode ? '#444' : '#ccc')};
    padding: 8px;
    font-family: 'Segoe UI', system-ui, sans-serif;
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

const StyledMenu = styled(Menu)<{ darkMode: boolean }>`
  background-color: ${({ darkMode }) => (darkMode ? '#2a2a2a' : '#fff')};
  color: ${({ darkMode }) => (darkMode ? '#f0f0f0' : '#111')};
  min-width: 300px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${({ darkMode }) => (darkMode ? '#444' : '#ccc')};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
`;

const StyledMenuItem = styled(MenuItem)<{ darkMode: boolean }>`
  font-size: 13px;
  padding: 6px 12px;

  &:hover {
    background-color: ${({ darkMode }) => (darkMode ? '#393939' : '#f2f2f2')};
  }

  .bp5-icon {
    margin-right: 8px;
  }

  .bp5-menu-item-label {
    color: ${({ darkMode }) => (darkMode ? '#bbb' : '#666')};
    font-size: 11px;
  }
`;
