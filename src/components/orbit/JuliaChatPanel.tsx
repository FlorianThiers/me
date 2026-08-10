import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Copy,
  Check,
  KeyRound,
  Loader2,
  Volume2,
  VolumeX,
  Pencil,
  RotateCcw,
  Square,
  ArrowUp,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { JuliaLifeSnapshot } from '../../types/juliaSnapshot';
import { useJuliaChat } from '../../hooks/useJuliaChat';
import { VOICE_QUICK_ACTIONS } from '../../lib/juliaVoiceIntents';
import { setJuliaApiKey } from '../../lib/juliaApi';

type Props = {
  life: JuliaLifeSnapshot | undefined;
  date: string;
};

export const JuliaChatPanel: React.FC<Props> = ({ life, date }) => {
  const { t } = useTranslation();
  const {
    messages,
    draft,
    setDraft,
    busy,
    hasApiKey,
    refreshApiKey,
    micSupported,
    listening,
    ttsOn,
    ttsSupported,
    toggleTts,
    editingId,
    editDraft,
    setEditDraft,
    sendDraft,
    stop,
    clearThread,
    startEdit,
    cancelEdit,
    commitEdit,
    regenerateLast,
    copyMessage,
    speakMessage,
    startMic,
    stopMic,
    runUserText,
  } = useJuliaChat(life, date);

  const [showKey, setShowKey] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!stickRef.current || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [draft]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = dist < 80;
  };

  const onSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyDraft.trim()) return;
    setJuliaApiKey(keyDraft);
    refreshApiKey();
    setShowKey(false);
    setKeyDraft('');
  };

  const onComposerKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (busy) return;
      sendDraft();
    }
  };

  const onEditKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    }
  };

  const onCopy = async (id: string, content: string) => {
    const ok = await copyMessage(content);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;
  const empty = messages.length === 0;

  return (
    <div className="flex flex-col h-[min(70vh,36rem)] min-h-[22rem] rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate">{t('julia.chat.title')}</p>
          {busy && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-orbit-cyan">
              <Loader2 className="w-3 h-3 animate-spin" />
              {t('julia.chat.thinking')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/julia/usage"
            className="text-[10px] uppercase tracking-wider text-orbit-cyan/80 hover:text-neon-green px-1.5"
          >
            {t('julia.usage.link')}
          </Link>
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="p-1.5 rounded-md text-white/45 hover:text-orbit-cyan hover:bg-white/5"
            title={t('julia.voice.apiKeyToggle')}
          >
            <KeyRound className="w-3.5 h-3.5" />
          </button>
          {ttsSupported && (
            <button
              type="button"
              onClick={toggleTts}
              className={`p-1.5 rounded-md hover:bg-white/5 ${
                ttsOn ? 'text-amber-200' : 'text-white/40 hover:text-orbit-cyan'
              }`}
              title={ttsOn ? t('julia.voice.ttsOn') : t('julia.voice.ttsOff')}
            >
              {ttsOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={clearThread}
            disabled={busy || messages.length === 0}
            className="p-1.5 rounded-md text-white/40 hover:text-rose-300 hover:bg-white/5 disabled:opacity-30"
            title={t('julia.chat.newChat')}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showKey && (
        <form
          onSubmit={onSaveKey}
          className="flex gap-2 px-3 py-2 border-b border-white/10 bg-black/20"
        >
          <input
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder={t('julia.voice.apiKeyPlaceholder')}
            className="flex-1 px-2 py-1.5 rounded-md bg-black/40 border border-white/10 text-xs text-white/90"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md text-xs bg-orbit-violet/30 text-orbit-cyan border border-orbit-cyan/30"
          >
            {t('julia.voice.apiKeySave')}
          </button>
        </form>
      )}

      {!hasApiKey && (
        <p className="text-[11px] text-amber-200/90 px-3 py-2 border-b border-amber-400/20 bg-amber-500/5">
          {t('julia.voice.apiKeyRequired')}
        </p>
      )}

      {/* Transcript */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-4"
      >
        {empty && (
          <div className="max-w-xl mx-auto text-center space-y-4 pt-6">
            <p className="text-sm text-white/60">{t('julia.chat.empty')}</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {VOICE_QUICK_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void runUserText(action.phrase)}
                  className="px-2.5 py-1.5 rounded-full text-[11px] bg-white/5 text-white/65 border border-white/10 hover:border-orbit-cyan/40 hover:text-orbit-cyan disabled:opacity-50"
                >
                  {t(action.labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === 'user';
          const isEditing = editingId === m.id;
          const isLastAssistant = m.id === lastAssistantId;

          return (
            <div
              key={m.id}
              className={`group max-w-[42rem] mx-auto ${isUser ? '' : ''}`}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1 px-0.5">
                <span className="text-[10px] uppercase tracking-wider text-white/35">
                  {isUser ? t('julia.chat.you') : t('julia.chat.julia')}
                  {m.provider ? ` · ${m.provider}` : ''}
                </span>
              </div>

              {isEditing ? (
                <div className="rounded-lg border border-orbit-cyan/40 bg-black/50 p-2 space-y-2">
                  <textarea
                    value={editDraft}
                    onChange={(e) => setEditDraft(e.target.value)}
                    onKeyDown={onEditKey}
                    rows={3}
                    className="w-full resize-none bg-transparent text-sm text-white/90 outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-white/50 hover:text-white/80"
                    >
                      <X className="w-3 h-3" />
                      {t('julia.chat.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={commitEdit}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-orbit-violet/30 text-orbit-cyan border border-orbit-cyan/30"
                    >
                      {t('julia.chat.saveResend')}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`relative rounded-lg px-3 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-white/[0.06] border border-white/10 text-white/85'
                      : m.status === 'error'
                        ? 'text-rose-300/90'
                        : m.status === 'aborted'
                          ? 'text-white/45 italic'
                          : 'text-white/90'
                  }`}
                >
                  {m.content}

                  {/* Hover actions — Cursor-style */}
                  <div
                    className={`absolute -bottom-3 right-2 flex items-center gap-0.5 rounded-md border border-white/10 bg-dark-secondary/95 px-0.5 py-0.5 shadow-lg transition-opacity ${
                      isLastAssistant || isUser
                        ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
                        : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => void onCopy(m.id, m.content)}
                      className="p-1 rounded text-white/45 hover:text-orbit-cyan"
                      title={t('julia.chat.copy')}
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-neon-green" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {isUser && !busy && (
                      <button
                        type="button"
                        onClick={() => startEdit(m)}
                        className="p-1 rounded text-white/45 hover:text-orbit-cyan"
                        title={t('julia.chat.edit')}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    {!isUser && ttsSupported && (
                      <button
                        type="button"
                        onClick={() => speakMessage(m.content)}
                        className="p-1 rounded text-white/45 hover:text-orbit-cyan"
                        title={t('julia.voice.speakOnce')}
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                    {!isUser && isLastAssistant && !busy && (
                      <button
                        type="button"
                        onClick={regenerateLast}
                        className="p-1 rounded text-white/45 hover:text-orbit-cyan"
                        title={t('julia.chat.regenerate')}
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {busy && (
          <div className="max-w-[42rem] mx-auto flex items-center gap-2 text-xs text-orbit-cyan/80 px-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t('julia.chat.thinking')}
          </div>
        )}
      </div>

      {/* Composer — sticky bottom */}
      <div className="border-t border-white/10 bg-black/50 p-3 space-y-2">
        <p className="text-[10px] text-white/35 px-0.5">{t('julia.chat.composerHint')}</p>
        <div className="rounded-xl border border-white/15 bg-black/40 focus-within:border-orbit-cyan/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onComposerKey}
            placeholder={t('julia.chat.placeholder')}
            rows={2}
            className="w-full resize-none bg-transparent px-3 pt-2.5 pb-1 text-sm text-white/90 placeholder:text-white/30 outline-none"
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <div className="flex items-center gap-1">
              {micSupported && (
                <button
                  type="button"
                  onClick={listening ? stopMic : startMic}
                  disabled={busy}
                  className={`p-1.5 rounded-md ${
                    listening
                      ? 'text-rose-200 bg-rose-500/15'
                      : 'text-white/40 hover:text-orbit-cyan hover:bg-white/5'
                  } disabled:opacity-40`}
                  title={listening ? t('julia.voice.stop') : t('julia.voice.start')}
                >
                  {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
            {busy ? (
              <button
                type="button"
                onClick={stop}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/20 text-rose-100 border border-rose-400/40"
              >
                <Square className="w-3 h-3 fill-current" />
                {t('julia.chat.stop')}
              </button>
            ) : (
              <button
                type="button"
                onClick={sendDraft}
                disabled={!draft.trim()}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-orbit-violet/40 text-orbit-cyan border border-orbit-cyan/30 hover:border-neon-green/50 disabled:opacity-30"
                title={t('julia.chat.send')}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/** @deprecated import JuliaChatPanel — alias kept for compatibility */
export { JuliaChatPanel as JuliaVoicePanel };
