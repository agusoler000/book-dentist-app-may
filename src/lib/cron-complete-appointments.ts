import prisma from './prisma';

async function completePastAppointments() {
  const now = new Date();
  // Solo citas SCHEDULED cuya fecha es menor a hoy (ignora hora)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const updated = await prisma.appointment.updateMany({
    where: {
      status: 'SCHEDULED',
      date: { lt: today },
    },
    data: { status: 'COMPLETED' },
  });
  console.log(`✅ Marcadas como COMPLETED: ${updated.count} citas`);
}

completePastAppointments()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); }); 