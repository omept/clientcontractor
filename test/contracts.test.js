const request = require('supertest');
const app = require('../src/app');
const Seeder = require('./dbUtil');
const ContractRepository = require('../src/services/contractRepository');
const { Profile, Job } = require('../src/model');

beforeAll(async () => {
  await Seeder();
});


describe('API tests', () => {
  it('GET /contracts/:id should return the contract only if it belongs to the profile calling', async () => {
    let profileId = 1;
    const res = await request(app).get(`/contracts/2?profile_id=${profileId}`);
    let contractorId = res.body.ContractorId;
    let clientId = res.body.ClientId;
    expect(res.statusCode).toEqual(200);
    expect(true).toEqual([contractorId, clientId].includes(profileId));
  });

  it('GET /contracts - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.', async () => {
    let terminated = "terminated";
    let profileId = 1;
    const res = await request(app).get(`/contracts?profile_id=${profileId}`);
    expect(res.statusCode).toEqual(200);
    const body = res.body;
    if (body.length > 0) {
      let contractorIds = [];
      let clientIds = [];
      isTerminated = true;
      body.forEach(ele => {
        isTerminated = ele.status == terminated;
        clientIds.push(ele.ClientId);
        contractorIds.push(ele.ContractorId);
      });
      expect(isTerminated).toEqual(false);
      expect(true).toEqual([...contractorIds, ...clientIds].includes(profileId));
    }
  });

  it('GET /jobs/unpaid - Get all unpaid jobs for a user (either a client or contractor), for active contracts only.', async () => {
    let terminated = "terminated";
    let profileId = 1;
    const res = await request(app).get(`/jobs/unpaid?profile_id=${profileId}`);
    expect(res.statusCode).toEqual(200);
    const body = res.body;
    if (body.length > 0) {
      let contractorIds = [];
      let clientIds = [];
      isTerminated = true;
      body.forEach(ele => {
        isTerminated = ele.Contract.status == terminated;
        clientIds.push(ele.Contract.ClientId);
        contractorIds.push(ele.Contract.ContractorId);
      });
      expect(isTerminated).toEqual(false); // active jobs are non-terminated contracts
      expect(true).toEqual([...contractorIds, ...clientIds].includes(profileId));
    }
  });

  it('POST /jobs/:job_id/pay -  Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client\'s balance to the contractor balance', async () => {
    let profileId = 1;
    let jobId = 1;
    let client = await Profile.findOne({
      where: {
        id: profileId,
        type: "client"
      }
    });
    let job = await Job.findOne({
      where: {
        id: jobId
      }
    });

    let oldBal = client.balance;
    const res = await request(app).post(`/jobs/1/pay`).send({ profile_id: profileId });
    let newClient = await client.reload();
    expect(res.statusCode).toEqual(200);
    expect(res.body.payment).toEqual("successful");
    expect(oldBal - job.price).toEqual(newClient.balance);
  });

  it('POST /balances/deposit/:userId -  Deposits money into the balance of a client, a client can\'t deposit more than 25% his total of jobs to pay. (at the deposit moment)', async () => {
    const profileId = 1;
    let client = await Profile.findOne({
      where: {
        id: profileId,
        type: "client"
      }
    });
    const topUp = 30;
    const oldBal = client.balance;
    const res = await request(app)
      .post("/balances/deposit/1")
      .send({ amount: topUp, profile_id: profileId });
    client = await client.reload();
    expect(res.statusCode).toEqual(200);
    expect(res.body.payment).toEqual("successful");
    expect(client.balance).toEqual(oldBal + topUp);
  });

});

describe('Contractor unit tests', () => {
  it('it should return the contracts of the client', async () => {
    const contract = new ContractRepository();
    let options = {
      profileId: 1,
      page: 1,
      limit: 10,
    };
    let userContracts = await contract.fetchContracts(options);
    let containsProfileId = false;
    if (userContracts.length > 0) {
      userContracts.forEach(element => {
        containsProfileId = element.ClientId == options.profileId || element.ContractorId == options.profileId;
      });
      expect(containsProfileId).toEqual(true);
    }

  });
});
