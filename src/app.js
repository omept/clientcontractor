const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const { validateDate } = require('./utils/validateDate')
const { ContractRepository } = require('./services/contractRepository')
const AdminRepository = require('./services/adminRepository')
const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

/**
 * @returns contract by id
 */
app.get('/contracts/:id', getProfile, async (req, res) => {
    const option = {
        id: req.params.id,
        profileId: req.query.profile_id
    };
    let contract = await (new ContractRepository()).fetchContract(option.id, option.profileId);
    if (!contract) return res.status(404).end();
    res.json(contract);

})

/**
 * @returns contracts
 */
app.get('/contracts/', getProfile, async (req, res) => {
    const option = {
        profileId: req.query.profile_id
    };
    let contracts = await (new ContractRepository()).fetchContracts(option);
    res.json(contracts);

});

/**
 * @returns jobs
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {
    const option = {
        profileId: req.query.profile_id
    };
    let contracts = await (new ContractRepository()).fetchUnpaidJobs(option);
    res.json(contracts);

})

/**
 * @returns object
 */
app.post('/jobs/:job_id/pay', getProfile, async (req, res) => {
    const option = {
        profileId: req.query.profile_id ?? req.body.profile_id,
        jobId: req.params.job_id,
    };
    let successful = await (new ContractRepository()).payJob(option);
    res.json({ payment: successful ? "successful" : "unsuccessful" });

})

/**
 * @returns object
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res) => {
    const option = {
        profileId: req.query.profile_id ?? req.body.profile_id,
        amount: req.query.amount ?? req.body.amount,
        userId: req.params.userId,
        profile: req.profile,
    };
    let successful = await (new ContractRepository()).deposite(option);
    res.json({ payment: successful ? "successful" : "unsuccessful" });

})

/**
 * @returns object
 */
app.get('/admin/best-profession', async (req, res) => {
    // validate start and end date
    const startDate = req.query.start;
    const endDate = req.query.end;

    if (!validateDate(startDate) || !validateDate(endDate)) {
        console.log("invalid start or end date", { startDate, endDate });
        return res.status(401).end();
    }

    const option = {
        startDate,
        endDate
    };


    res.json(await (new AdminRepository()).bestProfession(option));

})
module.exports = app;
