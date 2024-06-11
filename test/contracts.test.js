const request = require('supertest');
const app = require('../src/app');
const ContractRepository = require('../src/services/contractRepository');


describe('API tests', () => {
  it('GET /contracts/:id should return the contract only if it belongs to the profile calling', async () => {
    let profileId = 1;
    const res = await request(app).get(`/contracts/2?profile_id=${profileId}`);
    let contractorId = res.body.ContractorId
    let clientId = res.body.ClientId
    expect(res.statusCode).toEqual(200);
    expect(true).toEqual([contractorId, clientId].includes(profileId));
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
