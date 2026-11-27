const ROMAN = '[IVXLCDM]+';

function headingPattern(slug) {
  if (slug === 'meditations') return new RegExp(`^BOOK\\s+${ROMAN}\\.?$`, 'i');
  if (slug === 'frankenstein') return new RegExp(`^(?:LETTER|CHAPTER)\\s+(?:${ROMAN}|\\d+)\\.?$`, 'i');
  if (slug === 'little-brother') return /^CHAPTER\s+\d+\s*$/i;
  return new RegExp(`^CHAPTER\\s+(?:${ROMAN}|\\d+)\\.?$`, 'i');
}

export function splitIntoChapters(slug, rawText) {
  const startMarker = rawText.search(/\*\*\* START OF (?:THE )?PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/i);
  const endMarker = rawText.search(/\*\*\* END OF (?:THE )?PROJECT GUTENBERG EBOOK/i);
  let bookText = startMarker >= 0 ? rawText.slice(startMarker).replace(/^[^\n]*\n/, '') : rawText;
  if (endMarker >= 0 && endMarker > startMarker) bookText = bookText.slice(0, endMarker - startMarker);
  const lines = bookText.replace(/\r/g, '').split('\n');
  const pattern = headingPattern(slug);
  const matches = [];
  lines.forEach((line, index) => {
    const title = line.trim().replace(/\s+/g, ' ');
    if (pattern.test(title)) matches.push({ index, title });
  });

  // Ignore table-of-contents entries: their section before the next heading is only a few lines.
  const realHeadings = matches.filter((match, index) => {
    const next = matches[index + 1];
    const section = lines.slice(match.index + 1, next?.index ?? lines.length);
    const body = section.join('\n').trim();
    return body.length > 600 && section.filter((line) => line.trim()).length > 3;
  });

  if (!realHeadings.length) {
    return [{ title: 'Full book', lines: lines.map((line) => line.trimEnd()) }];
  }

  return realHeadings.map((heading, index) => {
    const next = realHeadings[index + 1];
    return {
      title: heading.title.replace(/\.$/, ''),
      lines: lines.slice(heading.index + 1, next?.index ?? lines.length).map((line) => line.trimEnd()),
    };
  });
}
