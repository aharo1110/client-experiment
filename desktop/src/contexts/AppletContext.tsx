import React, { createContext, useContext, useState } from 'react';

import { Applet, applets } from '@web-applets/sdk';

type AppletContext = {
  factory: typeof applets;
  connect: (window: Window, url: string) => Promise<void>;
};

const AppletContext = createContext<AppletContext | undefined>(undefined);

type AppletInstance = {
  applet: Applet;
  window: Window;
  url: string;
};

export const AppletContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [factory] = useState<typeof applets>(applets);
  const [openApplets, setOpenApplets] = useState<AppletInstance[]>([]);

  // Registers an open applet (or possibly a regular web page)
  const connect = async (window: Window, url: string) => {
    try {
      const applet = await factory.connect(window);
      setOpenApplets([
        ...openApplets,
        {
          applet,
          window,
          url,
        },
      ]);
    } catch (e) {
      console.log(`Couldn't connect to ${url} as an applet.`);
      console.error(e);
    }
  };

  // Open applets changed?
  // useEffect(() => {
  //   fetch(`${CHAT_URL}/resources`, {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       resources: openApplets.map((instance) =>
  //         resource({
  //           uri: instance.url,
  //           actions: instance.applet.actions,
  //         })
  //       ),
  //     }),
  //   });
  // }, [openApplets]);

  return (
    <AppletContext.Provider value={{ factory, connect }}>
      {children}
    </AppletContext.Provider>
  );
};

// Use AppletFactory.connect() - this will attach a webview to an applet url ITSELF
// Send resources, not urls

export const useAppletContext = () => {
  const context = useContext(AppletContext);
  if (!context) {
    throw new Error('useUrls must be used within a UrlsProvider');
  }
  return context;
};
