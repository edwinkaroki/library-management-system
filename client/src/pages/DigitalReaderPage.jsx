import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api.js';
import { digitalCollection } from '../data/digitalCollection.js';
import { splitIntoChapters } from '../data/chapterParser.js';

const apiUrl = (path) => `${(import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '')}${path}`;

export default function DigitalReaderPage() {
  const { slug } = useParams();
  const book = digitalCollection.find((item) => item.slug === slug && item.reader);
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const [reader, setReader] = useState({ chapters: [], progress: null, loading: true, error: '' });
  const [chapterIndex, setChapterIndex] = useState(0);
  const [position, setPosition] = useState(null);
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const containerRef = useRef(null);
  const saveTimerRef = useRef(null);
  const restoreLineRef = useRef(null);
  const lastSavedRef = useRef('');
  const chapters = reader.chapters;
  const chapter = chapters[chapterIndex];

  useEffect(() => {
    if (!book) return undefined;
    const controller = new AbortController();
    setReader({ chapters: [], progress: null, loading: true, error: '' });
    Promise.all([
      fetch(apiUrl(`/digital-library/${book.slug}/content`), { signal: controller.signal }).then(async (response) => {
        if (!response.ok) throw new Error('This text is temporarily unavailable. Please try again later.');
        return response.text();
      }),
      apiRequest(`/reading-progress/${encodeURIComponent(book.slug)}`, { token, signal: controller.signal }),
    ]).then(([text, result]) => {
      const progress = result?.progress || null;
      const parsed = splitIntoChapters(book.slug, text);
      const restoredChapter = Math.min(progress?.chapterIndex ?? 0, parsed.length - 1);
      setChapterIndex(Math.max(0, restoredChapter));
      setPosition(progress);
      lastSavedRef.current = progress ? JSON.stringify([progress.chapterIndex, progress.lineIndex, progress.lineText, progress.progressPercent]) : '';
      restoreLineRef.current = progress?.chapterIndex === restoredChapter ? progress?.lineIndex ?? 0 : 0;
      setReader({ chapters: parsed, progress, loading: false, error: '' });
    }).catch((cause) => {
      if (cause.name !== 'AbortError') setReader({ chapters: [], progress: null, loading: false, error: cause.message || 'Could not open this book.' });
    });
    return () => {
      controller.abort();
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [book, token, attempt]);

  useLayoutEffect(() => {
    if (!chapter || restoreLineRef.current === null || !containerRef.current) return;
    const container = containerRef.current;
    const targetLine = Math.min(restoreLineRef.current, Math.max(0, chapter.lines.length - 1));
    const target = container.querySelector(`[data-reading-line="${targetLine}"]`);
    if (target) container.scrollTop += target.getBoundingClientRect().top - container.getBoundingClientRect().top;
    restoreLineRef.current = null;
  }, [chapter]);

  const savePosition = useCallback(async (nextPosition) => {
    if (!nextPosition || !book) return;
    const signature = JSON.stringify([nextPosition.chapterIndex, nextPosition.lineIndex, nextPosition.lineText, nextPosition.progressPercent]);
    if (signature === lastSavedRef.current) return;
    setSaving(true);
    try {
      const saved = await apiRequest(`/reading-progress/${encodeURIComponent(book.slug)}`, {
        method: 'PUT', body: nextPosition, token,
      });
      lastSavedRef.current = signature;
      setPosition(saved);
      setReader((current) => ({ ...current, progress: saved }));
    } catch {
      // Keep the in-memory location visible; the next scroll or chapter change retries it.
    } finally {
      setSaving(false);
    }
  }, [book, token]);

  const getVisiblePosition = useCallback(() => {
    const container = containerRef.current;
    if (!container || !chapter) return null;
    const bounds = container.getBoundingClientRect();
    const visibleLines = [...container.querySelectorAll('[data-reading-line]')].filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > bounds.top + 8 && rect.top < bounds.bottom - 8 && element.textContent.trim();
    });
    const lineElement = visibleLines.at(-1);
    if (!lineElement) return null;
    const lineIndex = Number(lineElement.dataset.readingLine);
    const lineText = lineElement.textContent.trim().replace(/\s+/g, ' ').slice(0, 480);
    const progressPercent = Math.min(100, ((chapterIndex + (lineIndex + 1) / Math.max(chapter.lines.length, 1)) / Math.max(chapters.length, 1)) * 100);
    return { chapterIndex, chapterTitle: chapter.title, lineIndex, lineText, progressPercent };
  }, [chapter, chapterIndex, chapters.length]);

  const onReaderScroll = useCallback(() => {
    const nextPosition = getVisiblePosition();
    if (!nextPosition) return;
    setPosition(nextPosition);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => savePosition(nextPosition), 700);
  }, [getVisiblePosition, savePosition]);

  function changeChapter(nextIndex) {
    if (nextIndex === chapterIndex) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    restoreLineRef.current = 0;
    setChapterIndex(nextIndex);
    const nextChapter = chapters[nextIndex];
    if (nextChapter) {
      const nextPosition = {
        chapterIndex: nextIndex,
        chapterTitle: nextChapter.title,
        lineIndex: 0,
        lineText: nextChapter.lines.find((line) => line.trim())?.trim().slice(0, 480) || '',
        progressPercent: (nextIndex / Math.max(chapters.length, 1)) * 100,
      };
      setPosition(nextPosition);
      savePosition(nextPosition);
    }
  }

  const percent = useMemo(() => Math.round(position?.progressPercent ?? reader.progress?.progressPercent ?? 0), [position, reader.progress]);

  if (!book) return <div className="state-panel"><h1>This reading room is empty.</h1><Link to="/digital-library" className="text-link">Back to the digital shelf →</Link></div>;
  if (reader.loading) return <section className="reader-page"><div className="reader-loading"><span className="eyebrow">OPENING YOUR BOOK...</span><div className="shimmer" /></div></section>;
  if (reader.error) return <div className="state-panel"><h1>We couldn’t open this book.</h1><p>{reader.error}</p><button className="button-dark" onClick={() => setAttempt((value) => value + 1)}>Try again</button><Link to="/digital-library" className="text-link">Back to the digital shelf →</Link></div>;

  return <section className="reader-page">
    <div className="reader-toolbar">
      <Link to="/digital-library" className="back-link">← DIGITAL SHELF</Link>
      <div><span className="eyebrow">{book.author}</span><h1>{book.title}</h1></div>
      <a className="button-dark" href={apiUrl(`/digital-library/${book.slug}/download`)}>Download text ↓</a>
    </div>
    <p className="reader-rights">{book.license}. {book.rights} <a href={book.source} target="_blank" rel="noreferrer">Edition source ↗</a></p>

    <div className="reader-progress-panel">
      <div className="reader-progress-heading"><span>{position?.chapterTitle || chapter?.title || 'Ready to begin'}</span><span>{saving ? 'Saving your place…' : reader.progress ? 'Your place is saved' : 'Progress saves as you read'} · {percent}%</span></div>
      <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${percent}%` }} /></div>
      {reader.progress?.lineText && <p className="reader-last-line"><strong>Last time you were here:</strong> “{reader.progress.lineText}”</p>}
    </div>

    <div className="chapter-controls">
      <button className="chapter-step" onClick={() => changeChapter(Math.max(0, chapterIndex - 1))} disabled={chapterIndex === 0}>← Previous</button>
      <label><span className="eyebrow">CHAPTER</span><select value={chapterIndex} onChange={(event) => changeChapter(Number(event.target.value))}>{chapters.map((item, index) => <option key={`${item.title}-${index}`} value={index}>{item.title}</option>)}</select><small>{chapterIndex + 1} of {chapters.length}</small></label>
      <button className="chapter-step" onClick={() => changeChapter(Math.min(chapters.length - 1, chapterIndex + 1))} disabled={chapterIndex === chapters.length - 1}>Next →</button>
    </div>

    <article className="reader-text chapter-text" ref={containerRef} onScroll={onReaderScroll} aria-label={`${book.title}, ${chapter?.title}`}>
      {chapter?.lines.map((line, index) => <p className={line.trim() ? 'reader-line' : 'reader-line reader-blank'} data-reading-line={index} key={index}>{line || '\u00a0'}</p>)}
    </article>
    <div className="chapter-bottom-controls">
      <button className="chapter-step" onClick={() => changeChapter(Math.max(0, chapterIndex - 1))} disabled={chapterIndex === 0}>← Previous chapter</button>
      <button className="button-dark" onClick={() => changeChapter(Math.min(chapters.length - 1, chapterIndex + 1))} disabled={chapterIndex === chapters.length - 1}>Next chapter →</button>
    </div>
  </section>;
}
