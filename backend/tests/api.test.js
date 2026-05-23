const request = require('supertest');
const app = require('../index');

describe('DeployEase API', () => {
  it('GET /api/deployments should return a list of deployments', async () => {
    const res = await request(app).get('/api/deployments');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('ok');
  });

  it('POST /api/deploy/:id should trigger a deployment', async () => {
    const res = await request(app)
      .post('/api/deploy/1')
      .set('x-user-role', 'operator');
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Deployment started');
    expect(res.body.deployment.status).toEqual('deploying');
  });

  it('POST /api/deployments should create a new deployment', async () => {
    const newService = {
      name: 'Test Billing Service',
      version: 'v2.1.0',
      status: 'online',
      initialLog: 'Db connection initialized.'
    };
    const res = await request(app)
      .post('/api/deployments')
      .set('x-user-role', 'operator')
      .send(newService);
      
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Service created successfully');
    expect(res.body.deployment.name).toEqual('Test Billing Service');
    expect(res.body.deployment.version).toEqual('v2.1.0');
    expect(res.body.deployment.status).toEqual('online');
  });

  it('POST /api/deployments without operator role should be forbidden', async () => {
    const res = await request(app)
      .post('/api/deployments')
      .send({ name: 'Test Gateway' });
      
    expect(res.statusCode).toEqual(403);
  });
});
