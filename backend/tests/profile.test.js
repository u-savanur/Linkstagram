const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const { LinkedinProfile } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset DB
});

afterAll(async () => {
  await sequelize.close();
});

describe('Profile API', () => {
  it('GET /health should return OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('OK');
  });

  it('POST /api/scrape-profile should fail without url/html', async () => {
    const res = await request(app).post('/api/scrape-profile').send({});
    expect(res.statusCode).toEqual(400);
  });

  it('POST /api/scrape-profile should handle unsupported URLs', async () => {
    const res = await request(app).post('/api/scrape-profile').send({
      url: 'https://example.com',
      html: '<html></html>'
    });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Unsupported platform');
  });

  it('POST /api/scrape-profile should parse mock LinkedIn HTML', async () => {
    const mockHtml = `
      <html>
        <head>
          <title>John Doe | LinkedIn</title>
          <meta property="og:title" content="John Doe">
          <meta property="og:url" content="https://www.linkedin.com/in/johndoe">
          <meta name="description" content="Software Engineer - San Francisco">
        </head>
        <body>
          <h1>John Doe</h1>
          <span class="text-body-small">San Francisco, CA</span>
          <div>500+ connections</div>
        </body>
      </html>
    `;

    const res = await request(app).post('/api/scrape-profile').send({
      url: 'https://www.linkedin.com/in/johndoe',
      html: mockHtml
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('success');
    expect(res.body.platform).toEqual('linkedin');
    expect(res.body.data.name).toEqual('John Doe');
    expect(res.body.data.location).toEqual('San Francisco, CA');
    
    // Verify DB storage
    const stored = await LinkedinProfile.findOne({ where: { url: 'https://www.linkedin.com/in/johndoe' } });
    expect(stored).toBeTruthy();
    expect(stored.name).toEqual('John Doe');
  });
});
