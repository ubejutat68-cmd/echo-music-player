import { usePlaylistStore } from './playlistStore';
import { useThemeStore } from './themeStore';
import { useEqualizerStore } from './equalizerStore';

export async function loadPersistedState(): Promise<void> {
  try {
    if (!window.api?.store) return;

    const playlists = await window.api.store.get('playlists');
    if (playlists) {
      usePlaylistStore.setState({ playlists });
    }

    const favorites = await window.api.store.get('favorites');
    if (favorites) {
      usePlaylistStore.setState({ favorites });
    }

    const theme = await window.api.store.get('theme');
    if (theme) {
      useThemeStore.setState(theme);
    }

    const eqBands = await window.api.store.get('eqBands');
    const eqEnabled = await window.api.store.get('eqEnabled');
    if (eqBands) useEqualizerStore.setState({ bands: eqBands });
    if (eqEnabled !== undefined) useEqualizerStore.setState({ enabled: eqEnabled });
  } catch {
    // electron-store not available (running in browser dev mode)
  }
}

export function setupAutoSave(): void {
  if (!window.api?.store) return;

  usePlaylistStore.subscribe((state) => {
    window.api.store.set('playlists', state.playlists);
    window.api.store.set('favorites', state.favorites);
  });

  useThemeStore.subscribe((state) => {
    window.api.store.set('theme', {
      mode: state.mode,
      primaryColor: state.primaryColor,
      surfaceBlur: state.surfaceBlur,
      miniPlayerOnTop: state.miniPlayerOnTop,
    });
  });

  useEqualizerStore.subscribe((state) => {
    window.api.store.set('eqBands', state.bands);
    window.api.store.set('eqEnabled', state.enabled);
  });
}
