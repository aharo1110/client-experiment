import { Button } from '@blueprintjs/core';
import React, { useEffect, useRef } from 'react';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/react-mosaic-component.css';
import 'react-mosaic-component/styles/index.less';
import './App.less';
import { UrlSync } from './components/UrlSync';
import { WindowManager, WindowManagerHandle } from './components/WindowManager';
import { HeadlessWindow } from './components/windows/HeadlessWindow';
import { WebviewWindow } from './components/windows/WebviewWindow';
import { UrlsProvider } from './contexts/UrlsContext';

export const CHAT_URL = 'http://localhost:3001';
export const HOMEPAGE_URL = 'http://csumb.edu';
const NEW_WINDOW_URL = 'http://github.com';

function App() {
  const windowManager = useRef<WindowManagerHandle>(null);
  const needsInit = useRef(true);

  useEffect(() => {
    async function initWindows() {
      if (!windowManager.current) {
        return;
      }
      windowManager.current.addToTopRight(
        HOMEPAGE_URL,
        <WebviewWindow initialUrl={HOMEPAGE_URL} />
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
      windowManager.current.addToTopRight(
        'Chat',
        <HeadlessWindow initialUrl={CHAT_URL} onNewWindow={handleNewWindow}/>
      );
    }
    if (needsInit.current && windowManager.current) {
      initWindows();
      needsInit.current = false;
    }
  }, [windowManager, needsInit]);

  const onClickAddWindow = () => {
    windowManager.current.addToTopRight(
      NEW_WINDOW_URL,
      <WebviewWindow initialUrl={NEW_WINDOW_URL} />
    );
  };

  const handleNewWindow = (url: string) => {
      windowManager.current?.addToTopRight(
        url,
        <WebviewWindow initialUrl={url} />
      );
    };

  return (
    <UrlsProvider>
      <div className="app-header bp5-dark">
        <Button
          onClick={onClickAddWindow}
          text="Add window"
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
        />
      </div>
      <WindowManager ref={windowManager} />
      <UrlSync />
    </UrlsProvider>
  );
}

export default App;
