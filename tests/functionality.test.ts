import { describe, it, expect, vi } from 'vitest';
import { appRouter } from '../server/routers';
import { PRODUCTS } from '../server/products';

// Mocking database and external services
vi.mock('../server/db', () => ({
  createTributePage: vi.fn((data) => Promise.resolve({ ...data, id: 1 })),
  users: {
    findFirst: vi.fn(() => Promise.resolve({ id: 1, firebaseUid: 'test-uid', email: 'test@example.com', name: 'Test User' }))
  }
}));

vi.mock('../server/_core/firebase', () => ({
  firebaseAdmin: {
    auth: () => ({
      verifyIdToken: vi.fn(() => Promise.resolve({ uid: 'test-uid', email: 'test@example.com', name: 'Test User' }))
    })
  }
}));

describe('Critical Functionality Tests', () => {

  it('should create a tribute page with correct data', async () => {
    const caller = appRouter.createCaller({ user: { id: 1 } } as any);
    const input = {
      partner1Name: 'John',
      partner2Name: 'Doe',
      relationshipStartDate: new Date().toISOString(),
      photoUrls: ['url1', 'url2', 'url3'],
      musicYoutubeUrl: 'youtube.com/music',
      planType: 'essential' as const,
    };

    const result = await caller.tribute.create(input);

    expect(result.partner1Name).toBe(input.partner1Name);
    expect(result.partner2Name).toBe(input.partner2Name);
    expect(result.planType).toBe('essential');
  });

  it('should respect photo limits for Essential plan', () => {
    const plan = PRODUCTS.essential;
    const photos = ['1', '2', '3', '4', '5'];
    const limitedPhotos = photos.slice(0, plan.features.maxPhotos);
    expect(limitedPhotos.length).toBe(3);
  });

  it('should respect photo limits for Premium plan', () => {
    const plan = PRODUCTS.premium;
    const photos = ['1', '2', '3', '4', '5', '6'];
    const limitedPhotos = photos.slice(0, plan.features.maxPhotos);
    expect(limitedPhotos.length).toBe(5);
  });

  it('should sync user and return user object', async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.auth.syncUser({ idToken: 'test-token' });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('firebaseUid');
    expect(result.email).toBe('test@example.com');
  });

});
