const { Profile } = require('../model.js');

const getProfile = async (req, res, next) => {
    let profile_id = req.query.profile_id ?? req.body.profile_id;
    const profile = await Profile.findOne({ where: { id: profile_id } });
    if (!profile) { return res.status(401).end(); }
    req.profile = profile;
    next();
}
module.exports = { getProfile }