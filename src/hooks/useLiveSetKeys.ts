import { useEffect, useRef } from 'react';
import type { MusicEngine } from '../music/engine';
import {
  resolveLiveSetAction,
  type LiveSetKeyBinding,
} from '../music/liveSetKeys';
import { typingBlocked } from '../music/midi';

type Options = {
  enabled: boolean;
  getEngine: () => MusicEngine | null;
  bindings: Record<string, LiveSetKeyBinding>;
  onSceneLaunched?: (scene1Based: number) => void;
  onStatus?: (msg: string) => void;
  onAction?: () => void;
};

export function useLiveSetKeys({
  enabled,
  getEngine,
  bindings,
  onSceneLaunched,
  onStatus,
  onAction,
}: Options) {
  const bindingsRef = useRef(bindings);
  bindingsRef.current = bindings;
  const getEngineRef = useRef(getEngine);
  getEngineRef.current = getEngine;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || typingBlocked(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const action = resolveLiveSetAction(e.code, e.shiftKey, bindingsRef.current);
      if (!action) return;

      e.preventDefault();

      const eng = getEngineRef.current();
      if (!eng) {
        onStatus?.('live-set · start transport or wait for engine');
        return;
      }

      if (action.type === 'launchClip') {
        eng.launchClip(action.trackId, action.slot);
        onAction?.();
        onStatus?.(`launch ${action.trackId} · slot ${action.slot}`);
        return;
      }
      if (action.type === 'stopClip') {
        eng.stopClip(action.trackId);
        onAction?.();
        onStatus?.(`stop ${action.trackId}`);
        return;
      }
      if (action.type === 'launchScene') {
        eng.launchScene(action.sceneIdx);
        onAction?.();
        onSceneLaunched?.(action.sceneIdx + 1);
        onStatus?.(`scene ${action.sceneIdx + 1}`);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, onSceneLaunched, onStatus, onAction]);
}
