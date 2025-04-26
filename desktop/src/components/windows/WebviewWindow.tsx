import React, { useEffect } from 'react';

type Props = {
  url: string;
};

export function WebviewWindow({ url }: Props) {
  const webviewRef = React.useRef<HTMLWebViewElement>(null);

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

  return (
    <webview
      ref={webviewRef}
      src={url}
      style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
    />
  );
}
