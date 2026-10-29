import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_lib/auth.js';
import { addFood, addLifeLog, addWater, type LifeIntensity } from './_lib/notion.js';
import { recordUsage } from './_lib/quotaStore.js';

const KINDS = ['water', 'food', 'sleep', 'movement', 'meditation', 'mood'] as const;
type CaptureKind = (typeof KINDS)[number];
type SportType = 'A' | 'B' | 'C' | 'D';

type CaptureBody = {
  date?: string;
  kind?: CaptureKind;
  liters?: number;
  preset?: string;
  minutes?: number;
  hours?: number;
  sportType?: SportType;
  energy?: number;
  intensity?: LifeIntensity;
  moodScore?: number;
  moodNote?: string;
};

function brusselsDate(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Brussels' });
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function isKind(v: unknown): v is CaptureKind {
  return typeof v === 'string' && (KINDS as readonly string[]).includes(v);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
  if (!requireAuth(req, res)) return;

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as CaptureBody;
  const date = body.date ?? brusselsDate();
  const kind = body.kind;

  if (!isKind(kind)) {
    return res.status(400).json({
      success: false,
      error: 'kind must be water, food, sleep, movement, meditation or mood',
    });
  }

  try {
    if (kind === 'water') {
      const liters = typeof body.liters === 'number' ? body.liters : 0.25;
      const waterL = await addWater(date, liters);
      await recordUsage(
        {
          provider: 'tier0',
          tokensIn: 0,
          tokensOut: 0,
          intent: 'capture_water',
          ok: true,
          note: `+${liters}L`,
        },
        date,
      );
      return res.status(200).json({
        success: true,
        date,
        kind: 'water',
        addedL: liters,
        waterL,
      });
    }

    if (kind === 'food') {
      const preset = body.preset ?? 'merci';
      const entryId = await addFood(date, preset);
      await recordUsage(
        {
          provider: 'tier0',
          tokensIn: 0,
          tokensOut: 0,
          intent: 'capture_food',
          ok: true,
          note: preset,
        },
        date,
      );
      return res.status(200).json({
        success: true,
        date,
        kind: 'food',
        preset,
        entryId,
      });
    }

    if (kind === 'sleep') {
      const hours = clamp(typeof body.hours === 'number' ? body.hours : 7.5, 0.5, 14);
      const energy =
        typeof body.energy === 'number' ? clamp(body.energy, 1, 5) : undefined;
      const entryId = await addLifeLog({
        date,
        category: 'Sleep',
        title: `Slaap ${hours}u`,
        minutes: Math.round(hours * 60),
        energy,
        notes: `julia capture · sleep ${hours}h`,
      });
      await recordUsage(
        {
          provider: 'tier0',
          tokensIn: 0,
          tokensOut: 0,
          intent: 'capture_sleep',
          ok: true,
          note: `${hours}h`,
        },
        date,
      );
      return res.status(200).json({
        success: true,
        date,
        kind: 'sleep',
        hours,
        sleepHours: hours,
        entryId,
      });
    }

    if (kind === 'movement') {
      const minutes = clamp(typeof body.minutes === 'number' ? body.minutes : 30, 1, 300);
      const sportType = body.sportType;
      const intensity: LifeIntensity =
        body.intensity ?? (sportType && sportType !== 'D' ? 'Active' : 'Light');
      const label = sportType ? `Beweging type ${sportType}` : 'Beweging';
      const entryId = await addLifeLog({
        date,
        category: 'Movement',
        title: `${label} · ${minutes} min`,
        minutes,
        intensity,
        notes: sportType ? `julia capture · type ${sportType}` : 'julia capture · movement',
      });
      await recordUsage(
        {
          provider: 'tier0',
          tokensIn: 0,
          tokensOut: 0,
          intent: 'capture_movement',
          ok: true,
          note: `${minutes}m`,
        },
        date,
      );
      return res.status(200).json({
        success: true,
        date,
        kind: 'movement',
        minutes,
        sportType: sportType ?? null,
        entryId,
      });
    }

    if (kind === 'mood') {
      const score = clamp(typeof body.moodScore === 'number' ? body.moodScore : 3, 1, 5);
      const note = typeof body.moodNote === 'string' ? body.moodNote.slice(0, 500) : '';
      const entryId = await addLifeLog({
        date,
        category: 'Mood',
        title: `Mood ${score}/5`,
        energy: score,
        notes: note || `julia capture · mood ${score}/5`,
      });
      await recordUsage(
        {
          provider: 'tier0',
          tokensIn: 0,
          tokensOut: 0,
          intent: 'capture_mood',
          ok: true,
          note: `${score}/5`,
        },
        date,
      );
      return res.status(200).json({
        success: true,
        date,
        kind: 'mood',
        moodScore: score,
        entryId,
      });
    }

    const minutes = clamp(typeof body.minutes === 'number' ? body.minutes : 10, 1, 180);
    const entryId = await addLifeLog({
      date,
      category: 'Meditation',
      title: `Meditatie · ${minutes} min`,
      minutes,
      intensity: 'Sedentary',
      notes: 'julia capture · meditation timer',
    });
    await recordUsage(
      {
        provider: 'tier0',
        tokensIn: 0,
        tokensOut: 0,
        intent: 'capture_meditation',
        ok: true,
        note: `${minutes}m`,
      },
      date,
    );
    return res.status(200).json({
      success: true,
      date,
      kind: 'meditation',
      minutes,
      meditationMin: minutes,
      entryId,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Capture failed';
    return res.status(503).json({ success: false, error: msg });
  }
}
