import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuid } from 'uuid';
import { parseFile } from 'music-metadata';
import type { Track } from '../../src/types';

const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.flac', '.aac', '.m4a', '.wav', '.ogg']);

async function parseTrack(filePath: string): Promise<Track | null> {
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
      id: uuid(),
      path: filePath,
      title: meta.common.title || path.basename(filePath, ext),
      artist: meta.common.artist || 'Unknown Artist',
      album: meta.common.album || 'Unknown Album',
      duration: meta.format.duration || 0,
      coverArt,
      format,
      fileSize: fs.statSync(filePath).size,
      dateAdded: Date.now(),
      hasLyrics: !!meta.common.lyrics?.length,
    };
  } catch {
    const ext = path.extname(filePath).toLowerCase();
    return {
      id: uuid(),
      path: filePath,
      title: path.basename(filePath, ext),
      artist: 'Unknown Artist',
      album: 'Unknown Album',
      duration: 0,
      coverArt: null,
      format: ext.slice(1),
      fileSize: fs.statSync(filePath).size,
      dateAdded: Date.now(),
      hasLyrics: false,
    };
  }
}

export async function scanFolders(paths: string[]): Promise<Track[]> {
  const tracks: Track[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        const track = await parseTrack(fullPath);
        if (track) tracks.push(track);
      }
    }
  }

  for (const p of paths) {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      await walk(p);
    } else if (SUPPORTED_EXTENSIONS.has(path.extname(p).toLowerCase())) {
      const track = await parseTrack(p);
      if (track) tracks.push(track);
    }
  }

  return tracks;
}
