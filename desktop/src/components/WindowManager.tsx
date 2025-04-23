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
  id: number;
  title: string;
  content: ReactNode;
};

export const WindowManager = forwardRef<WindowManagerHandle>((_, ref) => {
  const [windows, setWindows] = useState<Record<number, WindowData>>({});
  const [layout, setLayout] = useState<MosaicNode<number> | null>(null);

  const addWindow = useCallback((title: string, content: ReactNode) => {
    setWindows((prev) => {
      const newId = Object.keys(prev).length + 1;
      const newWindows = { ...prev, [newId]: { id: newId, title, content } };
      const newLayout = createBalancedTreeFromLeaves(
        Object.keys(newWindows).map(Number)
      );

      setLayout(newLayout);
      return newWindows;
    });
  }, []);

  useImperativeHandle(ref, () => ({
    addWindow,
  }));

  if (!layout) {
    return <h1>Empty</h1>;
  }

  return (
    <Mosaic<number>
      renderTile={(id, path) => (
        <MosaicWindow<number>
          title={windows[id].title}
          path={path}
          // createNode={() => 0}
        >
          <>{windows[id].content}</>
        </MosaicWindow>
      )}
      className={'mosaic-blueprint-theme'}
      blueprintNamespace="bp5"
      value={layout}
      onChange={setLayout}
    />
  );
});
