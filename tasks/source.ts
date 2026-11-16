const GAME_SOURCE = "https://raw.githubusercontent.com/dotabuff/d2vpkr/";

export function gameSourceUrl(url: string, revision: string): string {
  if (revision !== "master" && !/^[0-9a-f]{40}$/.test(revision)) {
    throw new Error("D2VPKR_SHA must be a full commit SHA or master");
  }
  return url.replace(GAME_SOURCE + "master/", GAME_SOURCE + revision + "/");
}

export function createSourceReader(revision: string, request = fetch) {
  const cache = new Map<string, Promise<string>>();
  return (url: string): Promise<string> => {
    const pinnedUrl = gameSourceUrl(url, revision);
    let pending = cache.get(pinnedUrl);
    if (!pending) {
      pending = request(pinnedUrl).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} fetching ${pinnedUrl}`);
        }
        return response.text();
      });
      cache.set(pinnedUrl, pending);
    }
    return pending;
  };
}
