import React, { useEffect, useRef } from 'react';
import { Button } from '@blueprintjs/core';

import 'react-mosaic-component/react-mosaic-component.css';
import 'react-mosaic-component/styles/index.less';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import './App.less';
import { WindowManager, WindowManagerHandle } from './components/WindowManager';

function App() {
  const windowManager = useRef<WindowManagerHandle>(null);
  const needsInit = useRef(true);

  useEffect(() => {
    if (!needsInit.current || !windowManager.current) {
      return;
    }

    // Spawn initial window
    windowManager.current.addWindow('Window 1', <h1>Window 1</h1>);
    needsInit.current = false;
  }, [windowManager, needsInit]);

  // Strong resizing
  useEffect(() => {
    const handleResizeStart = () => {
      document.querySelectorAll('webview').forEach((webview) => {
        webview.classList.add('disable-pointer-events');
      });
    };

    const handleResizeEnd = () => {
      document.querySelectorAll('webview').forEach((webview) => {
        webview.classList.remove('disable-pointer-events');
      });
    };

    window.addEventListener('mousedown', handleResizeStart);
    window.addEventListener('mouseup', handleResizeEnd);

    return () => {
      window.removeEventListener('mousedown', handleResizeStart);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);
      
  return (
    <>
      <div className="app-header bp5-dark"><Button
        onClick={() =>
          windowManager.current.addWindow('New Window', <h1>Some Stuff</h1>)
        }
      text="Add window" /></div>
      <WindowManager ref={windowManager} />
    </>
  );
}

export default App;
