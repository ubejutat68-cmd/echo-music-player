const https = require('https');
const http = require('http');

function biliRequest(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.bilibili.com',
      }
    }, (res: any) => {
      let data = '';
      res.on('data', (c: string) => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    }).on('error', reject);
  });
}

export interface BilibiliTrack {
  id: string;
  bvid: string;
  cid: number;
  title: string;
  author: string;
  duration: number;
  coverUrl: string;
}

export async function searchBilibiliMusic(query: string, limit = 100): Promise<BilibiliTrack[]> {
  try {
    console.log('[Bilibili] Searching:', query);
    const tracks: BilibiliTrack[] = [];
    const seen = new Set<string>();

    // Fetch up to 5 pages to reach the limit (each page returns ~20 results)
    for (let page = 1; page <= 5 && tracks.length < limit; page++) {
      const url = `https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${encodeURIComponent(query)}&page=${page}`;
      const result = await biliRequest(url);

      if (result?.code !== 0) {
        console.log('[Bilibili] Search failed on page', page, ':', result?.message);
        break;
      }

      const videoSection = result.data?.result?.find((s: any) => s.result_type === 'video');
      const items = videoSection?.data || [];

      if (items.length === 0) break;

      for (const v of items) {
        if (seen.has(v.bvid)) continue;
        seen.add(v.bvid);

        if (v.arcrank === '-1' || v.is_live) continue;

        let duration = 0;
        if (v.duration) {
          const parts = v.duration.split(':').map(Number);
          if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
          else if (parts.length === 2) duration = parts[0] * 60 + parts[1];
          else duration = parts[0];
        }

        const tag = v.tag || '';
        const typename = v.typename || '';
        const isMusicRelated = /音乐|歌曲|MV|翻唱|演唱会|演奏|混音|remix|cover|live/i.test(tag + typename + v.title);

        tracks.push({
          id: `bv-${v.bvid}`,
          bvid: v.bvid,
          cid: 0,
          title: v.title.replace(/<[^>]+>/g, ''),
          author: v.author || v.owner?.name || '',
          duration,
          coverUrl: v.pic || '',
          _musicRelated: isMusicRelated,
          _playCount: (v.play || 0) as number,
        } as any);
      }
    }

    tracks.sort((a: any, b: any) => {
      const aMusic = (a._musicRelated as boolean) ? 1 : 0;
      const bMusic = (b._musicRelated as boolean) ? 1 : 0;
      if (bMusic !== aMusic) return bMusic - aMusic;
      return (b._playCount as number) - (a._playCount as number);
    });

    console.log(`[Bilibili] Found ${tracks.length} results`);
    return tracks.slice(0, limit);
  } catch (err: any) {
    console.error('[Bilibili] Search error:', err.message);
    return [];
  }
}

export async function getBilibiliAudioUrl(bvid: string, cid?: number): Promise<{ url: string; cid: number } | null> {
  try {
    // If no CID, fetch from video info
    if (!cid) {
      const infoUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
      const info = await biliRequest(infoUrl);
      if (!info?.data?.cid) {
        console.log('[Bilibili] No CID found for', bvid);
        return null;
      }
      cid = info.data.cid;
    }

    // Get DASH playback URL (fnval=4048 for DASH with audio)
    const playUrl = `https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&fnval=4048&fnver=0&fourk=1`;
    const play = await biliRequest(playUrl);

    if (play?.data?.dash?.audio?.length > 0) {
      const bestAudio = play.data.dash.audio.sort((a: any, b: any) => (b.bandwidth || 0) - (a.bandwidth || 0))[0];
      return { url: bestAudio.baseUrl || bestAudio.base_url, cid };
    }

    // Fallback: use durl (video+audio combined, lower quality)
    if (play?.data?.durl?.[0]?.url) {
      return { url: play.data.durl[0].url, cid };
    }

    console.log('[Bilibili] No playable URL found for', bvid);
    return null;
  } catch (err: any) {
    console.error('[Bilibili] Audio URL error:', err.message);
    return null;
  }
}
