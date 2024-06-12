const { Job, Profile, Contract, sequelize } = require('../model.js');
const { Op } = require('sequelize');
const { ContractStatus } = require('./contractRepository');


class AdminRepository {

    async bestProfession(option) {
        const { startDate, endDate } = option;
        let profileProfessionGrp = await Profile.findAll({
            attributes: ["profession", [sequelize.fn('SUM', sequelize.col('Contractor->Jobs.price')), 'jobPrice']],
            where: {
                type: "contractor"
            },
            include: {
                model: Contract,
                as: "Contractor",
                where: {
                    status: {
                        [Op.not]: "terminated"
                    }
                },
                include: {
                    model: Job,
                    where: {
                        paymentDate: {
                            [Op.between]: [new Date(startDate), new Date(endDate)]
                        },
                        paid: true
                    }
                }
            },
            group: ["Profile.profession"],
            order: [
                ['jobPrice', 'DESC']
            ]
        });

        profileProfessionGrp = profileProfessionGrp.map(ele => {
            let { profession, jobPrice } = ele.dataValues;
            return { profession, price: jobPrice };
        });

        if (profileProfessionGrp.length <= 0) {
            return [];
        }
        return profileProfessionGrp;
    }

    async bestClients(option) {
        const { startDate, endDate, limit } = option;
        let profileClientGrp = await Profile.findAll({
            attributes: ["id", "firstName", "lastName", "profession", [sequelize.fn('SUM', sequelize.col('Client->Jobs.price')), 'paidTotal']],
            where: {
                type: "client"
            },
            include: {
                model: Contract,
                as: "Client",
                where: {
                    status: {
                        [Op.not]: "terminated"
                    }
                },
                include: {
                    model: Job,
                    where: {
                        paymentDate: {
                            [Op.between]: [new Date(startDate), new Date(endDate)]
                        },
                        paid: true
                    }
                }
            },
            group: ["Profile.id"],
            order: [
                ['paidTotal', 'DESC']
            ],
        });

        if (profileClientGrp.length <= 0) {
            return [];
        }
        let data = [];
        let i = 0;
        let useWhole = false;
        const profileClientGrpLength = profileClientGrp.length;
        profileClientGrp = profileClientGrp.map(ele => {
            delete ele.dataValues.Client;
            if (i < limit && profileClientGrpLength > limit) {
                data.push(ele.dataValues)
            } else if (limit >= profileClientGrpLength) {
                useWhole = true;
            }

            i++;
            return ele.dataValues;
        });
        if (useWhole) {
            return profileClientGrp;
        }
        return data;
    }



}

module.exports = AdminRepository;
