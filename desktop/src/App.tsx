import { Button } from '@blueprintjs/core';
import React, { useEffect, useRef } from 'react';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/react-mosaic-component.css';
import 'react-mosaic-component/styles/index.less';
import './App.less';
import { WindowManager, WindowManagerHandle } from './components/WindowManager';
import { ChatWindow } from './components/windows/ChatWindow';
import { WebviewWindow } from './components/windows/WebviewWindow';
import { ChatContextProvider } from './hooks/useChat';
import { urlNormalize } from './util/urlUtils';

export const CHAT_URL = 'http://localhost:3001';
export const HOMEPAGE_URL = urlNormalize('repl.it');
const NEW_WINDOW_URL = urlNormalize('applets.unternet.co/maps');

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
      windowManager.current.addToTopRight('Chat', <ChatWindow />);
    }
    if (needsInit.current && windowManager.current) {
      initWindows();
      needsInit.current = false;
    }
  }, [windowManager, needsInit]);

  const handleNewWindow = (url: string) => {
    windowManager.current?.addToTopRight(
      url,
      <WebviewWindow initialUrl={url} />
    );
  };

  const onClickAddWindow = () => handleNewWindow(NEW_WINDOW_URL);

  return (
    <ChatContextProvider>
      <div className="app-header bp5-dark">
        <Button
          onClick={onClickAddWindow}
          text="Add window"
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
        />
      </div>
      <WindowManager ref={windowManager} />
    </ChatContextProvider>
  );
}

export default App;
