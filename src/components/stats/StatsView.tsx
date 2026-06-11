/**
 * @file StatsView.tsx
 * @description Podsumowanie postępu nauki: statystyki ogólne, lista najczęściej mylonych dzieł,
 *   eksport i czyszczenie zapisanego postępu.
 * @dependencies framer-motion, lucide-react, ../../data/artworks, ../../store/useProgressStore
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2 } from 'lucide-react';
import { ARTWORKS } from '../../data/artworks';
import { useProgressStore } from '../../store/useProgressStore';

export function StatsView() {
  const items = useProgressStore(state => state.items);
  const totalAttempts = useProgressStore(state => state.totalAttempts);
  const totalCorrect = useProgressStore(state => state.totalCorrect);
  const resetProgress = useProgressStore(state => state.resetProgress);

  const accuracy = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  const mastered = useMemo(() => ARTWORKS.filter(item => (items[item.id]?.mastery || 0) >= 4).length, [items]);
  const touched = useMemo(() => ARTWORKS.filter(item => (items[item.id]?.attempts || 0) > 0).length, [items]);

  const weak = useMemo(
    () =>
      ARTWORKS.filter(item => {
        const progress = items[item.id];
        return (progress?.wrong || 0) > 0 || ((progress?.attempts || 0) > 0 && (progress?.mastery || 0) < 3);
      }).sort((a, b) => {
        const pa = items[a.id];
        const pb = items[b.id];
        return (pb?.wrong || 0) - (pa?.wrong || 0) || (pa?.mastery || 0) - (pb?.mastery || 0) || a.slide - b.slide;
      }),
    [items],
  );

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      app: 'Obrazownik egzaminacyjny',
      progress: { items, totalAttempts, totalCorrect },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `obrazownik-postep-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (!confirm('Wyczyścić cały zapisany postęp w tej przeglądarce?')) return;
    resetProgress();
  };

  const stats = [
    { label: 'Próby', value: totalAttempts },
    { label: 'Skuteczność', value: `${accuracy}%` },
    { label: 'Ruszone dzieła', value: `${touched}/${ARTWORKS.length}` },
    { label: 'Opanowane', value: mastered },
  ];

  return (
    <div className="space-y-4">
      <section className="glass rounded-3xl p-4 sm:p-5">
        <h2 className="text-xl font-extrabold">Postęp nauki</h2>
        <p className="text-sm text-muted">Postęp zapisuje się w pamięci tej przeglądarki. Nie potrzebujesz internetu ani konta.</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map(stat => (
            <div key={stat.label} className="glass rounded-2xl p-4 text-center">
              <span className="text-xs font-bold text-muted">{stat.label}</span>
              <strong className="mt-1 block text-3xl font-black tracking-tight text-accent">{stat.value}</strong>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleExport}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-extrabold text-ink/90 transition-colors hover:text-ink sm:w-auto"
          >
            <Download size={16} /> Eksportuj postęp JSON
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-bad/40 bg-bad/10 px-5 py-2.5 text-sm font-extrabold text-bad transition-colors hover:bg-bad/20 sm:w-auto"
          >
            <Trash2 size={16} /> Wyczyść postęp
          </button>
        </div>
      </section>

      <section className="glass-strong rounded-3xl p-4 sm:p-5">
        <h3 className="text-lg font-extrabold">Najczęściej mylone</h3>
        {!weak.length ? (
          <p className="mt-2 text-sm text-muted">
            Na razie brak pomyłek. Zagraj kilka rund, a pojawią się tu priorytety do powtórki.
          </p>
        ) : (
          <div className="mt-3 grid gap-2">
            {weak.slice(0, 12).map((item, index) => {
              const progress = items[item.id];
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03, ease: 'easeOut' }}
                  className="glass grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-2xl p-2.5"
                >
                  <img src={item.image} alt={item.title} loading="lazy" className="h-12 w-14 rounded-lg bg-[#1c1f29] object-contain" />
                  <div className="min-w-0">
                    <strong className="block truncate text-sm font-extrabold">{item.title}</strong>
                    <small className="text-xs text-muted">
                      {item.artist} · {item.style}
                    </small>
                  </div>
                  <span className="rounded-full bg-bad/15 px-3 py-1 text-xs font-extrabold text-bad">
                    {progress?.wrong || 0} bł.
                  </span>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
