import React, { useEffect, useRef } from 'react';

import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'react-mosaic-component/react-mosaic-component.css';

import './App.css';
import { WindowManager, WindowManagerHandle } from './components/WindowManager';

function App() {
  const windowManagerRef = useRef<WindowManagerHandle>(null);
  const needsInitRef = useRef(true);

  useEffect(() => {
    if (!needsInitRef.current || !windowManagerRef.current) {
      return;
    }

    windowManagerRef.current.addWindow('Window 1', <h1>Window 1</h1>);
    windowManagerRef.current.addWindow('Window 2', <h1>Window 2</h1>);
    needsInitRef.current = false;
  }, [windowManagerRef, needsInitRef]);

  return (
    <>
      <button
        onClick={() =>
          windowManagerRef.current.addWindow('New Window', <h1>Some Stuff</h1>)
        }
      >
        Add window
      </button>
      <WindowManager ref={windowManagerRef} />;
    </>
  );
}

export default App;
