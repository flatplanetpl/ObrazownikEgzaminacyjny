/**
 * @file usePlayGame.ts
 * @description Hook z logiką trybu gry: dobór pytania, opcji, ocena odpowiedzi i sesja.
 * @dependencies ../../data/artworks, ../../lib/quiz, ../../store/useUiStore, ../../store/useProgressStore
 */

import { useCallback, useMemo, useState } from 'react';
import { ARTWORKS, type Artwork } from '../../data/artworks';
import { QUESTION_TYPES, buildOptions, itemWeight, normalize, weightedChoice } from '../../lib/quiz';
import type { ItemProgress, OrderMode, QuestionTypeKey } from '../../types';
import { useProgressStore } from '../../store/useProgressStore';
import { useUiStore } from '../../store/useUiStore';

export interface SessionState {
  total: number;
  correct: number;
  streak: number;
}

interface QuestionState {
  item: Artwork | null;
  questionType: QuestionTypeKey;
  options: string[];
  answered: boolean;
  selected: string | null;
  revealed: boolean;
}

function pickQuestion(
  pool: Artwork[],
  questionTypes: QuestionTypeKey[],
  orderMode: OrderMode,
  getItemProgress: (id: string) => ItemProgress,
): QuestionState {
  if (!pool.length) {
    return { item: null, questionType: 'artist', options: [], answered: false, selected: null, revealed: false };
  }
  const types = questionTypes.length ? questionTypes : (['artist'] as QuestionTypeKey[]);
  const type = types[Math.floor(Math.random() * types.length)];
  const item = weightedChoice(pool, candidate => itemWeight(getItemProgress(candidate.id), type, orderMode));
  return {
    item,
    questionType: type,
    options: buildOptions(item, type, pool, ARTWORKS),
    answered: false,
    selected: null,
    revealed: false,
  };
}

export function usePlayGame() {
  const periodFilter = useUiStore(state => state.periodFilter);
  const styleFilter = useUiStore(state => state.styleFilter);
  const questionTypes = useUiStore(state => state.questionTypes);
  const orderMode = useUiStore(state => state.orderMode);
  const items = useProgressStore(state => state.items);
  const getItemProgress = useProgressStore(state => state.getItemProgress);
  const updateProgress = useProgressStore(state => state.updateProgress);

  const pool = useMemo(
    () =>
      ARTWORKS.filter(item => {
        const periodOk = !periodFilter || item.epoka === periodFilter;
        const styleOk = !styleFilter || item.style === styleFilter;
        return periodOk && styleOk;
      }),
    [periodFilter, styleFilter],
  );

  const [question, setQuestion] = useState<QuestionState>(() => pickQuestion(pool, questionTypes, orderMode, getItemProgress));
  const [session, setSession] = useState<SessionState>({ total: 0, correct: 0, streak: 0 });

  const [prevDeps, setPrevDeps] = useState({ pool, questionTypes, orderMode });
  if (prevDeps.pool !== pool || prevDeps.questionTypes !== questionTypes || prevDeps.orderMode !== orderMode) {
    setPrevDeps({ pool, questionTypes, orderMode });
    setQuestion(pickQuestion(pool, questionTypes, orderMode, getItemProgress));
  }

  const chooseQuestion = useCallback(() => {
    setQuestion(pickQuestion(pool, questionTypes, orderMode, getItemProgress));
  }, [pool, questionTypes, orderMode, getItemProgress]);

  const answer = useCallback(
    (option: string) => {
      const artwork = question.item;
      if (!artwork || question.answered) return;
      const correctAnswer = QUESTION_TYPES[question.questionType].value(artwork);
      const correct = normalize(option) === normalize(correctAnswer);
      setQuestion(prev => ({ ...prev, answered: true, selected: option }));
      setSession(state => ({
        total: state.total + 1,
        correct: state.correct + (correct ? 1 : 0),
        streak: correct ? state.streak + 1 : 0,
      }));
      updateProgress(artwork.id, question.questionType, correct);
    },
    [question, updateProgress],
  );

  const revealAnswer = useCallback(() => setQuestion(prev => ({ ...prev, revealed: true })), []);

  const overallMastery = useMemo(() => {
    if (!ARTWORKS.length) return 0;
    const total = ARTWORKS.reduce((sum, item) => sum + (items[item.id]?.mastery || 0), 0);
    return total / (ARTWORKS.length * 5);
  }, [items]);

  return {
    pool,
    current: question.item,
    currentType: question.questionType,
    options: question.options,
    answered: question.answered,
    selected: question.selected,
    revealed: question.revealed,
    session,
    overallMastery,
    chooseQuestion,
    answer,
    revealAnswer,
  };
}
