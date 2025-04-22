import React, { useEffect } from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';

import 'react-mosaic-component/react-mosaic-component.css';
import 'react-mosaic-component/styles/index.less';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import './App.less';

export type ViewId = 'a' | 'b' | 'c' | 'new';

// These are placeholders for the eventual webview based model we will use
const TITLE_MAP: Record<ViewId, string> = {
  a: 'https://www.unternet.co',
  b: 'https://en.wikipedia.org/wiki/NCSA_Mosaic',
  c: 'http://68k.news',
  new: 'https://csumb.edu/',
};

function App() {
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
    <Mosaic<ViewId>
      renderTile={(id, path) => (
        <MosaicWindow<ViewId> path={path} createNode={() => 'new'} title={TITLE_MAP[id]}>
          <webview id={id} src={TITLE_MAP[id]}></webview>
        </MosaicWindow>
      )}
      className={"mosaic-blueprint-theme"}
      blueprintNamespace="bp5"
      initialValue={{
        direction: 'row',
        first: 'a',
        second: {
          direction: 'column',
          first: 'b',
          second: 'c',
        },
      }}
    />
  );
}

export default App;