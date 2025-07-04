import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateHalfHourSlots } from '@/lib/utils';

function timeStringToMinutes(str: string) {
  // str: "HH:MM AM/PM"
  const [time, ampm] = str.split(' ');
  let [h, m] = time.split(":").map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

export async function GET(req: NextRequest) {
  const dentistId = req.nextUrl.searchParams.get('dentistId');
  const date = req.nextUrl.searchParams.get('date'); // YYYY-MM-DD
  if (!dentistId || !date) {
    return NextResponse.json({ success: false, error: 'Missing dentistId or date' }, { status: 400 });
  }
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        dentistId,
        date: { equals: new Date(date) },
        status: 'SCHEDULED',
      },
      select: { time: true, durationMinutes: true },
    });
    const slots = generateHalfHourSlots();
    const slotMinutes = slots.map(timeStringToMinutes);
    // Para cada cita, bloquear todos los slots que caen en el rango ocupado
    const blocked = new Set<string>();
    for (const app of appointments) {
      const start = timeStringToMinutes(app.time);
      const end = start + app.durationMinutes;
      slotMinutes.forEach((slotMin, i) => {
        if (slotMin >= start && slotMin < end) {
          blocked.add(slots[i]);
        }
      });
    }
    return NextResponse.json({ success: true, occupiedTimes: Array.from(blocked) });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
} 