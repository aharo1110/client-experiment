import { InputGroup } from '@blueprintjs/core';
import styled from '@emotion/styled';
import React, { KeyboardEvent, useEffect, useState } from 'react';

type Props = {
  initialUrl: string;
};

export function HeadlessWindow({ initialUrl }: Props) {
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

  // Only apply input value to state when Enter is pressed (or focus is lost).
  const onInputKeyDown = (e: KeyboardEvent) =>
    e.key === 'Enter' && (e.target as HTMLElement).blur();

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

const HeaderContainer = styled.div`
  align-items: center;
  justify-content: center;
`;

const StyledWebview = styled('webview')`
  width: 100%;
  height: 100%;
  background-color: black;
`;
