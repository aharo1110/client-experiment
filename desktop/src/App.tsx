import { Button } from '@blueprintjs/core';
import React, { useEffect, useRef } from 'react';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/react-mosaic-component.css';
import 'react-mosaic-component/styles/index.less';
import './App.less';
import { WindowManager, WindowManagerHandle } from './components/WindowManager';
import { WebviewWindow } from './components/windows/WebviewWindow';

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

  const onClickAddWindow = () => {
    windowManager.current.addWindow(
      'github.com',
      <WebviewWindow url="https://www.github.com" />
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
