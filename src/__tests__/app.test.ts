import request from 'supertest';
import app from '../app';

describe('App', () => {
  it('should return API info for root endpoint', async () => {
    const response = await request(app).get('/api/v1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });

  it('should return 404 for non-existent route', async () => {
    const response = await request(app).get('/non-existent');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });
}); 