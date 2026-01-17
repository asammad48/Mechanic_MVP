import 'dotenv/config';
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRoutes from '../src/auth/auth.routes';
import customerRoutes from '../src/customers/customers.routes';
import vehicleRoutes from '../src/vehicles/vehicles.routes';
import visitRoutes from '../src/visits/visits.routes';
import laborItemRoutes from '../src/labor-items/labor-items.routes';
import partItemRoutes from '../src/part-items/part-items.routes';
import outsideWorkItemRoutes from '../src/outside-work-items/outside-work-items.routes';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Mock branch middleware or bypass it for tests
app.use((req: any, res: any, next: any) => {
  req.user = { id: 'test-user-id', branchId: 'test-branch-id' };
  next();
});

app.use('/auth', authRoutes);
app.use('/customers', customerRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/visits', visitRoutes);
app.use('/labor-items', laborItemRoutes);
app.use('/part-items', partItemRoutes);
app.use('/outside-work-items', outsideWorkItemRoutes);

describe('Visit Costing Flow Integration Tests', () => {
  let branchId: string = 'test-branch-id';
  let customerId: string;
  let vehicleId: string;
  let visitId: string;

  beforeAll(async () => {
    // Clean up or ensure test data
    await prisma.branch.upsert({
      where: { id: branchId },
      update: {},
      create: { id: branchId, name: 'Test Branch', code: 'TEST_BRANCH' }
    });

    const role = await prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: { name: 'ADMIN' }
    });

    await prisma.user.upsert({
      where: { id: 'test-user-id' },
      update: { branchId, roleId: role.id },
      create: {
        id: 'test-user-id',
        name: 'Test Admin',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        roleId: role.id,
        branchId: branchId
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('1) Create visit with all mandatory fields -> SUCCESS', async () => {
    const customer = await prisma.customer.create({
      data: { name: 'Test Customer', phone: '1234567890', branchId }
    });
    customerId = customer.id;

    const vehicle = await prisma.vehicle.create({
      data: { regNo: 'ABC-123-' + Date.now(), make: 'Toyota', model: 'Corolla', year: 2020, customerId, branchId }
    });
    vehicleId = vehicle.id;

    const response = await request(app)
      .post('/visits')
      .send({
        vehicle_id: vehicleId,
        customer_id: customerId,
        complaint: 'Engine noise',
        mileage: 50000
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    visitId = response.body.id;
  });

  test('2) Create visit missing complaint or mileage -> FAIL', async () => {
    const response = await request(app)
      .post('/visits')
      .send({
        vehicle_id: vehicleId,
        customer_id: customerId
      });

    expect(response.status).toBe(400);
  });

  test('3) Add labor item (hours + rate) -> subtotalLabor updates', async () => {
    const response = await request(app)
      .post('/labor-items')
      .send({
        visitId,
        title: 'Oil Change',
        hours: 1,
        ratePerHour: 50
      });

    expect(response.status).toBe(201);
    
    const visitResponse = await request(app).get(`/visits/${visitId}`);
    expect(Number(visitResponse.body.subtotalLabor)).toBe(50);
  });

  test('4) Add spare part -> subtotalParts updates', async () => {
    const response = await request(app)
      .post('/part-items')
      .send({
        visitId,
        name: 'Oil Filter',
        qty: 1,
        unitPrice: 15
      });

    expect(response.status).toBe(201);
    
    const visitResponse = await request(app).get(`/visits/${visitId}`);
    expect(Number(visitResponse.body.subtotalParts)).toBe(15);
  });

  test('5) Add outside workshop item -> subtotalOutside updates', async () => {
    const response = await request(app)
      .post('/outside-work-items')
      .send({
        visitId,
        vendorName: 'Expert Machining',
        workDescription: 'Head resurfacing',
        cost: 200
      });

    expect(response.status).toBe(201);
    
    const visitResponse = await request(app).get(`/visits/${visitId}`);
    expect(Number(visitResponse.body.subtotalOutside)).toBe(200);
  });

  test('7) Fetch visit details -> verify all items and totals are correct', async () => {
    const response = await request(app).get(`/visits/${visitId}`);
    expect(response.status).toBe(200);
    expect(Number(response.body.subtotalLabor)).toBe(50);
    expect(Number(response.body.subtotalParts)).toBe(15);
    expect(Number(response.body.subtotalOutside)).toBe(200);
    expect(Number(response.body.grandTotal)).toBe(265);
  });
});