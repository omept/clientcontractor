const { expect } = require('chai');
const Contractor = require('../src/services/contractor');

describe('Contractor', function () {
    it('it should return the contracts of the client', function () {
        //
        const contractor = new Contractor();
        let options = {
            clientId: 1,
            page: 1,
            limit: 10,
        };
        let userContracts = contractor.fetchContracts(options);
        let unique = false;
        userContracts.forEach(element => {
            unique = element.ClientId == options.clientId
        });
        // gather
        expect(unique).to.be(true);
    });

    it('it should return the contracts of the contractor', function () {
        //
        const contractor = new Contractor();
        let options = {
            contractorId: 1,
            page: 1,
            limit: 10,
        };
        let userContracts = contractor.fetchContracts(options);
        let unique = false;
        userContracts.forEach(element => {
            unique = element.ContractorId == options.contractorId
        });
        // gather
        expect(unique).to.be(true);
    });

    it('GET /contract/:id should return  the contract only if it belongs to the profile calling', function () {
        const req = {
            params: { profileId: 1 }
        };
        const res = {
            json: sinon.spy()
        };

        app.get('/contracts/:id', (req, res));

        expect(res.json.calledOnce).to.be.true;
        expect(res.json.firstCall.args[0]).to.deep.equal({ message: 'Contracts' });
    });
});