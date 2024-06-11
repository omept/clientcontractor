const app = require('../app');
const { Op } = require('sequelize');
const { Contract, Job, Profile, sequelize } = require('../model.js');

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

    async fetchUnpaidJobs(options) {
        let config = {
            profileId: options.profileId ?? null,
            page: options.page ?? 1,
            limit: options.limit ?? 10,
        };


        const page = config.page; // Page number
        const pageSize = config.limit; // Number of records per page
        // Calculate the offset based on pagination parameters
        const offset = (page - 1) * pageSize;

        let jobs = await Job.findAll({
            include: {
                model: Contract,
                where: {
                    [Op.or]: [
                        { ClientId: config.profileId },
                        { ContractorId: config.profileId }
                    ],
                    status: {
                        [Op.ne]: Status.TERMINATED
                    },
                },
            },
            offset, // Offset for pagination
            limit: pageSize // Limit for pagination
        });
        if (jobs.length <= 0) {
            return [];
        }
        jobs = jobs.map(job => job.dataValues);
        return jobs;
    }

    async payJob(options) {
        let config = {
            jobId: options.jobId ?? null,
            profileId: options.profileId ?? null,
        };

        // get the job
        let job = await Job.findOne({
            where: {
                id: config.jobId,
            },
            include: {
                model: Contract,
                where: {
                    ClientId: config.profileId
                },
                status: {
                    [Op.ne]: Status.TERMINATED
                },
                include: [
                    {
                        model: Profile,
                        as: 'Client',
                        where: {
                            id: config.profileId,
                        },
                    },
                    {
                        model: Profile,
                        as: 'Contractor',
                    }],
            }
        });

        if (!job) { console.log('invalid job'); return false; }

        let contract = job.Contract;
        if (!contract) { console.log('invalid contract'); return false; }

        let client = contract.Client;
        if (!client) { console.log('invalid client'); return false; }

        let contractor = contract.Contractor;
        if (!contractor) { console.log('invalid contractor'); return false; }

        // get the client ballance
        let bal = client.balance;
        let jobAmount = job.price;

        if (bal < jobAmount) {
            console.log('insuficient balance, can\'t pay');
            return false;
        }

        // perform debit and set job to paid
        const transaction = await sequelize.transaction();
        try {
            // debit client
            await Profile.update({ balance: bal - jobAmount },
                {
                    where: {
                        id: client.id,
                    }, transaction
                });

            // top up contractor
            await Profile.update({ balance: contractor.balance + jobAmount },
                {
                    where: {
                        id: contractor.id,
                    }, transaction
                });
            // update job
            await Job.update({ paid: true },
                {
                    where: {
                        id: config.jobId,
                    },
                    transaction
                });

            // Commit the transaction
            await transaction.commit();
            return true;

        } catch (error) {
            // Roll back the transaction if any operation fails
            await transaction.rollback();
            console.error('Failed to pay:', error);
            return false;
        }

    }

}

module.exports = ContractRepository;
