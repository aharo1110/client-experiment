import React, {
  forwardRef,
  ReactNode,
  useCallback,
  useImperativeHandle,
  useState,
} from 'react';
import {
  getLeaves,
  getPathToCorner,
  getNodeAtPath,
  getOtherDirection,
  updateTree,
  Corner,
  MosaicParent,
  MosaicDirection,
  createBalancedTreeFromLeaves,
  Mosaic,
  MosaicNode,
  MosaicWindow,
  ExpandButton
} from 'react-mosaic-component';
import { dropRight } from 'lodash-es';
import 'react-mosaic-component/react-mosaic-component.css';

export type WindowManagerHandle = {
  addToTopRight: (title: string, content: ReactNode) => void;
};

type WindowData = {
  id: number;
  title: string;
  content: ReactNode;
};

export const WindowManager = forwardRef<WindowManagerHandle>((_, ref) => {
  const [windows, setWindows] = useState<Record<number, WindowData>>({});
  const [layout, setLayout] = useState<MosaicNode<number> | null>(null);

  const [windowIdCounter, setWindowIdCounter] = useState(1);

  const updateWindowTitle = useCallback((id: number, newTitle: string) => {
    setWindows((prev) => ({
      ...prev,
      [id]: { ...prev[id], title: newTitle },
    }));
  }, []);
  
  const addToTopRight = useCallback(
    (title: string, content: ReactNode) => {
      const newId = windowIdCounter;
      setWindowIdCounter(windowIdCounter + 1);
      setWindows((prev) => ({
        ...prev,
        [newId]: { id: newId, title, content },
      }));
  
      if (layout) {
        const totalWindowCount = getLeaves(layout).length;
        const path = getPathToCorner(layout, Corner.TOP_RIGHT);
        const parent = getNodeAtPath(layout, dropRight(path)) as MosaicParent<number> | null;
        const destination = getNodeAtPath(layout, path) as number;
        const direction: MosaicDirection = parent ? getOtherDirection(parent.direction) : 'row';
  
        const first = direction === "row" ? destination : newId;
        const second = direction === "row" ? newId : destination;
  
        const newLayout = updateTree(layout, [
          {
            path: path,
            spec: {
              $set: {
                direction,
                first,
                second,
              },
            },
          },
        ]);
        setLayout(newLayout);
      } else {
        setLayout(newId);
      }
    },
    [layout, windowIdCounter]
  );

  useImperativeHandle(ref, () => ({
    addToTopRight
  }));

  if (!layout) {
    return <h1>Empty</h1>;
  }

  const removeNodePreservingLayout = <T,>(
    tree: MosaicNode<T> | null,
    nodeId: T
  ): MosaicNode<T> | null => {
    if (!tree) return null;
    if (tree === nodeId) {
      return null;
    }
    if (typeof tree === "object") {
      const newFirst = removeNodePreservingLayout(tree.first, nodeId);
      const newSecond = removeNodePreservingLayout(tree.second, nodeId);
  
      if (newFirst === null && newSecond === null) {
        return null;
      }
      if (newFirst === null) {
        return newSecond;
      }
      if (newSecond === null) {
        return newFirst;
      }
      return {
        first: newFirst,
        second: newSecond,
        direction: tree.direction,
        splitPercentage: (tree as any).splitPercentage,
      };
    }
    return tree;
  }

  return (
    <Mosaic<number>
    renderTile={(id, path) => {
      // If the content is a valid React element, inject the onTitleChange prop.
      const content = windows[id].content;
      const contentWithTitle =
        React.isValidElement(content)
          ? React.cloneElement(content, { 
              onTitleChange: (newTitle: string) => updateWindowTitle(id, newTitle)
            })
          : content;

      return (
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
                setWindows((prev) => {
                  const { [id]: removed, ...remainingWindows } = prev;
                  return remainingWindows;
                });
                setLayout((prevLayout) => removeNodePreservingLayout(prevLayout, id));
              }}
            />
          ]}
        >
          {contentWithTitle}
        </MosaicWindow>
      );}}
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
