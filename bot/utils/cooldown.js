export function checkCooldown(last, seconds) {
  if (!last) return false;
  const diff = (Date.now() - last.getTime()) / 1000;
  return diff < seconds;
}
