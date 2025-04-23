import React, { useEffect, useRef } from 'react';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/react-mosaic-component.css';

import './App.css';
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

  return (
    <>
      <button
        onClick={() =>
          windowManager.current.addWindow('New Window', <h1>Some Stuff</h1>)
        }
      >
        Add window
      </button>
      <WindowManager ref={windowManager} />
    </>
  );
}

export default App;
