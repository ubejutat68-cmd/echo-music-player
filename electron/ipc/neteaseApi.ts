let neteaseModule: any = null;

async function getModule() {
  if (!neteaseModule) {
    try {
      neteaseModule = await import('NeteaseCloudMusicApi');
    } catch {
      neteaseModule = require('NeteaseCloudMusicApi');
    }
  }
  return neteaseModule;
}

export interface NeteaseTrack {
  id: number;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl: string };
  duration: number;
}

export async function searchNeteaseMusic(query: string, limit = 30): Promise<NeteaseTrack[]> {
  try {
    const mod = await getModule();
    const result = await mod.cloudsearch({ keywords: query, limit, type: 1 });
    if (result.body.code === 200) {
      return (result.body.result?.songs || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        artists: s.ar || [],
        album: { name: s.al?.name || '', picUrl: s.al?.picUrl || '' },
        duration: (s.dt || 0) / 1000,
      }));
    }
    return [];
  } catch (err) {
    console.error('Netease search error:', err);
    return [];
  }
}

export async function getNeteaseSongUrl(id: number): Promise<string | null> {
  try {
    const mod = await getModule();
    const result = await mod.song_url_v1({ id, level: 'standard' });
    if (result.body.code === 200 && result.body.data?.length > 0) {
      return result.body.data[0].url || null;
    }
    return null;
  } catch (err) {
    console.error('Netease song URL error:', err);
    return null;
  }
}

export async function getNeteaseLyric(id: number): Promise<string | null> {
  try {
    const mod = await getModule();
    const result = await mod.lyric_new({ id });
    if (result.body.code === 200) {
      return result.body.lrc?.lyric || null;
    }
    return null;
  } catch (err) {
    console.error('Netease lyric error:', err);
    return null;
  }
}
