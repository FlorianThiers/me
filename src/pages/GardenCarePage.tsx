import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Leaf, Scissors, Bug, Clock3, CheckCircle2 } from 'lucide-react';

type GardenCrop = {
  id: string;
  name: string;
  zone?: string | null;
  status?: string | null;
  notes?: string | null;
};

type PlantCatalogPayload = {
  gardenCrops?: GardenCrop[];
};

type CareAction = 'Harvest now' | 'Check pests' | 'Prune soon' | 'Routine check';

function normalize(v?: string | null): string {
  return (v || '').toLowerCase();
}

function actionForCrop(crop: GardenCrop): CareAction {
  const status = normalize(crop.status);
  const notes = normalize(crop.notes);
  const zone = normalize(crop.zone);

  if (status.includes('oogstbaar') || notes.includes('rijp') || zone.includes('rijp')) {
    return 'Harvest now';
  }
  if (notes.includes('slak') || zone.includes('slak')) {
    return 'Check pests';
  }
  if (notes.includes('snoei') || zone.includes('snoei') || zone.includes('bossig')) {
    return 'Prune soon';
  }
  return 'Routine check';
}

function actionBadge(action: CareAction): string {
  switch (action) {
    case 'Harvest now':
      return 'text-amber-200 border-amber-400/40 bg-amber-500/10';
    case 'Check pests':
      return 'text-rose-200 border-rose-400/40 bg-rose-500/10';
    case 'Prune soon':
      return 'text-sky-200 border-sky-400/40 bg-sky-500/10';
    default:
      return 'text-white/70 border-white/15 bg-white/5';
  }
}

function actionIcon(action: CareAction) {
  switch (action) {
    case 'Harvest now':
      return <CheckCircle2 className="w-4 h-4 text-amber-300" />;
    case 'Check pests':
      return <Bug className="w-4 h-4 text-rose-300" />;
    case 'Prune soon':
      return <Scissors className="w-4 h-4 text-sky-300" />;
    default:
      return <Clock3 className="w-4 h-4 text-white/50" />;
  }
}

export const GardenCarePage: React.FC = () => {
  const [crops, setCrops] = useState<GardenCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/data/plant-catalog.json');
        if (!res.ok) throw new Error(`${res.status}`);
        const data = (await res.json()) as PlantCatalogPayload;
        if (!cancelled) {
          setCrops(data.gardenCrops || []);
          setError(null);
        }
      } catch {
        if (!cancelled) setError('load_failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () =>
      crops.map((crop) => ({
        ...crop,
        action: actionForCrop(crop),
      })),
    [crops],
  );

  const urgent = items.filter((x) => x.action !== 'Routine check');

  return (
    <div className="min-h-screen pb-16">
      <div className="container-custom px-4 py-8 max-w-4xl mx-auto">
        <Link
          to="/life-rhythm"
          className="inline-flex items-center text-neon-green text-sm mb-8 hover:text-neon-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar Life rhythm
        </Link>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-6 h-6 text-neon-green" />
            <h1 className="text-3xl font-bold text-white">Garden care tracker</h1>
          </div>
          <p className="text-white/65 text-sm">
            Volg per plant wat nu aandacht nodig heeft: oogsten, slakken-check, snoei of routine controle.
          </p>
        </motion.div>

        {loading && <p className="text-white/50 text-sm">Laden van plantstatus...</p>}
        {error && <p className="text-rose-300 text-sm">Kon plantstatus niet laden.</p>}

        {!loading && !error && (
          <>
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 p-4 mb-6">
              <p className="text-xs text-amber-200 uppercase tracking-wider mb-2">Vandaag prioriteit</p>
              {urgent.length ? (
                <ul className="space-y-1">
                  {urgent.map((item) => (
                    <li key={item.id} className="text-sm text-amber-100/90">
                      - {item.name}: {item.action}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-white/70">Geen urgente taken, enkel routine checks.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-dark-secondary/60 backdrop-blur-sm p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="text-white font-semibold">{item.name}</h2>
                    <span className={`text-[11px] px-2 py-1 rounded-full border ${actionBadge(item.action)}`}>
                      {item.action}
                    </span>
                  </div>
                  <p className="text-xs text-white/55 mb-1">Status: {item.status || 'Onbekend'}</p>
                  {item.zone && <p className="text-xs text-white/50 mb-1">Locatie: {item.zone}</p>}
                  {item.notes && <p className="text-xs text-white/45">Notitie: {item.notes}</p>}
                  <div className="mt-3 flex items-center gap-2">{actionIcon(item.action)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
