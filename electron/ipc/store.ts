import Store from 'electron-store';

const store = new Store({
  defaults: {
    playlists: [],
    favorites: {
      id: '__favorites__',
      name: '我最喜欢',
      trackIds: [],
      coverArt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    theme: { mode: 'dark', primaryColor: '#1976d2', surfaceBlur: true, miniPlayerOnTop: true },
    lastScanPath: '',
    recentlyPlayed: [] as string[],
  },
});

export function getStoreValue(key: string): any {
  return store.get(key as any);
}

export function setStoreValue(key: string, value: any): void {
  store.set(key as any, value);
}

export function deleteStoreValue(key: string): void {
  store.delete(key as any);
}
