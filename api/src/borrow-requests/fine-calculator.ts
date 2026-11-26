/** Returns a fine rounded to cents, charging one day for any late portion of a day. */
export function calculateFine(
  dueDate: Date,
  returnDate: Date,
  ratePerDay: number,
): number {
  if (!Number.isFinite(ratePerDay) || ratePerDay <= 0) return 0;
  const due = dueDate.getTime();
  const returned = returnDate.getTime();
  if (!Number.isFinite(due) || !Number.isFinite(returned) || returned <= due) return 0;
  const overdueDays = Math.ceil((returned - due) / 86_400_000);
  return Math.round(overdueDays * ratePerDay * 100) / 100;
}
