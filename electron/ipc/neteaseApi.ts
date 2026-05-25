// Use require directly — most reliable in Vite-bundled Electron main process
const { cloudsearch, song_url_v1, lyric_new } = require('NeteaseCloudMusicApi');

export interface NeteaseTrack {
  id: number;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl: string };
  duration: number;
}

export async function searchNeteaseMusic(query: string, limit = 30): Promise<NeteaseTrack[]> {
  try {
    console.log('[Netease] Searching:', query);
    const result = await cloudsearch({ keywords: query, limit, type: 1 });
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
    console.log('[Netease] Getting URL for song:', id);
    const result = await song_url_v1({ id, level: 'standard' });
    if (result.body.code === 200 && result.body.data?.length > 0) {
      const url = result.body.data[0].url;
      console.log('[Netease] Got URL:', url ? 'OK' : 'null');
      return url || null;
    }
    console.log('[Netease] URL code:', result.body.code);
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
