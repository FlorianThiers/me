# UPnP bridge — MySpace music → Devialet Phantom

Local Windows companion so the browser DAW can cast over WiFi (not Bluetooth).

## Run

```bash
# terminal A (already): npm run dev
# terminal B:
npm run upnp-bridge
```

Bridge listens on `http://127.0.0.1:8787` and advertises `http://<LAN-IP>:8787/stream.wav` to the Phantom.

## Flow

1. Browser sends int16 stereo PCM over `ws://127.0.0.1:8787/pcm`
2. Bridge serves continuous WAV on `/stream.wav`
3. Bridge SSDP-discovers MediaRenderers and calls AVTransport `SetAVTransportURI` + `Play`

## Check

- `GET /health` — bridge up + LAN IP
- `GET /renderers?refresh=1` — should list your Phantom stereo group
- In `/music` → Output → **UPnP · Phantom stereo → …** (casts to primary L)

## Notes

- Phantom + PC must be on the same WiFi/LAN (allow Node through Windows Firewall if prompted).
- **Live WAV** (no GET `Content-Length`, no chunked) + ~11.5s silence prime (flood), then live gate.
- DAW waits for that gate so playhead starts with audible audio (Devialet still needs ~12s pre-buffer).
- DLNA `OP=00` + `audioBroadcast`. One Play; no auto-continue spam (that caused UPnP 701).
- Play waits for STOPPED before retry; cast ops are serialized.
- Prefer Ethernet on the Phantoms when possible.
- Devialet probes `/stream.wav` with **HEAD** before Play — the bridge answers 200 (a 404 caused UPnP 716).
- Stereo L/R: cast to **one** primary renderer (usually L); dual cast drops the HTTP pull.
