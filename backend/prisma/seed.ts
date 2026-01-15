
import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Start seeding...');

  // Create roles
  const adminRole = await prisma.role.create({
    data: { name: 'Owner/Admin' },
  });
  console.log('Created admin role');

  await prisma.role.create({
    data: { name: 'Manager' },
  });
  console.log('Created manager role');

  await prisma.role.create({
    data: { name: 'Mechanic' },
  });
    console.log('Created mechanic role');

  await prisma.role.create({
    data: { name: 'Receptionist' },
  });
    console.log('Created receptionist role');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@local',
      password_hash: hashedPassword,
      role_id: adminRole.id,
    },
  });
  console.log('Created admin user');

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
