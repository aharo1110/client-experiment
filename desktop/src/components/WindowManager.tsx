import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {
  createBalancedTreeFromLeaves,
  Mosaic,
  MosaicNode,
  MosaicWindow,
} from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';

export type WindowManagerHandle = {
  addWindow: (title: string, content: ReactNode) => void;
};

type WindowData = {
  id: string;
  title: string;
  content: ReactNode;
};

export const WindowManager = forwardRef<WindowManagerHandle>((_, ref) => {
  const [windows, setWindows] = useState<Record<string, WindowData>>({});
  const [layout, setLayout] = useState<MosaicNode<string> | null>(null);

  const addWindow = useCallback((title: string, content: ReactNode) => {
    setWindows((prev) => {
      const newId = `window-${Object.keys(prev).length + 1}`;
      const newWindows = { ...prev, [newId]: { id: newId, title, content } };

      const leafKeys = Object.keys(newWindows);
      const newLayout = createBalancedTreeFromLeaves(leafKeys);

      setLayout(newLayout);
      return newWindows;
    });
  }, []);

  useImperativeHandle(ref, () => ({
    addWindow,
  }));

  return layout ? (
    <Mosaic<string>
      renderTile={(id, path) => (
        <MosaicWindow<string>
          title={windows[id].title}
          path={path}
          createNode={() => ''}
        >
          <>{windows[id].content}</>
        </MosaicWindow>
      )}
      value={layout}
      onChange={setLayout}
    />
  ) : (
    <div style={{ height: '100%', width: '100%' }} />
  );
});
