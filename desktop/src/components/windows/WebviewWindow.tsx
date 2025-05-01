import { InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import React, { KeyboardEvent, useEffect, useState } from 'react';

type Props = {
  initialUrl: string;
  onTitleChange?: (newTitle: string) => void;
  onUrlChange?: (newUrl: string) => void;
};

export function WebviewWindow({ initialUrl, onTitleChange, onUrlChange }: Props) {
  const webviewRef = React.useRef<HTMLWebViewElement>(null);
  const inputValueRef = React.useRef<string>(null);
  const [url, setUrl] = useState(initialUrl);

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

  // Listen for title updates from the webview.
  useEffect(() => {
    const currentWebview = webviewRef.current;
    if (currentWebview && onTitleChange) {
      const handlePageTitleUpdated = (e: any) => {
        onTitleChange(e.title);
      };
      currentWebview.addEventListener('page-title-updated', handlePageTitleUpdated);
      return () => {
        currentWebview.removeEventListener('page-title-updated', handlePageTitleUpdated);
      };
    }
  }, [onTitleChange]);

  useEffect(() => {
    const currentWebview = webviewRef.current;
    if (currentWebview && onUrlChange) {
      const handleDidNavigate = (event: any) => {
        // event.url contains the new URL after navigation.
        console.log('Navigated to:', event.url);
        onUrlChange(event.url);
      };
      currentWebview.addEventListener('did-navigate', handleDidNavigate);
      return () => {
        currentWebview.removeEventListener('did-navigate', handleDidNavigate);
      };
    }
  }, [onUrlChange]);

  // Only apply input value to state when Enter is pressed (or focus is lost).
  const onInputKeyDown = (e: KeyboardEvent) =>
    e.key === 'Enter' && (e.target as HTMLElement).blur();

  return (
    <Container>
      <HeaderContainer className="app-header bp5-dark">
        <InputGroup
          defaultValue={url}
          onValueChange={(s) => (inputValueRef.current = s)}
          onBlur={() => setUrl(inputValueRef.current)}
          onKeyDown={onInputKeyDown}
        />
      </HeaderContainer>
      <StyledWebview ref={webviewRef} src={url} />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const HeaderContainer = styled.div`
  align-items: center;
  justify-content: center;
`;

const StyledWebview = styled('webview')`
  width: 100%;
  height: 100%;
  background-color: white;
`;
