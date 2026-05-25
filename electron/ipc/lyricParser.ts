import * as fs from 'fs';
import * as path from 'path';
import type { Track, LyricLine } from '../../src/types';

export async function parseLyric(track: Track): Promise<LyricLine[]> {
  const dir = path.dirname(track.path);
  const baseName = path.basename(track.path, path.extname(track.path));
  const lrcPath = path.join(dir, baseName + '.lrc');

  if (!fs.existsSync(lrcPath)) {
    return [];
  }

  const content = fs.readFileSync(lrcPath, 'utf-8');

  const lines: LyricLine[] = [];
  const timeRegex = /\[(\d{1,3}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  const contentLines = content.split('\n');

  for (const line of contentLines) {
    const matches = [...line.matchAll(timeRegex)];
    if (matches.length === 0) continue;

    const text = line.replace(timeRegex, '').trim();
    if (!text) continue;

    for (const match of matches) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      const time = mins * 60 + secs + ms / 1000;
      lines.push({ time, text });
    }
  }

  return lines.sort((a, b) => a.time - b.time);
}
