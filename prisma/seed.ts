import { PrismaClient, AppointmentStatus } from '@prisma/client';
import { format } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Seed Patients
  const patient1 = await prisma.patient.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Wonderland',
      password: 'password123', // Plaintext for mock/seed
      phone: '555-0101',
      dob: new Date('1990-05-15'),
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob The Builder',
      password: 'password123', // Plaintext for mock/seed
      phone: '555-0102',
      dob: new Date('1985-11-20'),
    },
  });
  console.log('Seeded patients');

  // Seed Dentists
  const dentist1 = await prisma.dentist.create({
    data: {
      email: 'dr.eve@coec.com',
      name: 'Dr. Eve Toothaker',
      password: 'password123', // Plaintext for mock/seed
      specialty: 'General Dentistry',
      isAvailableForEmergency: true,
      profileImageUrl: 'https://picsum.photos/seed/dentist1/200/200',
      bio: 'Experienced general dentist with a passion for preventative care.',
    },
  });

  const dentist2 = await prisma.dentist.create({
    data: {
      email: 'dr.adam@coec.com',
      name: 'Dr. Adam Smilewright',
      password: 'password123', // Plaintext for mock/seed
      specialty: 'Orthodontics',
      isAvailableForEmergency: false,
      profileImageUrl: 'https://picsum.photos/seed/dentist2/200/200',
      bio: 'Specializing in creating beautiful smiles with advanced orthodontic treatments.',
    },
  });

  const dentist3 = await prisma.dentist.create({
    data: {
      email: 'dr.grace@coec.com',
      name: 'Dr. Grace Periodontal',
      password: 'password123', // Plaintext for mock/seed
      specialty: 'Periodontics',
      isAvailableForEmergency: true,
      profileImageUrl: 'https://picsum.photos/seed/dentist3/200/200',
      bio: 'Focused on gum health and treating periodontal diseases.',
    },
  });
  console.log('Seeded dentists');

  // Seed Services
  const service1 = await prisma.service.create({
    data: {
      name: 'Routine Check-up & Cleaning',
      durationMinutes: 60,
      description: 'Comprehensive dental check-up and professional cleaning.',
    },
  });

  const service2 = await prisma.service.create({
    data: {
      name: 'Cavity Filling',
      durationMinutes: 45,
      description: 'Restoration of a tooth damaged by decay.',
    },
  });
  
  const service3 = await prisma.service.create({
    data: {
      name: 'Teeth Whitening',
      durationMinutes: 90,
      description: 'Professional teeth whitening treatment for a brighter smile.',
    },
  });

  const service4 = await prisma.service.create({
    data: {
        name: 'Orthodontic Consultation',
        durationMinutes: 45,
        description: 'Consultation for orthodontic treatments like braces or aligners.'
    }
  });
   const service5 = await prisma.service.create({
    data: {
        name: 'Emergency Consultation',
        durationMinutes: 30,
        description: 'Urgent assessment of dental emergencies.'
    }
  });
  console.log('Seeded services');

  // Seed Appointments
  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      dentistId: dentist1.id,
      serviceId: service1.id,
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      time: '10:00 AM',
      status: AppointmentStatus.SCHEDULED,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient2.id,
      dentistId: dentist2.id,
      serviceId: service4.id,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      time: '02:30 PM',
      status: AppointmentStatus.SCHEDULED,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient1.id,
      dentistId: dentist1.id,
      serviceId: service2.id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      time: '09:00 AM',
      status: AppointmentStatus.COMPLETED,
    },
  });
  console.log('Seeded appointments');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

