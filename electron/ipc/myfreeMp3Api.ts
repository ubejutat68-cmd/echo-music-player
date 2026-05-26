const https = require('https');
const http = require('http');

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }, (res: any) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchHtml(res.headers.location.startsWith('http') ? res.headers.location : `https://myfreemp3online.com${res.headers.location}`));
      }
      let data = '';
      res.on('data', (c: string) => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

export interface MyFreeMp3Track {
  id: string;
  title: string;
  artist: string;
  songUrl: string;
  coverUrl: string;
}

export async function searchMyFreeMp3(query: string, page = 1): Promise<MyFreeMp3Track[]> {
  try {
    console.log('[MyFreeMp3] Searching:', query, 'page:', page);
    const pageParam = page > 1 ? `&page=${page}` : '';
    const html = await fetchHtml(`https://myfreemp3online.com/search.php?q=${encodeURIComponent(query)}${pageParam}`);

    const tracks: MyFreeMp3Track[] = [];
    const seen = new Set<string>();

    const linkRegex = /<a\s+[^>]*href="(https?:\/\/myfreemp3online\.com\/song\/\d+\.html)"[^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const link = match[1];
      const innerHtml = match[2];

      const idMatch = link.match(/\/song\/(\d+)\.html/);
      if (!idMatch || seen.has(idMatch[1])) continue;
      seen.add(idMatch[1]);

      const cleanTitle = innerHtml.replace(/<[^>]+>/g, '').trim();
      if (!cleanTitle || cleanTitle === '下载') continue;

      let title = cleanTitle;
      let artist = '';
      const dashIdx = cleanTitle.lastIndexOf('-');
      if (dashIdx > 0) {
        artist = cleanTitle.substring(0, dashIdx).trim();
        title = cleanTitle.substring(dashIdx + 1).trim();
      }

      tracks.push({ id: idMatch[1], title, artist, songUrl: '', coverUrl: '' });
    }

    console.log(`[MyFreeMp3] Page ${page}: ${tracks.length} results`);
    return tracks;
  } catch (err: any) {
    console.error('[MyFreeMp3] Search error:', err.message);
    return [];
  }
}

export async function getMyFreeMp3SongUrl(songId: string): Promise<{ songUrl: string; coverUrl: string; title: string; artist: string } | null> {
  try {
    console.log('[MyFreeMp3] Fetching song page:', songId);
    const html = await fetchHtml(`https://myfreemp3online.com/song/${songId}.html`);

    let songUrl = '';
    const audioMatch = html.match(/<audio[^>]*src="([^"]+)"/i);
    if (audioMatch) {
      songUrl = audioMatch[1];
    } else {
      const aplayerMatch = html.match(/url:\s*['"]([^'"]+)['"]/);
      if (aplayerMatch) songUrl = aplayerMatch[1];
    }

    let coverUrl = '';
    const coverMatch = html.match(/<img[^>]*class="[^"]*ue-image[^"]*"[^>]*src="([^"]+)"/i)
      || html.match(/<img[^>]*src="([^"]*kuwo[^"]*)"[^>]*>/i)
      || html.match(/<img[^>]*src="([^"]*cover[^"]*)"[^>]*>/i);
    if (coverMatch) coverUrl = coverMatch[1];

    let title = '';
    let artist = '';
    const titleMatch = html.match(/<title>([^-]+)(?:-([^.]+))?\./);
    if (titleMatch) {
      const fullTitle = titleMatch[1].trim();
      const dashIdx = fullTitle.lastIndexOf('-');
      if (dashIdx > 0) {
        artist = fullTitle.substring(0, dashIdx).trim();
        title = fullTitle.substring(dashIdx + 1).trim();
      } else {
        title = fullTitle;
      }
      if (titleMatch[2] && !title) title = titleMatch[2].trim();
    }

    if (!songUrl) {
      console.log('[MyFreeMp3] No audio URL found on page');
      return null;
    }

    console.log('[MyFreeMp3] Got URL:', songUrl.substring(0, 80) + '...');
    return { songUrl, coverUrl, title, artist };
  } catch (err: any) {
    console.error('[MyFreeMp3] Song URL error:', err.message);
    return null;
  }
}
