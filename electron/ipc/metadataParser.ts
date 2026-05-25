import { parseFile } from 'music-metadata';
import * as path from 'path';
import * as fs from 'fs';

export async function parseMetadata(filePath: string) {
  try {
    const meta = await parseFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const format = ext === '.m4a' ? 'aac' : ext.slice(1);

    let coverArt: string | null = null;
    if (meta.common.picture?.length) {
      const pic = meta.common.picture[0];
      const mime = pic.format || 'image/jpeg';
      const base64 = Buffer.from(pic.data).toString('base64');
      coverArt = `data:${mime};base64,${base64}`;
    }

    return {
      title: meta.common.title || path.basename(filePath, ext),
      artist: meta.common.artist || 'Unknown Artist',
      album: meta.common.album || 'Unknown Album',
      duration: meta.format.duration || 0,
      coverArt,
      format,
      fileSize: fs.statSync(filePath).size,
      hasLyrics: !!meta.common.lyrics?.length,
    };
  } catch {
    const ext = path.extname(filePath).toLowerCase();
    return {
      title: path.basename(filePath, ext),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
      coverArt: null,
      format: ext.slice(1),
      fileSize: fs.statSync(filePath).size,
      hasLyrics: false,
    };
  }
}
