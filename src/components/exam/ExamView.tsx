/**
 * @file ExamView.tsx
 * @description Widok trybu egzaminacyjnego: start sesji, zamknięty test, wynik i raport błędów.
 * @dependencies react, framer-motion, lucide-react, ../../data/artworks, ../../lib/exam, ../../lib/quiz, ../../store/useExamStore, ../../store/useProgressStore, ../../store/useUiStore, ../play/ImageStage, ../shared/ZoomOverlay
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, Flag, History, Play, RotateCcw, SlidersHorizontal, TimerReset, XCircle } from 'lucide-react';
import { ARTWORKS, type Artwork } from '../../data/artworks';
import {
  EXAM_PRESETS,
  createExamQuestions,
  formatDuration,
  scoreExam,
  type ExamPreset,
  type ExamQuestion,
  type ExamResult,
  type ExamReviewItem,
  type ExamReviewStatus,
} from '../../lib/exam';
import { QUESTION_TYPES, unique } from '../../lib/quiz';
import { useExamStore } from '../../store/useExamStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useUiStore } from '../../store/useUiStore';
import type { QuestionTypeKey } from '../../types';
import { ImageStage } from '../play/ImageStage';
import { ZoomOverlay } from '../shared/ZoomOverlay';

interface ExamViewProps {
  isFullscreen: boolean;
}

type ExamPhase = 'start' | 'running' | 'result';

interface ActiveExam {
  preset: ExamPreset;
  questions: ExamQuestion[];
  answers: Record<string, string>;
  index: number;
  startedAt: number;
  endsAt: number;
}

interface ReviewEntry {
  review: ExamReviewItem;
  item: Artwork;
}

const QUESTION_TYPE_OPTIONS: { key: QuestionTypeKey; label: string }[] = [
  { key: 'artist', label: 'Autor' },
  { key: 'title', label: 'Tytuł' },
  { key: 'epoka', label: 'Epoka' },
  { key: 'style', label: 'Styl' },
];

const REVIEW_STATUS_META: Record<ExamReviewStatus, { label: string; badgeClassName: string }> = {
  correct: { label: 'Poprawna', badgeClassName: 'bg-good/15 text-good' },
  wrong: { label: 'Błąd', badgeClassName: 'bg-bad/15 text-bad' },
  unanswered: { label: 'Bez odpowiedzi', badgeClassName: 'bg-accent/15 text-accent-soft' },
};

const RESULT_STATS = [
  { key: 'correct', label: 'Poprawne', icon: CheckCircle2, tone: 'text-good' },
  { key: 'wrong', label: 'Błędne', icon: XCircle, tone: 'text-bad' },
  { key: 'unanswered', label: 'Bez odpowiedzi', icon: Flag, tone: 'text-accent-soft' },
] as const;

function ExamReviewCard({ entry, index }: { entry: ReviewEntry; index: number }) {
  const { review, item } = entry;
  const statusMeta = REVIEW_STATUS_META[review.status];

  return (
    <motion.article
      key={`${review.itemId}-${review.questionType}-${index}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.025, ease: 'easeOut' }}
      className="glass grid gap-3 rounded-2xl p-3 sm:grid-cols-[74px_1fr]"
    >
      <img src={item.image} alt={item.title} loading="lazy" className="h-16 w-[74px] rounded-xl bg-[#1c1f29] object-contain" />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${statusMeta.badgeClassName}`}>
            {statusMeta.label}
          </span>
          <span className="text-xs font-bold text-muted">{QUESTION_TYPES[review.questionType].label}</span>
        </div>
        <strong className="mt-2 block text-sm font-extrabold sm:text-base">
          {item.artist}, {item.title}
        </strong>
        <p className="mt-1 text-xs text-muted">
          {item.year} · {item.epoka} · {item.style}
        </p>
        <div className="mt-2 grid gap-1 text-sm">
          <span>
            <strong className="text-good">Poprawna odpowiedź:</strong> {review.correctAnswer}
          </span>
          {review.status === 'wrong' && review.selectedAnswer && (
            <span>
              <strong className="text-bad">Wybrano:</strong> {review.selectedAnswer}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ExamView({ isFullscreen }: ExamViewProps) {
  const results = useExamStore(state => state.results);
  const addResult = useExamStore(state => state.addResult);
  const updateProgress = useProgressStore(state => state.updateProgress);
  const setActiveTab = useUiStore(state => state.setActiveTab);
  const setOrderMode = useUiStore(state => state.setOrderMode);
  const periodFilter = useUiStore(state => state.periodFilter);
  const styleFilter = useUiStore(state => state.styleFilter);
  const questionTypes = useUiStore(state => state.questionTypes);
  const setPeriodFilter = useUiStore(state => state.setPeriodFilter);
  const setStyleFilter = useUiStore(state => state.setStyleFilter);
  const toggleQuestionType = useUiStore(state => state.toggleQuestionType);

  const [phase, setPhase] = useState<ExamPhase>('start');
  const [activeExam, setActiveExam] = useState<ActiveExam | null>(null);
  const [latestResult, setLatestResult] = useState<ExamResult | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const currentQuestion = activeExam?.questions[activeExam.index] ?? null;
  const selectedAnswer = currentQuestion && activeExam ? activeExam.answers[currentQuestion.id] ?? null : null;
  const answeredCount = activeExam ? Object.keys(activeExam.answers).length : 0;
  const remainingSeconds = activeExam ? Math.max(0, Math.ceil((activeExam.endsAt - now) / 1000)) : 0;
  const progressPercent = activeExam ? ((activeExam.index + 1) / activeExam.questions.length) * 100 : 0;

  const periods = useMemo(() => unique(ARTWORKS.map(item => item.epoka)), []);
  const styles = useMemo(
    () => unique(ARTWORKS.map(item => item.style)).sort((a, b) => a.localeCompare(b, 'pl')),
    [],
  );
  const examPool = useMemo(
    () =>
      ARTWORKS.filter(item => {
        const periodOk = !periodFilter || item.epoka === periodFilter;
        const styleOk = !styleFilter || item.style === styleFilter;
        return periodOk && styleOk;
      }),
    [periodFilter, styleFilter],
  );
  const examQuestionTypes = useMemo(
    () => (questionTypes.length ? questionTypes : (['artist'] as QuestionTypeKey[])),
    [questionTypes],
  );
  const availableQuestionCount = examPool.length * examQuestionTypes.length;
  const activeQuestionTypeLabels = QUESTION_TYPE_OPTIONS.filter(option => examQuestionTypes.includes(option.key))
    .map(option => option.label.toLowerCase())
    .join(', ');
  const minimumPresetSize = EXAM_PRESETS[0]?.questionCount ?? 0;

  const resultReview = useMemo<ReviewEntry[]>(() => {
    if (!latestResult) return [];
    return latestResult.reviewItems.reduce<ReviewEntry[]>((entries, review) => {
      const item = ARTWORKS.find(artwork => artwork.id === review.itemId);
      if (item) entries.push({ review, item });
      return entries;
    }, []);
  }, [latestResult]);
  const mistakeReview = useMemo(
    () => resultReview.filter(entry => entry.review.status !== 'correct'),
    [resultReview],
  );
  const correctReview = useMemo(
    () => resultReview.filter(entry => entry.review.status === 'correct'),
    [resultReview],
  );

  const startExam = useCallback((preset: ExamPreset) => {
    if (availableQuestionCount < preset.questionCount) return;
    const startedAt = Date.now();
    setLatestResult(null);
    setNow(startedAt);
    setActiveExam({
      preset,
      questions: createExamQuestions(preset.questionCount, examPool, examQuestionTypes),
      answers: {},
      index: 0,
      startedAt,
      endsAt: startedAt + preset.limitMinutes * 60 * 1000,
    });
    setPhase('running');
  }, [availableQuestionCount, examPool, examQuestionTypes]);

  const saveMistakesToProgress = useCallback(
    (result: ExamResult) => {
      result.reviewItems.forEach(review => {
        if (review.status === 'wrong') {
          updateProgress(review.itemId, review.questionType, false);
        }
      });
    },
    [updateProgress],
  );

  const finishExam = useCallback(() => {
    if (!activeExam) return;
    const finishedAt = Date.now();
    const result = scoreExam(activeExam.questions, activeExam.answers, activeExam.preset, activeExam.startedAt, finishedAt);
    addResult(result);
    saveMistakesToProgress(result);
    setLatestResult(result);
    setActiveExam(null);
    setPhase('result');
  }, [activeExam, addResult, saveMistakesToProgress]);

  const selectAnswer = useCallback(
    (option: string) => {
      if (!currentQuestion) return;
      setActiveExam(state =>
        state
          ? {
              ...state,
              answers: {
                ...state.answers,
                [currentQuestion.id]: option,
              },
            }
          : state,
      );
    },
    [currentQuestion],
  );

  const goNext = useCallback(() => {
    if (!activeExam) return;
    if (activeExam.index >= activeExam.questions.length - 1) {
      finishExam();
      return;
    }
    setActiveExam(state => (state ? { ...state, index: state.index + 1 } : state));
  }, [activeExam, finishExam]);

  const requestFinish = useCallback(() => {
    if (!activeExam) return;
    if (!confirm('Zakończyć egzamin i przejść do wyniku?')) return;
    finishExam();
  }, [activeExam, finishExam]);

  const repeatMistakes = useCallback(() => {
    setOrderMode('weak');
    setActiveTab('play');
  }, [setActiveTab, setOrderMode]);

  useEffect(() => {
    if (phase !== 'running' || !activeExam) return;
    const timer = window.setInterval(() => {
      const nextNow = Date.now();
      setNow(nextNow);
      if (nextNow >= activeExam.endsAt) {
        finishExam();
      }
    }, 500);
    return () => window.clearInterval(timer);
  }, [activeExam, finishExam, phase]);

  useEffect(() => {
    if (phase !== 'running') return;

    function handleKeydown(event: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement | null)?.tagName;
      if (tag && ['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return;

      if (event.key >= '1' && event.key <= '4' && currentQuestion) {
        const option = currentQuestion.options[Number(event.key) - 1];
        if (option) selectAnswer(option);
      }
      if (event.key === 'Enter') {
        goNext();
      }
    }

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [currentQuestion, goNext, phase, selectAnswer]);

  if (phase === 'running' && activeExam && currentQuestion) {
    const currentNumber = activeExam.index + 1;
    const questionLabel = QUESTION_TYPES[currentQuestion.questionType].label;
    const timeDanger = remainingSeconds <= 60;

    return (
      <div className="space-y-4">
        <section className="glass flex flex-col gap-3 rounded-3xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-accent uppercase">Egzamin</p>
              <h2 className="text-lg font-extrabold sm:text-xl">{activeExam.preset.label}</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold sm:text-sm">
              <span className="glass rounded-full px-3 py-1.5">
                Pytanie <strong className="text-accent">{currentNumber}/{activeExam.questions.length}</strong>
              </span>
              <span className="glass rounded-full px-3 py-1.5">
                Udzielone <strong className="text-accent-2">{answeredCount}</strong>
              </span>
              <span className={`glass flex items-center gap-1.5 rounded-full px-3 py-1.5 ${timeDanger ? 'text-bad' : ''}`}>
                <Clock3 size={14} /> {formatDuration(remainingSeconds)}
              </span>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="block h-full rounded-full bg-accent"
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="sticky top-[6.5rem] z-10 self-start sm:top-16">
            <ImageStage
              item={currentQuestion.item}
              total={ARTWORKS.length}
              isFullscreen={isFullscreen}
              onZoom={() => setZoomSrc(currentQuestion.item.image)}
            />
          </div>

          <article className="glass-strong flex flex-col gap-4 rounded-3xl p-4 sm:p-6">
            <div>
              <p className="mb-1 text-xs font-black tracking-[0.2em] text-accent uppercase">{questionLabel}</p>
              <h2 className="text-lg font-extrabold sm:text-xl">{QUESTION_TYPES[currentQuestion.questionType].prompt()}</h2>
              <p className="mt-2 text-sm text-muted">Odpowiedź możesz zmienić do momentu przejścia dalej.</p>
            </div>

            <div role="list" className="grid gap-2.5">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                return (
                  <motion.button
                    key={option}
                    type="button"
                    role="listitem"
                    onClick={() => selectAnswer(option)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.25, ease: 'easeOut' }}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-bold transition-colors sm:px-4 sm:py-3.5 sm:text-base ${
                      isSelected
                        ? 'border-accent/70 bg-accent/15 text-ink shadow-[0_0_26px_-8px_rgba(255,146,72,0.75)]'
                        : 'border-white/10 bg-white/[0.03] text-ink/90 hover:border-accent/50 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${isSelected ? 'bg-accent text-bg' : 'bg-white/10 text-accent-soft'}`}>
                      {index + 1}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-auto flex flex-col gap-2.5 pt-1 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={requestFinish}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-bad/40 bg-bad/10 px-5 py-2.5 text-sm font-extrabold text-bad transition-colors hover:bg-bad/20 sm:w-auto"
              >
                <Flag size={16} /> Zakończ
              </button>
              <button
                type="button"
                onClick={goNext}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-bg shadow-[0_10px_30px_-10px_rgba(255,146,72,0.8)] transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                {currentNumber === activeExam.questions.length ? 'Zakończ i pokaż wynik' : 'Dalej'}
              </button>
            </div>
          </article>
        </div>

        <ZoomOverlay src={zoomSrc} alt="Powiększenie dzieła" onClose={() => setZoomSrc(null)} />
      </div>
    );
  }

  if (phase === 'result' && latestResult) {
    return (
      <div className="space-y-4">
        <section className="glass-strong rounded-3xl p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.2em] text-accent uppercase">Wynik egzaminu</p>
              <h2 className="mt-1 text-3xl font-black text-glow sm:text-5xl">{latestResult.percentage}%</h2>
              <p className="mt-2 text-sm text-muted">
                {latestResult.correct}/{latestResult.total} poprawnych odpowiedzi w czasie {formatDuration(latestResult.durationSeconds)}.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:min-w-52">
              <button
                type="button"
                onClick={() => setPhase('start')}
                className="flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-bg shadow-[0_10px_30px_-10px_rgba(255,146,72,0.8)] transition-transform hover:-translate-y-0.5"
              >
                <TimerReset size={16} /> Nowy egzamin
              </button>
              <button
                type="button"
                onClick={repeatMistakes}
                disabled={!latestResult.reviewItems.some(item => item.status === 'wrong')}
                className="flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-extrabold text-ink/90 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
              >
                <RotateCcw size={16} /> Powtórz błędy
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {RESULT_STATS.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.key} className="glass rounded-2xl p-4">
                  <span className={`flex items-center gap-2 text-xs font-black uppercase ${stat.tone}`}>
                    <Icon size={16} /> {stat.label}
                  </span>
                  <strong className="mt-2 block text-3xl font-black">{latestResult[stat.key]}</strong>
                </div>
              );
            })}
          </div>
        </section>

        <section className="glass rounded-3xl p-4 sm:p-5">
          <h3 className="text-lg font-extrabold">Raport błędów i braków</h3>
          {!mistakeReview.length ? (
            <p className="mt-2 text-sm text-muted">Brak błędów i pytań bez odpowiedzi w tej sesji.</p>
          ) : (
            <div className="mt-3 grid gap-2.5">
              <AnimatePresence>
                {mistakeReview.map((entry, index) => (
                  <ExamReviewCard key={`${entry.review.itemId}-${entry.review.questionType}-${index}`} entry={entry} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="glass rounded-3xl p-4 sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-lg font-extrabold">Poprawne odpowiedzi</h3>
            <span className="text-xs font-bold text-muted">{correctReview.length}/{latestResult.total} odpowiedzi</span>
          </div>
          {!correctReview.length ? (
            <p className="mt-2 text-sm text-muted">Brak poprawnych odpowiedzi w tej sesji.</p>
          ) : (
            <div className="mt-3 grid gap-2.5">
              <AnimatePresence>
                {correctReview.map((entry, index) => (
                  <ExamReviewCard key={`${entry.review.itemId}-${entry.review.questionType}-${index}`} entry={entry} index={index} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="glass-strong rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black tracking-[0.2em] text-accent uppercase">Tryb egzaminacyjny</p>
            <h2 className="mt-1 text-2xl font-black sm:text-4xl">Sprawdź gotowość bez podpowiedzi</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Wybierz zakres materiału i długość sesji. Feedback i pełny raport pojawią się dopiero po zakończeniu egzaminu.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="glass flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-accent-soft">
              <History size={17} /> Historia: {results.length}/20
            </div>
            <button
              type="button"
              onClick={() => setSettingsOpen(open => !open)}
              aria-label="Ustawienia egzaminu"
              aria-expanded={settingsOpen}
              aria-controls="exam-settings"
              title="Ustawienia egzaminu"
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border text-accent-soft transition-colors ${
                settingsOpen
                  ? 'border-accent/55 bg-accent/15 text-accent'
                  : 'border-white/10 bg-white/[0.04] hover:border-accent/45 hover:text-accent'
              }`}
            >
              <SlidersHorizontal size={19} />
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {settingsOpen && (
            <motion.div
              id="exam-settings"
              initial={{ height: 0, opacity: 0, y: -6 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <div className="grid gap-2.5 lg:grid-cols-[minmax(150px,0.85fr)_minmax(150px,0.85fr)_minmax(260px,1.2fr)_auto] lg:items-end">
                  <label className="min-w-0 text-[11px] font-bold text-muted">
                    Epoka
                    <select
                      value={periodFilter}
                      onChange={event => setPeriodFilter(event.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-ink outline-none focus:border-accent"
                    >
                      <option value="">Wszystkie epoki</option>
                      {periods.map(value => (
                        <option key={value} value={value} className="bg-bg-soft">
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="min-w-0 text-[11px] font-bold text-muted">
                    Styl
                    <select
                      value={styleFilter}
                      onChange={event => setStyleFilter(event.target.value)}
                      className="mt-1 h-9 w-full rounded-xl border border-white/10 bg-white/5 px-2.5 text-xs font-semibold text-ink outline-none focus:border-accent"
                    >
                      <option value="">Wszystkie style</option>
                      {styles.map(value => (
                        <option key={value} value={value} className="bg-bg-soft">
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>

                  <fieldset className="min-w-0">
                    <legend className="text-[11px] font-bold text-muted">Typy pytań</legend>
                    <div className="mt-1 grid grid-cols-4 gap-1">
                      {QUESTION_TYPE_OPTIONS.map(option => {
                        const checked = examQuestionTypes.includes(option.key);
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => toggleQuestionType(option.key)}
                            aria-pressed={checked}
                            className={`h-9 rounded-xl border px-2 text-xs font-extrabold transition-colors ${
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
                  </fieldset>

                  <div className="rounded-xl border border-white/10 bg-bg-soft/55 px-3 py-2 text-xs font-bold text-muted lg:text-right">
                    <strong className="block text-sm text-ink">{examPool.length} dzieł</strong>
                    {availableQuestionCount} pytań · {activeQuestionTypeLabels}
                  </div>
                </div>
                {availableQuestionCount < minimumPresetSize && (
                  <p className="mt-2 text-xs font-bold text-accent-soft">Poszerz zakres, żeby uruchomić egzamin.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {EXAM_PRESETS.map(preset => {
            const disabled = availableQuestionCount < preset.questionCount;
            return (
              <motion.button
                key={preset.questionCount}
                type="button"
                onClick={() => startExam(preset)}
                disabled={disabled}
                whileHover={disabled ? undefined : { y: -3 }}
                whileTap={disabled ? undefined : { scale: 0.99 }}
                className={`glass group rounded-2xl p-4 text-left transition-colors ${
                  disabled
                    ? 'cursor-not-allowed opacity-45'
                    : 'hover:border-accent/50 hover:bg-white/[0.07]'
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <strong className="text-lg font-black">{preset.label}</strong>
                  <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-extrabold text-accent-soft">
                    {preset.questionCount} pytań
                  </span>
                </span>
                <span className="mt-2 flex items-center gap-2 text-sm font-bold text-muted">
                  <Clock3 size={16} /> {preset.limitMinutes} minut
                </span>
                <span className="mt-3 block text-sm text-ink/85">{preset.description}</span>
                <span className={`mt-4 inline-flex items-center gap-2 text-sm font-extrabold transition-transform ${disabled ? 'text-muted' : 'text-accent group-hover:translate-x-1'}`}>
                  <Play size={16} /> {disabled ? 'Za mało pytań w zakresie' : 'Start'}
                </span>
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="glass rounded-3xl p-4 sm:p-5">
        <h3 className="text-lg font-extrabold">Ostatnie egzaminy</h3>
        {!results.length ? (
          <p className="mt-2 text-sm text-muted">Nie ma jeszcze zapisanych wyników egzaminu.</p>
        ) : (
          <div className="mt-3 grid gap-2">
            {results.slice(0, 5).map(result => (
              <article key={result.id} className="glass grid gap-2 rounded-2xl p-3 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <strong className="text-sm font-extrabold">
                    {result.percentage}% · {result.correct}/{result.total} poprawnych
                  </strong>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(result.completedAt).toLocaleString('pl-PL')} · {result.presetSize} pytań · {formatDuration(result.durationSeconds)}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-extrabold text-accent-soft">
                  {result.wrong} bł. / {result.unanswered} bez odp.
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
