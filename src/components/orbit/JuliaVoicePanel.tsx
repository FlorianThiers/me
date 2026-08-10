import React, { useState } from 'react';

import { Link } from 'react-router-dom';

import { Mic, MicOff, Copy, Check, MessageSquare, KeyRound, Loader2 } from 'lucide-react';

import { useTranslation } from 'react-i18next';

import type { JuliaLifeSnapshot } from '../../types/juliaSnapshot';

import { useJuliaVoice } from '../../hooks/useJuliaVoice';

import { VOICE_QUICK_ACTIONS } from '../../lib/juliaVoiceIntents';

import { setJuliaApiKey } from '../../lib/juliaApi';



type Props = {

  life: JuliaLifeSnapshot | undefined;

  date: string;

};



export const JuliaVoicePanel: React.FC<Props> = ({ life, date }) => {

  const { t } = useTranslation();

  const {

    listening,

    transcript,

    intent,

    micSupported,

    busy,

    apiMessage,

    apiError,

    hasApiKey,

    refreshApiKey,

    applyText,

    start,

    stop,

    copyCaptureCommand,

  } = useJuliaVoice(life, date);

  const [copied, setCopied] = useState(false);

  const [typed, setTyped] = useState('');

  const [showKey, setShowKey] = useState(!hasApiKey);

  const [keyDraft, setKeyDraft] = useState('');



  const onCopy = async () => {

    const ok = await copyCaptureCommand();

    if (ok) {

      setCopied(true);

      setTimeout(() => setCopied(false), 2000);

    }

  };



  const onSubmitText = (e: React.FormEvent) => {

    e.preventDefault();

    void applyText(typed);

  };



  const onSaveKey = (e: React.FormEvent) => {

    e.preventDefault();

    if (!keyDraft.trim()) return;

    setJuliaApiKey(keyDraft);

    refreshApiKey();

    setShowKey(false);

    setKeyDraft('');

  };



  return (

    <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3">

      <div className="flex items-center justify-between gap-3 flex-wrap">

        <p className="text-sm font-medium text-white/90">{t('julia.voice.title')}</p>

        <div className="flex items-center gap-2">

          <Link

            to="/julia/usage"

            className="text-[10px] uppercase tracking-wider text-orbit-cyan/80 hover:text-neon-green"

          >

            {t('julia.usage.link')}

          </Link>

          {micSupported ? (

            <button

              type="button"

              onClick={listening ? stop : start}

              disabled={busy}

              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${

                listening

                  ? 'bg-rose-500/20 text-rose-200 border border-rose-400/40'

                  : 'bg-orbit-violet/20 text-orbit-cyan border border-orbit-cyan/30 hover:border-neon-green/50'

              }`}

            >

              {listening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}

              {listening ? t('julia.voice.stop') : t('julia.voice.start')}

            </button>

          ) : (

            <span className="text-[10px] uppercase tracking-wider text-white/40">

              {t('julia.voice.textMode')}

            </span>

          )}

        </div>

      </div>



      {!hasApiKey && (

        <p className="text-[11px] text-amber-200/90 border-l-2 border-amber-400/40 pl-2">

          {t('julia.voice.apiKeyRequired')}

        </p>

      )}



      <button

        type="button"

        onClick={() => setShowKey((v) => !v)}

        className="inline-flex items-center gap-1.5 text-[11px] text-white/50 hover:text-orbit-cyan"

      >

        <KeyRound className="w-3 h-3" />

        {t('julia.voice.apiKeyToggle')}

      </button>



      {showKey && (

        <form onSubmit={onSaveKey} className="flex gap-2">

          <input

            type="password"

            value={keyDraft}

            onChange={(e) => setKeyDraft(e.target.value)}

            placeholder={t('julia.voice.apiKeyPlaceholder')}

            className="flex-1 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white/90"

          />

          <button

            type="submit"

            className="px-3 py-1.5 rounded-lg text-xs bg-orbit-violet/30 text-orbit-cyan border border-orbit-cyan/30"

          >

            {t('julia.voice.apiKeySave')}

          </button>

        </form>

      )}



      {!micSupported && (

        <p className="text-[11px] text-white/45 leading-relaxed border-l-2 border-amber-400/40 pl-2">

          {t('julia.voice.firefoxHint')}

        </p>

      )}



      <form onSubmit={onSubmitText} className="flex gap-2">

        <div className="relative flex-1">

          <MessageSquare className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />

          <input

            type="text"

            value={typed}

            onChange={(e) => setTyped(e.target.value)}

            disabled={busy}

            placeholder={t('julia.voice.placeholder')}

            className="w-full pl-8 pr-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white/90 placeholder:text-white/30 focus:border-orbit-cyan/50 outline-none disabled:opacity-50"

          />

        </div>

        <button

          type="submit"

          disabled={busy}

          className="px-3 py-2 rounded-lg text-xs font-medium bg-orbit-violet/30 text-orbit-cyan border border-orbit-cyan/30 hover:border-neon-green/50 disabled:opacity-50"

        >

          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : t('julia.voice.send')}

        </button>

      </form>



      <div className="flex flex-wrap gap-1.5">

        {VOICE_QUICK_ACTIONS.map((action) => (

          <button

            key={action.id}

            type="button"

            disabled={busy}

            onClick={() => {

              setTyped(action.phrase);

              void applyText(action.phrase);

            }}

            className="px-2 py-1 rounded-full text-[10px] bg-white/5 text-white/60 border border-white/10 hover:border-orbit-cyan/40 hover:text-orbit-cyan disabled:opacity-50"

          >

            {t(action.labelKey)}

          </button>

        ))}

      </div>



      <p className="text-[11px] text-white/40 leading-relaxed">{t('julia.voice.hints')}</p>



      {busy && (

        <p className="text-xs text-orbit-cyan/80 flex items-center gap-2">

          <Loader2 className="w-3.5 h-3.5 animate-spin" />

          {t('julia.voice.busy')}

        </p>

      )}



      {transcript && (

        <p className="text-xs text-white/70 border-l-2 border-orbit-cyan/40 pl-2">{transcript}</p>

      )}



      {apiError && (

        <p className="text-xs text-rose-300/90 border-l-2 border-rose-400/40 pl-2">{apiError}</p>

      )}



      {apiMessage && (

        <p className="text-xs text-neon-green/90 border-l-2 border-neon-green/40 pl-2">{apiMessage}</p>

      )}



      {intent?.kind === 'speak' && !apiMessage && (

        <p className="text-xs text-orbit-cyan/90 italic">{intent.text}</p>

      )}



      {intent?.kind === 'capture_cmd' && (

        <div className="flex flex-wrap items-center gap-2">

          <span className="text-xs text-amber-200/90">{intent.label}</span>

          <button

            type="button"

            onClick={onCopy}

            className="inline-flex items-center gap-1 text-[11px] text-orbit-cyan hover:text-neon-green"

          >

            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}

            {copied ? t('julia.voice.copied') : t('julia.voice.copyCmd')}

          </button>

        </div>

      )}

    </div>

  );

};


