/**
 * @file QuizOptions.tsx
 * @description Cztery opcje odpowiedzi z animacją wejścia oraz feedbackiem poprawności.
 * @dependencies framer-motion, ../../lib/quiz
 */

import { motion } from 'framer-motion';
import { normalize } from '../../lib/quiz';

interface QuizOptionsProps {
  options: string[];
  correctAnswer: string;
  selected: string | null;
  answered: boolean;
  onSelect: (option: string) => void;
}

export function QuizOptions({ options, correctAnswer, selected, answered, onSelect }: QuizOptionsProps) {
  const normalizedCorrect = normalize(correctAnswer);

  return (
    <div role="list" className="grid gap-2.5">
      {options.map((option, index) => {
        const isCorrect = normalize(option) === normalizedCorrect;
        const isSelected = selected === option;
        const showCorrect = answered && isCorrect;
        const showWrong = answered && isSelected && !isCorrect;

        return (
          <motion.button
            key={option}
            type="button"
            role="listitem"
            disabled={answered}
            onClick={() => onSelect(option)}
            initial={{ opacity: 0, y: 14 }}
            animate={
              showWrong
                ? { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
                : { opacity: 1, y: 0 }
            }
            transition={{ delay: showWrong ? 0 : index * 0.06, duration: showWrong ? 0.4 : 0.3, ease: 'easeOut' }}
            whileHover={!answered ? { scale: 1.015, y: -1 } : undefined}
            whileTap={!answered ? { scale: 0.99 } : undefined}
            className={`flex items-start gap-3 rounded-2xl border px-3 py-3 text-left text-sm font-bold transition-colors sm:px-4 sm:py-3.5 sm:text-base ${
              showCorrect
                ? 'border-good/60 bg-good/15 text-ink shadow-[0_0_28px_-6px_rgba(52,211,153,0.55)]'
                : showWrong
                  ? 'border-bad/60 bg-bad/15 text-ink shadow-[0_0_28px_-6px_rgba(248,113,113,0.55)]'
                  : 'border-white/10 bg-white/[0.03] text-ink/90 hover:border-accent/50 hover:bg-white/[0.06]'
            } ${answered ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                showCorrect
                  ? 'bg-good text-bg'
                  : showWrong
                    ? 'bg-bad text-bg'
                    : 'bg-white/10 text-accent-soft'
              }`}
            >
              {index + 1}
            </span>
            <span className="leading-snug">{option}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
