import type { Page, MusicTrack } from './types';
export function pageTrackPool(page: Page | undefined, tracks: MusicTrack[]): MusicTrack[] {
  if (!page) return tracks;
  const ids = page.settings?.selected_track_ids || [];
  return ids.length ? tracks.filter(t => ids.includes(t.id)) : tracks.filter(t => t.mood === (page.settings?.music_mood || 'tram'));
}

/** A stable shuffled deck for one batch. Exhaust the pool before repeating,
 * and never repeat a file across a deck boundary when alternatives exist. */
export function pageMusicPlan(tracks: MusicTrack[], count: number, seed: number): MusicTrack[] {
  const pool = tracks.filter((t, i) => tracks.findIndex(other => (other.file_path || other.id) === (t.file_path || t.id)) === i);
  if (!pool.length) return [];
  let state = seed >>> 0;
  const random = () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const plan: MusicTrack[] = [];
  while (plan.length < count) {
    const deck = [...pool];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    if (deck.length > 1 && plan.length && deck[0].id === plan[plan.length - 1].id) {
      [deck[0], deck[1]] = [deck[1], deck[0]];
    }
    plan.push(...deck.slice(0, count - plan.length));
  }
  return plan;
}
export function pageVideoDefaults(page: Page) {
  const v = page.settings?.overrides?._video || {};
  return {duration:Number(v.duration)||15,resolution:v.resolution||'1080x1920',fps:Number(v.fps)||30,
    volume:v.volume ?? 80,muted:Boolean(v.muted),background:v.background||'/assets/backgrounds/2.mp4'};
}
