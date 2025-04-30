import { Button } from '@blueprintjs/core';
import React, { useEffect, useRef } from 'react';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/react-mosaic-component.css';
import 'react-mosaic-component/styles/index.less';
import './App.less';
import { WindowManager, WindowManagerHandle } from './components/WindowManager';
import { WebviewWindow } from './components/windows/WebviewWindow';

export const CHAT_URL = "http://localhost:3001";

function App() {
  const windowManager = useRef<WindowManagerHandle>(null);
  const needsInit = useRef(true);

  useEffect(() => {
    async function initWindows() {
      if (!windowManager.current) {
        return;
      }
      windowManager.current.addToTopRight(
        'CSUMB',
        <WebviewWindow initialUrl="https://csumb.edu" />
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
      windowManager.current.addToTopRight(
        'Chat',
        <WebviewWindow initialUrl={CHAT_URL} />
      );
    }
    if (needsInit.current && windowManager.current) {
      initWindows();
      needsInit.current = false;
    }
  }, [windowManager, needsInit]);

  const onClickAddWindow = () => {
    windowManager.current.addToTopRight(
      'github.com',
      <WebviewWindow initialUrl="https://github.com" />
    );
  };

  return (
    <>
      <div className="app-header bp5-dark">
        <Button onClick={onClickAddWindow} text="Add window" />
      </div>
      <WindowManager ref={windowManager} />
    </>
  );
}

export default App;
