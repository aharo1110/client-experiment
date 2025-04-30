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
  ExpandButton
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

  const addWindow = useCallback(
    (title: string, content: ReactNode) =>
      setWindows((prev) => {
        const newId = Object.keys(prev).length + 1;
        const newWindows = { ...prev, [newId]: { id: newId, title, content } };
        const newLayout = createBalancedTreeFromLeaves(
          Object.keys(newWindows).map(Number)
        );

        setLayout(newLayout);
        return newWindows;
      }),
    []
  );

  const removeWindow = useCallback(
    (id: number) => {
      setWindows((prev) => {
        const { [id]: _, ...remainingWindows } = prev;
        const remainingIds = Object.keys(remainingWindows).map(Number);
        // Rebuild the layout based on the remaining window IDs
        const newLayout = createBalancedTreeFromLeaves(remainingIds);
        setLayout(newLayout);
        return remainingWindows;
      });
    },
    []
  );

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
          toolbarControls={[
            <ExpandButton />,
            <button
              key="close"
              title="Close"
              className="mosaic-default-control bp5-button bp5-minimal close-button bp5-icon-cross"
              onClick={() => {
                console.log('Closing window', id);
              removeWindow(id);
              }}
            />
          ]}
        >
          <>{windows[id].content}</>
        </MosaicWindow>
      )}
      className={'mosaic-blueprint-theme'}
      blueprintNamespace="bp5"
      value={layout}
      onChange={setLayout}
      onRelease={(id) => {
        console.log('blablabla', id);
      }}
    />
  );
});

function removeNodeFromTree<T>(tree: MosaicNode<T>, nodeId: T): MosaicNode<T> | null {
  if (tree === nodeId) {
    return null;
  }
  if (typeof tree === 'object') {
    const { first, second, direction } = tree;
    const newFirst = removeNodeFromTree(first, nodeId);
    const newSecond = removeNodeFromTree(second, nodeId);

    if (!newFirst && !newSecond) {
      return null;
    }
    if (!newFirst) {
      return newSecond;
    }
    if (!newSecond) {
      return newFirst;
    }

    return { first: newFirst, second: newSecond, direction };
  }
  return tree;
}