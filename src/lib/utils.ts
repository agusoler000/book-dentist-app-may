import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Genera horarios cada media hora entre 07:00 y 22:00
export function generateHalfHourSlots(start = 7, end = 22) {
  const slots: string[] = [];
  for (let hour = start; hour <= end; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour !== end) slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  // Formato 24h a 12h AM/PM
  return slots.map(time => {
    const [h, m] = time.split(":");
    const hourNum = parseInt(h);
    const ampm = hourNum < 12 ? 'AM' : 'PM';
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${hour12.toString().padStart(2, '0')}:${m} ${ampm}`;
  });
}
