/**
 * @file ControlsPanel.tsx
 * @description Panel ustawień gry: filtr epoki/stylu, kolejność powtórek i typy pytań.
 * @dependencies lucide-react, ../../data/artworks, ../../lib/quiz, ../../store/useUiStore
 */

import { useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { ARTWORKS } from '../../data/artworks';
import { unique } from '../../lib/quiz';
import { useUiStore } from '../../store/useUiStore';
import type { OrderMode, QuestionTypeKey } from '../../types';

const QUESTION_TYPE_LABELS: { key: QuestionTypeKey; label: string }[] = [
  { key: 'artist', label: 'Autor' },
  { key: 'title', label: 'Tytuł' },
  { key: 'epoka', label: 'Epoka' },
  { key: 'style', label: 'Styl' },
];

const ORDER_MODES: { key: OrderMode; label: string }[] = [
  { key: 'smart', label: 'Inteligentne powtórki' },
  { key: 'random', label: 'Losowo' },
  { key: 'weak', label: 'Tylko słabsze / pomyłki' },
];

export function ControlsPanel() {
  const periodFilter = useUiStore(state => state.periodFilter);
  const styleFilter = useUiStore(state => state.styleFilter);
  const orderMode = useUiStore(state => state.orderMode);
  const questionTypes = useUiStore(state => state.questionTypes);
  const settingsCollapsed = useUiStore(state => state.settingsCollapsed);
  const setPeriodFilter = useUiStore(state => state.setPeriodFilter);
  const setStyleFilter = useUiStore(state => state.setStyleFilter);
  const setOrderMode = useUiStore(state => state.setOrderMode);
  const toggleQuestionType = useUiStore(state => state.toggleQuestionType);
  const toggleSettingsCollapsed = useUiStore(state => state.toggleSettingsCollapsed);

  const periods = useMemo(() => unique(ARTWORKS.map(item => item.epoka)), []);
  const styles = useMemo(
    () => unique(ARTWORKS.map(item => item.style)).sort((a, b) => a.localeCompare(b, 'pl')),
    [],
  );
  const activeQuestionTypes = QUESTION_TYPE_LABELS.filter(option => questionTypes.includes(option.key))
    .map(option => option.label.toLowerCase())
    .join(', ');
  const filterSummary = [periodFilter || 'wszystkie epoki', styleFilter || 'wszystkie style'].join(' · ');

  return (
    <section className="glass rounded-2xl p-2.5 sm:p-3">
      <button
        type="button"
        onClick={toggleSettingsCollapsed}
        aria-expanded={!settingsCollapsed}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal size={16} className="shrink-0 text-accent" />
          <span className="min-w-0">
            <span className="block text-xs font-black tracking-[0.18em] text-accent-soft uppercase">Ustawienia gry</span>
            <span className="block truncate text-xs text-muted">
              {filterSummary} · pytania: {activeQuestionTypes}
            </span>
          </span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink/75 transition-transform ${settingsCollapsed ? '-rotate-90' : 'rotate-0'}`}
        />
      </button>

      {!settingsCollapsed && (
        <div className="mt-2 grid min-w-0 gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="grid min-w-0 gap-2 sm:grid-cols-3">
            <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-muted">
              Epoka
              <select
                value={periodFilter}
                onChange={e => setPeriodFilter(e.target.value)}
                className="h-9 w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-white/5 px-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
              >
                <option value="">Wszystkie epoki</option>
                {periods.map(value => (
                  <option key={value} value={value} className="bg-bg-soft">
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-muted">
              Styl
              <select
                value={styleFilter}
                onChange={e => setStyleFilter(e.target.value)}
                className="h-9 w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-white/5 px-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
              >
                <option value="">Wszystkie style</option>
                {styles.map(value => (
                  <option key={value} value={value} className="bg-bg-soft">
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-col gap-1 text-[11px] font-bold text-muted">
              Kolejność
              <select
                value={orderMode}
                onChange={e => setOrderMode(e.target.value as OrderMode)}
                className="h-9 w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-white/5 px-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
              >
                {ORDER_MODES.map(mode => (
                  <option key={mode.key} value={mode.key} className="bg-bg-soft">
                    {mode.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-1.5 xl:justify-end">
            <span className="mr-1 shrink-0 text-[11px] font-black tracking-[0.16em] text-accent-soft uppercase">Pytaj</span>
            {QUESTION_TYPE_LABELS.map(option => {
              const checked = questionTypes.includes(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => toggleQuestionType(option.key)}
                  aria-pressed={checked}
                  className={`h-8 rounded-xl border px-2.5 text-xs font-extrabold transition-colors ${
                    checked
                      ? 'border-accent/60 bg-accent text-bg'
                      : 'border-white/10 bg-white/[0.03] text-ink/80 hover:border-accent/45 hover:text-ink'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
