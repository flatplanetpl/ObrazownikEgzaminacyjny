/**
 * @file QuizPanel.tsx
 * @description Panel pytania: pasek wyniku, treść pytania, opcje odpowiedzi,
 *   feedback, fiszka z odpowiedzią i przyciski sterujące.
 * @dependencies framer-motion, ../../lib/quiz, ../shared/AnswerSheet, ./QuizOptions
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { QUESTION_TYPES } from '../../lib/quiz';
import { AnswerSheet } from '../shared/AnswerSheet';
import { QuizOptions } from './QuizOptions';
import type { usePlayGame } from './usePlayGame';

interface QuizPanelProps {
  game: ReturnType<typeof usePlayGame>;
}

export function QuizPanel({ game }: QuizPanelProps) {
  const { current, currentType, options, answered, selected, revealed, session, overallMastery, chooseQuestion, answer, revealAnswer } =
    game;

  if (!current) return null;

  const correctAnswer = QUESTION_TYPES[currentType].value(current);
  const isCorrect = answered && selected !== null && selected === correctAnswer;
  const showAnswerSheet = answered || revealed;
  const showNext = answered || revealed;

  return (
    <article className="glass-strong flex flex-col gap-4 rounded-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold sm:text-sm">
        <span className="glass rounded-full px-3 py-1.5">
          Wynik: <strong className="text-accent">{session.correct}/{session.total}</strong>
        </span>
        <span className="glass flex items-center gap-1.5 rounded-full px-3 py-1.5">
          <Flame size={14} className={session.streak > 0 ? 'text-accent' : 'text-muted'} />
          Seria: <strong className="text-accent">{session.streak}</strong>
        </span>
        <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5">
          Opanowanie:
          <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full bg-accent-2"
              animate={{ width: `${Math.round(overallMastery * 100)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </span>
          <strong className="text-accent-2">{Math.round(overallMastery * 100)}%</strong>
        </span>
      </div>

      <div>
        <p className="mb-1 text-xs font-black tracking-[0.2em] text-accent uppercase">
          {QUESTION_TYPES[currentType].label}
        </p>
        <h2 className="text-lg font-extrabold sm:text-xl">{QUESTION_TYPES[currentType].prompt()}</h2>
      </div>

      <QuizOptions options={options} correctAnswer={correctAnswer} selected={selected} answered={answered} onSelect={answer} />

      <AnimatePresence mode="wait">
        {answered && (
          <motion.p
            key={isCorrect ? 'good' : 'bad'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-sm font-bold sm:text-base ${isCorrect ? 'text-good' : 'text-bad'}`}
          >
            {isCorrect ? 'Dobrze. Zapisuję punkt i podbijam opanowanie.' : `Nie tym razem. Poprawna odpowiedź: ${correctAnswer}.`}
          </motion.p>
        )}
        {!answered && revealed && (
          <motion.p
            key="revealed"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-bold text-accent-soft sm:text-base"
          >
            Fiszka odsłonięta - potraktuj to jako naukę, nie błąd.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>{showAnswerSheet && <AnswerSheet item={current} />}</AnimatePresence>

      <div className="mt-auto flex flex-wrap gap-2.5 pt-1">
        <button
          type="button"
          onClick={chooseQuestion}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-extrabold text-bg shadow-[0_10px_30px_-10px_rgba(255,146,72,0.8)] transition-transform hover:-translate-y-0.5"
        >
          Nowe pytanie
        </button>
        {!revealed && !answered && (
          <button
            type="button"
            onClick={revealAnswer}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-extrabold text-ink/90 transition-colors hover:text-ink"
          >
            Pokaż fiszkę
          </button>
        )}
        {showNext && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={chooseQuestion}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-extrabold text-ink/90 transition-colors hover:text-ink"
          >
            Dalej
          </motion.button>
        )}
      </div>
    </article>
  );
}
