import React, { createContext, useContext, useState } from 'react';

type UrlsContextType = {
  urls: string[];
  setUrls: (urls: string[]) => void;
};

const UrlsContext = createContext<UrlsContextType | undefined>(undefined);

export const UrlsProvider = ({ children }: { children: React.ReactNode }) => {
  const [urls, setUrls] = useState<string[]>([]);
  return (
    <UrlsContext.Provider value={{ urls, setUrls }}>
      {children}
    </UrlsContext.Provider>
  );
};

export const useUrls = () => {
  const context = useContext(UrlsContext);
  if (!context) {
    throw new Error('useUrls must be used within a UrlsProvider');
  }
  return context;
};
