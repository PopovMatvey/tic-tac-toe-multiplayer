import { parseDeskSize } from './desk-size';

describe('parseDeskSize', () => {
  it('по умолчанию берёт 3', () => {
    expect(parseDeskSize(undefined)).toBe(3);
    expect(parseDeskSize('')).toBe(3);
  });

  it('принимает целое от 3 до 10', () => {
    expect(parseDeskSize('4')).toBe(4);
    expect(parseDeskSize('10')).toBe(10);
  });

  it('отклоняет дробные и слишком маленькие значения', () => {
    expect(() => parseDeskSize('2')).toThrow(/DESK_SIZE/);
    expect(() => parseDeskSize('3.5')).toThrow(/DESK_SIZE/);
  });
});
