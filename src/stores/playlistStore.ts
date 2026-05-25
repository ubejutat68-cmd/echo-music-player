import { create } from 'zustand';
import type { Playlist } from '@/types';
import { v4 as uuid } from 'uuid';

const FAVORITES_ID = '__favorites__';

function defaultFavorites(): Playlist {
  return {
    id: FAVORITES_ID,
    name: '我最喜欢',
    trackIds: [],
    coverArt: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface PlaylistState {
  playlists: Playlist[];
  favorites: Playlist;

  create: (name: string) => string;
  delete: (id: string) => void;
  rename: (id: string, name: string) => void;
  addTracks: (playlistId: string, trackIds: string[]) => void;
  removeTracks: (playlistId: string, trackIds: string[]) => void;
  reorder: (playlistId: string, fromIndex: number, toIndex: number) => void;
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  getPlaylist: (id: string) => Playlist | undefined;
}

function updatePlaylist(playlists: Playlist[], id: string, fn: (p: Playlist) => Playlist): Playlist[] {
  return playlists.map((p) => (p.id === id ? { ...fn(p), updatedAt: Date.now() } : p));
}

export const usePlaylistStore = create<PlaylistState>((set, get) => ({
  playlists: [],
  favorites: defaultFavorites(),

  create: (name) => {
    const id = uuid();
    const playlist: Playlist = {
      id,
      name,
      trackIds: [],
      coverArt: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ playlists: [...s.playlists, playlist] }));
    return id;
  },

  delete: (id) => set((s) => ({
    playlists: s.playlists.filter((p) => p.id !== id),
  })),

  rename: (id, name) => set((s) => ({
    playlists: updatePlaylist(s.playlists, id, (p) => ({ ...p, name })),
  })),

  addTracks: (playlistId, trackIds) => {
    if (playlistId === FAVORITES_ID) {
      set((s) => ({
        favorites: {
          ...s.favorites,
          trackIds: [...new Set([...s.favorites.trackIds, ...trackIds])],
          updatedAt: Date.now(),
        },
      }));
    } else {
      set((s) => ({
        playlists: updatePlaylist(s.playlists, playlistId, (p) => ({
          ...p,
          trackIds: [...new Set([...p.trackIds, ...trackIds])],
        })),
      }));
    }
  },

  removeTracks: (playlistId, trackIds) => {
    const removeSet = new Set(trackIds);
    if (playlistId === FAVORITES_ID) {
      set((s) => ({
        favorites: {
          ...s.favorites,
          trackIds: s.favorites.trackIds.filter((id) => !removeSet.has(id)),
          updatedAt: Date.now(),
        },
      }));
    } else {
      set((s) => ({
        playlists: updatePlaylist(s.playlists, playlistId, (p) => ({
          ...p,
          trackIds: p.trackIds.filter((id) => !removeSet.has(id)),
        })),
      }));
    }
  },

  reorder: (playlistId, fromIndex, toIndex) => {
    if (playlistId === FAVORITES_ID) {
      set((s) => {
        const ids = [...s.favorites.trackIds];
        const [moved] = ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, moved);
        return { favorites: { ...s.favorites, trackIds: ids, updatedAt: Date.now() } };
      });
    } else {
      set((s) => ({
        playlists: updatePlaylist(s.playlists, playlistId, (p) => {
          const ids = [...p.trackIds];
          const [moved] = ids.splice(fromIndex, 1);
          ids.splice(toIndex, 0, moved);
          return { ...p, trackIds: ids };
        }),
      }));
    }
  },

  toggleFavorite: (trackId) => {
    const { favorites } = get();
    if (favorites.trackIds.includes(trackId)) {
      get().removeTracks(FAVORITES_ID, [trackId]);
    } else {
      get().addTracks(FAVORITES_ID, [trackId]);
    }
  },

  isFavorite: (trackId) => get().favorites.trackIds.includes(trackId),

  getPlaylist: (id) => {
    if (id === FAVORITES_ID) return get().favorites;
    return get().playlists.find((p) => p.id === id);
  },
}));
