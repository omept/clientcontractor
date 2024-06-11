const app = require('../app');
const { Job, Profile, Contract, sequelize } = require('../model.js');
const { Op, QueryTypes } = require('sequelize');
const { ContractStatus } = require('./contractRepository');


class AdminRepository {

    async bestProfession(option) {
        const { startDate, endDate } = option;

        let profileProfessionGrp = await Profile.findAll({
            attributes: [
                'profession',
                [sequelize.fn('SUM', sequelize.col('Client->Jobs.price')), 'price']
            ],
            include: [
                {
                    model: Contract,
                    as: 'Client',
                    attributes: [],
                    include: [
                        {
                            model: Job,
                            as: 'Jobs',
                            attributes: [],
                            where: {
                                paymentDate: {
                                    [Op.between]: [startDate, endDate]
                                }
                            }
                        }
                    ]
                }
            ],
            group: ['Profile.profession']
        });

        profileProfessionGrp = profileProfessionGrp.map(ele => ele.dataValues);
        console.log({ profileProfessionGrp });
        return [];
    }



}

module.exports = AdminRepository;
