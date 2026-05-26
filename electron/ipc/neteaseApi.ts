const { cloudsearch, song_url_v1, lyric_new } = require('NeteaseCloudMusicApi');

function getCookie(): string {
  try {
    const Store = require('electron-store');
    const store = new Store();
    return store.get('neteaseCookie', '') as string;
  } catch {
    return '';
  }
}

export interface NeteaseTrack {
  id: number;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl: string };
  duration: number;
}

export async function searchNeteaseMusic(query: string, page = 1): Promise<NeteaseTrack[]> {
  try {
    const cookie = getCookie();
    const limit = 30;
    const offset = (page - 1) * limit;
    console.log('[Netease] Searching:', query, 'page:', page, '(offset:', offset, ')', cookie ? '(with cookie)' : '(no cookie)');
    const result = await cloudsearch({ keywords: query, limit, offset, type: 1, cookie: cookie || undefined });
    if (result.body.code === 200) {
      const songs = result.body.result?.songs || [];
      console.log(`[Netease] Found ${songs.length} results`);
      return songs.map((s: any) => ({
        id: s.id,
        name: s.name,
        artists: s.ar || [],
        album: { name: s.al?.name || '', picUrl: s.al?.picUrl || '' },
        duration: (s.dt || 0) / 1000,
      }));
    }
    console.log('[Netease] Unexpected code:', result.body.code);
    return [];
  } catch (err: any) {
    console.error('[Netease] Search error:', err.message || err);
    return [];
  }
}

export async function getNeteaseSongUrl(id: number): Promise<string | null> {
  try {
    const cookie = getCookie();
    console.log('[Netease] Getting URL for song:', id, cookie ? '(with cookie)' : '(no cookie)');
    // Try exhigh first, fall back to standard
    for (const level of ['exhigh', 'standard']) {
      const result = await song_url_v1({ id, level, cookie: cookie || undefined });
      if (result.body.code === 200 && result.body.data?.length > 0) {
        const url = result.body.data[0].url;
        if (url) {
          console.log(`[Netease] Got URL (${level}):`, 'OK');
          return url;
        }
      }
    }
    console.log('[Netease] No URL available — login cookie required for full songs');
    return null;
  } catch (err: any) {
    console.error('[Netease] URL error:', err.message || err);
    return null;
  }
}

export async function getNeteaseLyric(id: number): Promise<string | null> {
  try {
    const result = await lyric_new({ id });
    if (result.body.code === 200) {
      return result.body.lrc?.lyric || null;
    }
    return null;
  } catch (err: any) {
    console.error('[Netease] Lyric error:', err.message || err);
    return null;
  }
}
