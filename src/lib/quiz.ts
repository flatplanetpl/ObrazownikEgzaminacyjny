/**
 * @file quiz.ts
 * @description Logika gry: typy pytań, normalizacja tekstu, losowanie ważone i dobór dystraktorów.
 * @dependencies Artwork, QuestionTypeKey, OrderMode, ItemProgress z ../types
 */

import type { Artwork } from '../data/artworks';
import type { ItemProgress, OrderMode, QuestionTypeKey } from '../types';

export interface QuestionTypeDef {
  label: string;
  prompt: () => string;
  value: (item: Artwork) => string;
}

export const QUESTION_TYPES: Record<QuestionTypeKey, QuestionTypeDef> = {
  artist: {
    label: 'Autor / twórca',
    prompt: () => 'Kto jest autorem albo twórcą tego dzieła?',
    value: item => item.artist,
  },
  title: {
    label: 'Tytuł',
    prompt: () => 'Jaki tytuł ma to dzieło?',
    value: item => item.title,
  },
  epoka: {
    label: 'Epoka',
    prompt: () => 'Do której epoki / ramy chronologicznej najlepiej pasuje to dzieło?',
    value: item => item.epoka,
  },
  style: {
    label: 'Styl / kierunek',
    prompt: () => 'Jaki styl albo kierunek najlepiej opisuje to dzieło?',
    value: item => item.style,
  },
};

export function normalize(text: string | number | null | undefined): string {
  return String(text ?? '')
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '')
    .replace(/[’'`´]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach(value => {
    const key = normalize(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    result.push(value);
  });
  return result;
}

export function shuffle<T>(array: T[]): T[] {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function weightedChoice<T>(items: T[], weightFn: (item: T) => number): T {
  const weighted = items.map(item => ({ item, weight: Math.max(0.1, Number(weightFn(item)) || 0.1) }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let point = Math.random() * total;
  for (const entry of weighted) {
    point -= entry.weight;
    if (point <= 0) return entry.item;
  }
  return weighted[weighted.length - 1]?.item ?? items[0];
}

export function itemWeight(
  itemProgress: ItemProgress,
  type: QuestionTypeKey | 'flashcard',
  mode: OrderMode,
): number {
  const fieldProgress = itemProgress.fields[type];
  const mastery = Math.min(itemProgress.mastery || 0, fieldProgress?.mastery || 0);
  const wrongBoost = (itemProgress.wrong || 0) + (fieldProgress?.wrong || 0) * 1.5;
  if (mode === 'random') return 1;
  if (mode === 'weak') return wrongBoost > 0 || mastery < 3 ? 8 + wrongBoost + (5 - mastery) : 0.1;
  return 1 + wrongBoost + Math.pow(5 - mastery, 1.45);
}

export function buildOptions(
  item: Artwork,
  type: QuestionTypeKey,
  pool: Artwork[],
  allArtworks: Artwork[],
): string[] {
  const answer = QUESTION_TYPES[type].value(item);
  let candidates: string[] = [];

  if (type === 'title') {
    candidates = pool
      .filter(other => other.id !== item.id && (other.epoka === item.epoka || other.style === item.style))
      .map(other => other.title);
  } else if (type === 'artist') {
    candidates = pool
      .filter(
        other =>
          other.id !== item.id &&
          (other.epoka === item.epoka || other.style === item.style || other.medium === item.medium),
      )
      .map(other => other.artist);
  } else if (type === 'style') {
    candidates = allArtworks.filter(other => other.id !== item.id && other.epoka === item.epoka).map(other => other.style);
  } else if (type === 'epoka') {
    candidates = allArtworks.map(other => other.epoka);
  }

  const normalizedAnswer = normalize(answer);
  candidates = unique(candidates).filter(value => normalize(value) !== normalizedAnswer);

  if (candidates.length < 3) {
    const fallback = unique(allArtworks.map(other => QUESTION_TYPES[type].value(other))).filter(
      value => normalize(value) !== normalizedAnswer,
    );
    candidates = unique(candidates.concat(fallback));
  }

  return shuffle([answer, ...shuffle(candidates).slice(0, 3)]);
}
