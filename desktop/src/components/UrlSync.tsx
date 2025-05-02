import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { useUrls } from '../contexts/UrlsContext';

const CHAT_URL = 'http://localhost:3001';
const URL_SYNC_INTERVAL = 1500;

export function UrlSync() {
  const { urls } = useUrls();

  // Create a debounced function that sends the POST request.
  const sendUrls = useCallback(
    debounce((currentUrls: string[]) => {
      fetch(`${CHAT_URL}/urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: currentUrls }),
      })
        .then((res) => res.json())
        .then((data) => console.log('Server responded:', data))
        .catch((err) => console.error('Error updating urls:', err));
    }, URL_SYNC_INTERVAL),
    []
  );

  useEffect(() => {
    sendUrls(urls);
    // Cleanup: cancel the debounced call when component unmounts or urls change.
    return () => {
      sendUrls.cancel();
    };
  }, [urls, sendUrls]);

  return null;
}
