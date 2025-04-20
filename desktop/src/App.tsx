import React from 'react';
import { Mosaic, MosaicWindow } from 'react-mosaic-component';

import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import './App.css';

export type ViewId = 'a' | 'b' | 'c' | 'new';

const TITLE_MAP: Record<ViewId, string> = {
  a: 'Left Window',
  b: 'Top Right Window',
  c: 'Bottom Right Window',
  new: 'New Window',
};

function App() {
  return (
    <Mosaic<ViewId>
      renderTile={(id, path) => (
        <MosaicWindow<ViewId> path={path} createNode={() => 'new'} title={TITLE_MAP[id]}>
          <h1>{TITLE_MAP[id]}</h1>
        </MosaicWindow>
      )}
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