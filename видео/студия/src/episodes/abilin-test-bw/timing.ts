import words from './words.json';

// Неизменённые первые 42 слова из задача/голос/best_words.json.
// Индексы нужны из-за повторов слов и отличий ASR («Абелин», «1974», «85»).
export const FPS = 30;
export const wordFrame = (index: number) => Math.round((words[index][0] as number) * FPS);
export const START_WORDS = [0, 10, 15, 19, 26, 32, 36];
export const STARTS = START_WORDS.map(wordFrame);
export const at = (shot: number, word: number) => wordFrame(word) - STARTS[shot];
// ceil сохраняет слово целиком; два кадра запаса не захватывают «Домой» (16,04 с).
export const AUDIO_END = Math.ceil((words[41][1] as number) * FPS) + 2;
export const TOTAL = AUDIO_END;
