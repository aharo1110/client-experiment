import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';

type Props = {
  initialUrl: string;
  onNewWindow?: (url: string) => void;
};

export function HeadlessWindow({ initialUrl, onNewWindow }: Props) {
  const webviewRef = React.useRef<HTMLWebViewElement>(null);

  const [url, setUrl] = useState(initialUrl);
  const [chatUrl, setChatUrl] = useState(initialUrl);

  // Prevent webview from interfering with resizing.
  useEffect(() => {
    const handleResizeStart = () =>
      webviewRef.current.classList.add('disable-pointer-events');

    const handleResizeEnd = () =>
      webviewRef.current.classList.remove('disable-pointer-events');

    window.addEventListener('mousedown', handleResizeStart);
    window.addEventListener('mouseup', handleResizeEnd);

    return () => {
      window.removeEventListener('mousedown', handleResizeStart);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleWillNavigate = (e: any) => {
      // If the new URL is different from the current URL, prevent navigation.
      if (e.url !== url) {
        e.preventDefault();
        if (onNewWindow) {
          onNewWindow(e.url);
        }
        webview.stop();
        setUrl(chatUrl);
      }
    };

    // Also listen for any attempts to open a new window.
    const handleNewWindow = (e: any) => {
      e.preventDefault();
      if (onNewWindow) {
        onNewWindow(e.url);
      }
      webview.stop();
      setUrl(chatUrl);
    };

    webview.addEventListener('will-navigate', handleWillNavigate);
    webview.addEventListener('new-window', handleNewWindow);
    return () => {
      webview.removeEventListener('will-navigate', handleWillNavigate);
      webview.removeEventListener('new-window', handleNewWindow);
    };
  }, [url, onNewWindow]);

  return (
    <Container>
      <StyledWebview ref={webviewRef} src={url} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledWebview = styled('webview')`
  width: 100%;
  height: 100%;
  background-color: black;
`;
