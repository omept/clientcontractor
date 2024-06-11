const request = require('supertest');
const app = require('../src/app');


describe('Admin API tests', () => {
  it('GET /admin/best-profession?start=<date>&end=<date> - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.', async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const startDate = `2008-${month}-${day}`;
    const endDate = `${year}-${month}-${(parseInt(day) + 3)}`;
    let res = await request(app).get(`/admin/best-profession?start=${startDate}&end=${endDate}`);

    expect(res.statusCode).toEqual(200);
  });

});