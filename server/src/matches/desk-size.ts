export function parseDeskSize(raw: string | undefined): number {
  const source = raw === undefined || raw.trim() === '' ? '3' : raw.trim();
  const value = Number(source);
  if (!Number.isInteger(value) || value < 3 || value > 10) {
    throw new Error('DESK_SIZE должен быть целым числом от 3 до 10');
  }
  return value;
}
