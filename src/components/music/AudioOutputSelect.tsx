import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Volume2 } from 'lucide-react';
import {
  listAudioOutputDevices,
  loadStoredOutputDeviceId,
  saveOutputDeviceId,
  supportsSinkId,
  type AudioOutputDevice,
} from '../../music/outputDevices';
import {
  bridgeHealth,
  isUpnpDeviceId,
  listUpnpRenderers,
  upnpDeviceId,
} from '../../music/upnpClient';
import { STUDIO } from './studioTheme';

type Props = {
  selectedId: string;
  onSelect: (deviceId: string) => Promise<void> | void;
  disabled?: boolean;
};

type Listed = AudioOutputDevice & { group: 'local' | 'upnp' };

export const AudioOutputSelect: React.FC<Props> = ({ selectedId, onSelect, disabled }) => {
  const [devices, setDevices] = useState<Listed[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [casting, setCasting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bridgeHint, setBridgeHint] = useState<string | null>(null);
  const supported = supportsSinkId();

  const refresh = useCallback(async (deep = false) => {
    setRefreshing(true);
    try {
      const local = supported
        ? await listAudioOutputDevices()
        : [{ deviceId: '', label: 'System default' }];

      const health = await bridgeHealth();
      let upnp: Listed[] = [];
      if (health.ok) {
        setBridgeHint(null);
        // Soft list first (cached); deep SSDP only on refresh button
        const { renderers, error: upnpErr } = await listUpnpRenderers(deep);
        if (upnpErr) setBridgeHint(upnpErr);
        upnp = renderers.map((r) => ({
          deviceId: upnpDeviceId(r.id),
          label: `UPnP · ${r.name}`,
          group: 'upnp' as const,
        }));
        if (upnp.length === 0) {
          setBridgeHint(
            deep
              ? 'Bridge OK — no MediaRenderer (Phantom WiFi?)'
              : 'Bridge OK — click refresh to scan Phantoms',
          );
        }
      } else {
        setBridgeHint(health.error ?? 'UPnP bridge offline');
      }

      setDevices([
        ...local.map((d) => ({ ...d, group: 'local' as const })),
        ...upnp,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not list outputs');
    } finally {
      setRefreshing(false);
    }
  }, [supported]);

  useEffect(() => {
    void refresh(true);
    if (!navigator.mediaDevices?.addEventListener) return;
    const onChange = () => void refresh(false);
    navigator.mediaDevices.addEventListener('devicechange', onChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', onChange);
  }, [refresh]);

  const title =
    error ??
    bridgeHint ??
    'Audio output — local sinks or UPnP (Devialet Phantom)';

  return (
    <div className="flex min-w-0 items-center gap-1">
      <Volume2 className="hidden h-3 w-3 shrink-0 sm:block" style={{ color: STUDIO.textMuted }} />
      <select
        value={
          devices.some((d) => d.deviceId === selectedId) || selectedId === '' || isUpnpDeviceId(selectedId)
            ? selectedId
            : ''
        }
        disabled={disabled}
        title={title}
        onChange={async (e) => {
          const id = e.target.value;
          if (id === '__upnp_offline') return;
          setCasting(true);
          setError(null);
          try {
            await onSelect(id);
            saveOutputDeviceId(id);
          } catch (err) {
            // Keep selection visible; parent may revert — surface error here either way
            setError(err instanceof Error ? err.message : 'Output switch failed');
          } finally {
            setCasting(false);
          }
        }}
        className="h-[22px] max-w-[180px] truncate border px-1 text-[10px] text-white outline-none disabled:opacity-50"
        style={{
          background: STUDIO.surface,
          borderColor: error ? '#c45c4a' : isUpnpDeviceId(selectedId) ? STUDIO.accent : STUDIO.border,
          opacity: casting ? 0.85 : 1,
        }}
      >
        {devices.length === 0 && (
          <option value={selectedId || ''}>
            {isUpnpDeviceId(selectedId) ? 'UPnP (saved)' : selectedId ? 'Saved output' : 'System default'}
          </option>
        )}
        {isUpnpDeviceId(selectedId) && !devices.some((d) => d.deviceId === selectedId) && (
          <option value={selectedId}>UPnP · (saved — refresh)</option>
        )}
        {devices.some((d) => d.group === 'local') && (
          <optgroup label="This PC">
            {devices
              .filter((d) => d.group === 'local')
              .map((d) => (
                <option key={d.deviceId || 'default'} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
          </optgroup>
        )}
        {devices.some((d) => d.group === 'upnp') ? (
          <optgroup label="UPnP (WiFi)">
            {devices
              .filter((d) => d.group === 'upnp')
              .map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
          </optgroup>
        ) : (
          <optgroup label="UPnP (WiFi)">
            <option value="__upnp_offline" disabled>
              {bridgeHint ?? 'Start npm run upnp-bridge'}
            </option>
          </optgroup>
        )}
      </select>
      <button
        type="button"
        onClick={() => void refresh(true)}
        disabled={refreshing || casting}
        className="flex h-[22px] w-[22px] items-center justify-center disabled:opacity-50"
        style={{ background: STUDIO.surface, color: STUDIO.textMuted }}
        title="Refresh local + UPnP outputs"
      >
        <RefreshCw className={`h-3 w-3 ${refreshing || casting ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export function initialOutputDeviceId(): string {
  return loadStoredOutputDeviceId();
}
