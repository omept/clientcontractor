const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model')
const { getProfile } = require('./middleware/getProfile')
const ContractRepository = require('./services/contractRepository')
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
 * @returns contract by id
 */
app.get('/contracts/', getProfile, async (req, res) => {
    const option = {
        profileId: req.query.profile_id
    };
    let contracts = await (new ContractRepository()).fetchContracts(option);
    res.json(contracts);

})
module.exports = app;
