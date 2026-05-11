export function toPersian(n) {
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

export function defaultSpyCount(playerCount) {
  if (playerCount <= 8) return 1;
  if (playerCount <= 14) return 2;
  return 3;
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${toPersian(String(m).padStart(2, '0'))}:${toPersian(String(s).padStart(2, '0'))}`;
}

export function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}