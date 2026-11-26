import { calculateFine } from './fine-calculator.js';

describe('calculateFine', () => {
  const due = new Date('2026-01-15T12:00:00.000Z');

  it('charges nothing when a book is returned on time', () => {
    expect(calculateFine(due, due, 25)).toBe(0);
  });

  it('charges the daily rate for each overdue day', () => {
    expect(calculateFine(due, new Date('2026-01-17T12:00:00.000Z'), 25)).toBe(50);
  });
});
