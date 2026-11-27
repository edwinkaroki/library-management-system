import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Response } from 'express';

function gutenbergSources(bookId: number): string[] {
  const digits = String(bookId);
  const archivePath = [...digits.slice(0, -1), digits].join('/');
  return [
    `https://gutenberg.pglaf.org/cache/epub/${bookId}/pg${bookId}.txt`,
    `https://mirror.fi.ossplanet.net/gutenberg/${archivePath}/${bookId}-0.txt`,
  ];
}

const editions: Record<string, { title: string; sources: string[] }> = {
  'pride-and-prejudice': {
    title: 'Pride and Prejudice',
    sources: gutenbergSources(1342),
  },
  'the-blue-castle': {
    title: 'The Blue Castle',
    sources: gutenbergSources(67979),
  },
  persuasion: {
    title: 'Persuasion',
    sources: gutenbergSources(105),
  },
  'north-and-south': {
    title: 'North and South',
    sources: gutenbergSources(4276),
  },
  'jane-eyre': {
    title: 'Jane Eyre',
    sources: gutenbergSources(1260),
  },
  'wuthering-heights': {
    title: 'Wuthering Heights',
    sources: gutenbergSources(768),
  },
  'the-scarlet-pimpernel': {
    title: 'The Scarlet Pimpernel',
    sources: gutenbergSources(60),
  },
  'a-room-with-a-view': {
    title: 'A Room with a View',
    sources: gutenbergSources(2641),
  },
  'sense-and-sensibility': {
    title: 'Sense and Sensibility',
    sources: gutenbergSources(161),
  },
  'little-women': {
    title: 'Little Women',
    sources: gutenbergSources(514),
  },
  frankenstein: {
    title: 'Frankenstein',
    sources: gutenbergSources(84),
  },
  'the-great-gatsby': {
    title: 'The Great Gatsby',
    sources: gutenbergSources(64317),
  },
  meditations: {
    title: 'Meditations (George Long translation)',
    sources: gutenbergSources(6920),
  },
  'little-brother': {
    title: 'Little Brother',
    sources: [
      'https://craphound.com/littlebrother/Cory_Doctorow_-_Little_Brother.txt',
    ],
  },
};

@Controller('digital-library')
export class DigitalLibraryController {
  @Get(':slug/content')
  async read(@Param('slug') slug: string, @Res() response: Response) {
    const edition = editions[slug];
    if (!edition) throw new NotFoundException('Digital edition not found.');
    const { content, contentType } = await this.fetchEdition(edition.sources);
    response.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    response.send(content);
  }

  @Get(':slug/download')
  async download(@Param('slug') slug: string, @Res() response: Response) {
    const edition = editions[slug];
    if (!edition) throw new NotFoundException('Digital edition not found.');
    const { content, contentType } = await this.fetchEdition(edition.sources);
    response.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${slug}.${contentType === 'application/pdf' ? 'pdf' : 'txt'}"`,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    });
    response.send(content);
  }

  private async fetchEdition(
    sources: string[],
  ): Promise<{ content: Buffer; contentType: string }> {
    for (const url of sources) {
      try {
        const upstream = await fetch(url, {
          headers: { 'User-Agent': 'StacksDigitalLibrary/1.0 (catalog reader)' },
          signal: AbortSignal.timeout(12_000),
        });
        if (!upstream.ok) continue;
        const content = Buffer.from(await upstream.arrayBuffer());
        if (content.byteLength > 20_000_000) continue;
        return { content, contentType: 'text/plain; charset=utf-8' };
      } catch {
        // Try the next approved source for this edition.
      }
    }
    throw new ServiceUnavailableException(
      'The digital text source is temporarily unavailable.',
    );
  }
}
