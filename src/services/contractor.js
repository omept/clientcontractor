const app = require('./app');

class Contractor {

    async fetchContracts(options) {
        let config = {
            id: options.id ?? null,
            clientId: options.clientId ?? null,
            contractorId: options.contractorId ?? null,
            page: options.page ?? 1,
            limit: options.limit ?? 10,
        };

        const { Contract } = app.get('models');

        const contract = await Contract.findOne({ where: { id } });
        return [contract];
    }
}

module.exports = Contractor;