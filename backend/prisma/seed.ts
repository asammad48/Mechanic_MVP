import prisma from '../src/lib/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Start seeding...');

  await prisma.$transaction(async (prisma) => {
    // Create Roles
    const ownerAdminRole = await prisma.role.upsert({
      where: { name: 'Owner/Admin' },
      update: {},
      create: { name: 'Owner/Admin' },
    });

    const managerRole = await prisma.role.upsert({
      where: { name: 'Manager' },
      update: {},
      create: { name: 'Manager' },
    });

    const mechanicRole = await prisma.role.upsert({
      where: { name: 'Mechanic' },
      update: {},
      create: { name: 'Mechanic' },
    });

    const receptionistRole = await prisma.role.upsert({
      where: { name: 'Receptionist' },
      update: {},
      create: { name: 'Receptionist' },
    });

    // Create Branches
    const branch1 = await prisma.branch.upsert({
      where: { code: 'ISB-01' },
      update: {},
      create: {
        name: 'Islamabad Branch',
        code: 'ISB-01',
        address: '123, Islamabad, Pakistan',
        phone: '051-1234567',
      },
    });

    const branch2 = await prisma.branch.upsert({
      where: { code: 'LHR-01' },
      update: {},
      create: {
        name: 'Lahore Branch',
        code: 'LHR-01',
        address: '456, Lahore, Pakistan',
        phone: '042-1234567',
      },
    });

    // Hash a default password
    const defaultPassword = await bcrypt.hash('Password123!', 10);

    // Create Super Admin
    await prisma.user.upsert({
      where: { email: 'admin@local' },
      update: {},
      create: {
        name: 'Super Admin',
        email: 'admin@local',
        password_hash: defaultPassword,
        roleId: ownerAdminRole.id,
        isSuperAdmin: true,
      },
    });

    // Additional Owner/Admin
    await prisma.user.upsert({
      where: { email: 'owner@local' },
      update: {},
      create: {
        name: 'Owner User',
        email: 'owner@local',
        password_hash: defaultPassword,
        roleId: ownerAdminRole.id,
        branchId: branch1.id,
      },
    });

    // Create Branch 1 Users
    await prisma.user.upsert({
      where: { email: 'manager1@local' },
      update: {},
      create: {
        name: 'Manager Branch 1',
        email: 'manager1@local',
        password_hash: defaultPassword,
        roleId: managerRole.id,
        branchId: branch1.id,
      },
    });
    await prisma.user.upsert({
      where: { email: 'mechanic1@local' },
      update: {},
      create: {
        name: 'Mechanic Branch 1',
        email: 'mechanic1@local',
        password_hash: defaultPassword,
        roleId: mechanicRole.id,
        branchId: branch1.id,
      },
    });
    await prisma.user.upsert({
      where: { email: 'receptionist1@local' },
      update: {},
      create: {
        name: 'Receptionist Branch 1',
        email: 'receptionist1@local',
        password_hash: defaultPassword,
        roleId: receptionistRole.id,
        branchId: branch1.id,
      },
    });

    // Create Branch 2 Users
    await prisma.user.upsert({
      where: { email: 'manager2@local' },
      update: {},
      create: {
        name: 'Manager Branch 2',
        email: 'manager2@local',
        password_hash: defaultPassword,
        roleId: managerRole.id,
        branchId: branch2.id,
      },
    });
    await prisma.user.upsert({
      where: { email: 'mechanic2@local' },
      update: {},
      create: {
        name: 'Mechanic Branch 2',
        email: 'mechanic2@local',
        password_hash: defaultPassword,
        roleId: mechanicRole.id,
        branchId: branch2.id,
      },
    });
    await prisma.user.upsert({
      where: { email: 'receptionist2@local' },
      update: {},
      create: {
        name: 'Receptionist Branch 2',
        email: 'receptionist2@local',
        password_hash: defaultPassword,
        roleId: receptionistRole.id,
        branchId: branch2.id,
      },
    });
  });

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
