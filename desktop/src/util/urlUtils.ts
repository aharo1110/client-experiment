export function urlNormalize(url: string): string {
  // Add protocol if omitted
  if (!url.includes('://')) {
    url = `https://${url}`;
  }

  // Then use URL just in case.
  return new URL(url).href;
}

export function urlStrip(url: string): string {
  return url.split('://')[1].split('/')[0];
}
