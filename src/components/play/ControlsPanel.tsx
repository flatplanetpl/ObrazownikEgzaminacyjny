/**
 * @file ControlsPanel.tsx
 * @description Panel ustawień gry: filtr epoki/stylu, kolejność powtórek i typy pytań.
 * @dependencies ../../data/artworks, ../../lib/quiz, ../../store/useUiStore
 */

import { useMemo } from 'react';
import { ARTWORKS } from '../../data/artworks';
import { unique } from '../../lib/quiz';
import { useUiStore } from '../../store/useUiStore';
import type { OrderMode, QuestionTypeKey } from '../../types';

const QUESTION_TYPE_LABELS: { key: QuestionTypeKey; label: string }[] = [
  { key: 'artist', label: 'autora' },
  { key: 'title', label: 'tytuł' },
  { key: 'epoka', label: 'epokę' },
  { key: 'style', label: 'styl' },
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
  const setPeriodFilter = useUiStore(state => state.setPeriodFilter);
  const setStyleFilter = useUiStore(state => state.setStyleFilter);
  const setOrderMode = useUiStore(state => state.setOrderMode);
  const toggleQuestionType = useUiStore(state => state.toggleQuestionType);

  const periods = useMemo(() => unique(ARTWORKS.map(item => item.epoka)), []);
  const styles = useMemo(
    () => unique(ARTWORKS.map(item => item.style)).sort((a, b) => a.localeCompare(b, 'pl')),
    [],
  );

  return (
    <section className="glass rounded-3xl p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1.5 text-xs font-bold text-muted">
          Epoka
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
          >
            <option value="">Wszystkie epoki</option>
            {periods.map(value => (
              <option key={value} value={value} className="bg-bg-soft">
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-muted">
          Styl
          <select
            value={styleFilter}
            onChange={e => setStyleFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
          >
            <option value="">Wszystkie style</option>
            {styles.map(value => (
              <option key={value} value={value} className="bg-bg-soft">
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold text-muted">
          Kolejność
          <select
            value={orderMode}
            onChange={e => setOrderMode(e.target.value as OrderMode)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
          >
            {ORDER_MODES.map(mode => (
              <option key={mode.key} value={mode.key} className="bg-bg-soft">
                {mode.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5">
        <legend className="px-1 text-xs font-black tracking-wide text-accent-soft uppercase">Pytaj o</legend>
        {QUESTION_TYPE_LABELS.map(option => (
          <label key={option.key} className="flex cursor-pointer items-center gap-2 text-sm font-bold text-ink/85">
            <input
              type="checkbox"
              checked={questionTypes.includes(option.key)}
              onChange={() => toggleQuestionType(option.key)}
              className="h-4 w-4 accent-orange-400"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <p className="mt-3 text-xs text-muted">
        Skróty: klawisze <strong className="text-ink">1-4</strong> odpowiadają na pytania, <strong className="text-ink">Enter</strong>{' '}
        przechodzi dalej.
      </p>
    </section>
  );
}
