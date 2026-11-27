import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Response } from 'express';

const editions: Record<string, { title: string; sources: string[] }> = {
  'pride-and-prejudice': {
    title: 'Pride and Prejudice',
    sources: [
      'https://gutenberg.pglaf.org/cache/epub/1342/pg1342.txt',
      'https://mirror.fi.ossplanet.net/gutenberg/1/3/4/1342/1342-0.txt',
    ],
  },
  frankenstein: {
    title: 'Frankenstein',
    sources: [
      'https://gutenberg.pglaf.org/cache/epub/84/pg84.txt',
      'https://mirror.fi.ossplanet.net/gutenberg/8/84/84-0.txt',
    ],
  },
  'the-great-gatsby': {
    title: 'The Great Gatsby',
    sources: [
      'https://gutenberg.pglaf.org/cache/epub/64317/pg64317.txt',
      'https://mirror.fi.ossplanet.net/gutenberg/6/4/3/1/64317/64317-0.txt',
    ],
  },
  meditations: {
    title: 'Meditations (George Long translation)',
    sources: [
      'https://gutenberg.pglaf.org/cache/epub/6920/pg6920.txt',
      'https://mirror.fi.ossplanet.net/gutenberg/6/9/2/6920/6920-0.txt',
    ],
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
