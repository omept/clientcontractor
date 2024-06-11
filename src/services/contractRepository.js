const app = require('../app');
const { Op } = require('sequelize');
const { Contract } = require('../model.js');

const Status = {
    NEW: 'new',
    IN_PROGRESS: 'in_progress',
    TERMINATED: 'terminated'
};

class ContractRepository {

    async fetchContract(id, profileId) {
        let contract = await Contract.findOne({
            where: {
                id,
                [Op.or]: [
                    { ClientId: profileId },
                    { ContractorId: profileId }
                ]
            }
        });
        return contract.dataValues ?? null;
    }

    async fetchContracts(options) {
        let config = {
            profileId: options.profileId ?? null,
            page: options.page ?? 1,
            limit: options.limit ?? 10,
        };


        const page = config.page; // Page number
        const pageSize = config.limit; // Number of records per page
        // Calculate the offset based on pagination parameters
        const offset = (page - 1) * pageSize;

        let contracts = await Contract.findAll({
            where: {
                [Op.or]: [
                    { ClientId: config.profileId },
                    { ContractorId: config.profileId }
                ],
                status: {
                    [Op.ne]: Status.TERMINATED
                }
            },
            offset, // Offset for pagination
            limit: pageSize // Limit for pagination
        });
        if (contracts.length <= 0) {
            return [];
        }
        contracts = contracts.map(contract => contract.dataValues);
        return contracts;
    }

    async fetchUnpaid(options) {
        let config = {
            profileId: options.profileId ?? null,
            page: options.page ?? 1,
            limit: options.limit ?? 10,
        };


        const page = config.page; // Page number
        const pageSize = config.limit; // Number of records per page
        // Calculate the offset based on pagination parameters
        const offset = (page - 1) * pageSize;

        let contracts = await Contract.findAll({
            where: {
                [Op.or]: [
                    { ClientId: config.profileId },
                    { ContractorId: config.profileId }
                ],
                status: {
                    [Op.ne]: Status.TERMINATED
                }
            },
            offset, // Offset for pagination
            limit: pageSize // Limit for pagination
        });
        if (contracts.length <= 0) {
            return [];
        }
        contracts = contracts.map(contract => contract.dataValues);
        return contracts;
    }

}

module.exports = ContractRepository;
