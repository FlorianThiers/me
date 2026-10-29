import React, { useRef, useState } from 'react';
import { Copy, Download, Plus, Trash2, Upload } from 'lucide-react';
import type { SongDefinition, SongId } from '../../music/songs';
import { isBuiltinSong, isUserSong } from '../../music/songs';
import type { VoicePack } from '../../music/types';
import { VOICE_PACKS } from '../../music/types';
import { STUDIO } from './studioTheme';

type Props = {
  songId: SongId;
  songs: SongDefinition[];
  currentGenre: VoicePack;
  onSelect: (id: SongId) => void;
  onNew: (title: string, genre: VoicePack) => void;
  onSaveAs: (title: string) => void;
  onDuplicate: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
  /** Discard browser draft and reload factory (or current user song). */
  onResetFactory?: () => void;
};

export const SongLibraryControls: React.FC<Props> = ({
  songId,
  songs,
  currentGenre,
  onSelect,
  onNew,
  onSaveAs,
  onDuplicate,
  onRename,
  onDelete,
  onExport,
  onImport,
  onResetFactory,
}) => {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const userOwned = isUserSong(songId);
  const builtin = isBuiltinSong(songId);

  const btn =
    'h-[22px] px-1.5 text-[10px] uppercase tracking-wide text-[#888] hover:text-white transition-colors';

  return (
    <div className="relative mr-2 flex items-center gap-0.5">
      <label className="flex items-center gap-1 text-[10px]" style={{ color: STUDIO.textMuted }}>
        <span className="uppercase tracking-wide">Song</span>
        <select
          value={songId}
          onChange={(e) => onSelect(e.target.value)}
          className="h-[22px] max-w-[170px] border px-1 text-[10px] text-white outline-none"
          style={{ background: STUDIO.surface, borderColor: STUDIO.border }}
          title="Switch song — edits auto-save in this browser"
        >
          <optgroup label="Factory">
            {songs.filter((s) => !s.user).map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </optgroup>
          {songs.some((s) => s.user) && (
            <optgroup label="My songs">
              {songs.filter((s) => s.user).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </label>

      <button
        type="button"
        className={btn}
        style={{ background: STUDIO.surface }}
        title="Song library"
        onClick={() => setOpen((v) => !v)}
      >
        Library
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 top-full z-50 mt-1 w-64 border p-3 shadow-xl"
            style={{ background: STUDIO.panel, borderColor: STUDIO.border }}
          >
            <p className="mb-2 text-[9px] uppercase tracking-wide" style={{ color: STUDIO.textDim }}>
              Persist in this browser (localStorage)
            </p>

            <button
              type="button"
              className="mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#2a2a2a]"
              style={{ color: STUDIO.text }}
              onClick={() => {
                const title = window.prompt('New song title', 'Untitled');
                if (!title?.trim()) return;
                const genreRaw = window.prompt(
                  `Genre (${VOICE_PACKS.join(' | ')})`,
                  currentGenre,
                );
                const genre = (VOICE_PACKS as readonly string[]).includes(genreRaw || '')
                  ? (genreRaw as VoicePack)
                  : currentGenre;
                onNew(title.trim(), genre);
                setOpen(false);
              }}
            >
              <Plus className="h-3.5 w-3.5" /> New blank song
            </button>

            <button
              type="button"
              className="mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#2a2a2a]"
              style={{ color: STUDIO.text }}
              onClick={() => {
                const title = window.prompt(
                  builtin ? 'Save current work as new song' : 'Save a copy as',
                  `${songs.find((s) => s.id === songId)?.title || 'Song'} copy`,
                );
                if (!title?.trim()) return;
                onSaveAs(title.trim());
                setOpen(false);
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Save as my song…
            </button>

            <button
              type="button"
              className="mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#2a2a2a]"
              style={{ color: STUDIO.text }}
              onClick={() => {
                onDuplicate();
                setOpen(false);
              }}
            >
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </button>

            {builtin && onResetFactory && (
              <button
                type="button"
                className="mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#2a2a2a]"
                style={{ color: STUDIO.accent }}
                onClick={() => {
                  if (!window.confirm('Discard local draft and reload factory song?')) return;
                  onResetFactory();
                  setOpen(false);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Reset to factory
              </button>
            )}

            {userOwned && (
              <>
                <button
                  type="button"
                  className="mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#2a2a2a]"
                  style={{ color: STUDIO.text }}
                  onClick={() => {
                    const cur = songs.find((s) => s.id === songId)?.title || '';
                    const title = window.prompt('Rename song', cur);
                    if (!title?.trim()) return;
                    onRename(title.trim());
                    setOpen(false);
                  }}
                >
                  Rename…
                </button>
                <button
                  type="button"
                  className="mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#3a1a1a]"
                  style={{ color: '#e88' }}
                  onClick={() => {
                    if (!window.confirm('Delete this song from your browser library?')) return;
                    onDelete();
                    setOpen(false);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            )}

            <div className="my-2 h-px" style={{ background: STUDIO.border }} />

            <button
              type="button"
              className="mb-1 flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#2a2a2a]"
              style={{ color: STUDIO.text }}
              onClick={() => {
                onExport();
                setOpen(false);
              }}
            >
              <Download className="h-3.5 w-3.5" /> Export my songs (.json)
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-2 py-1.5 text-left text-[11px] hover:bg-[#2a2a2a]"
              style={{ color: STUDIO.text }}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" /> Import .json…
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                try {
                  const text = await file.text();
                  onImport(text);
                  setOpen(false);
                } catch {
                  window.alert('Could not read that file');
                }
              }}
            />

            <p className="mt-2 text-[9px] leading-snug" style={{ color: STUDIO.textMuted }}>
              Factory songs keep a draft overlay (Reset to factory clears it). Your songs save live
              into the library — refresh-safe. Export JSON for backup / other PC.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
