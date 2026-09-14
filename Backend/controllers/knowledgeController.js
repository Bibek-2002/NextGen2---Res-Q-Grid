const LocalKnowledge = require('../models/LocalKnowledge');

async function addKnowledge(req, res) {
    try {
        const { category, description, location, village } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'category and description are required' });
        }

        const entry = await LocalKnowledge.create({
            category, description, location, village,
            submittedBy: req.user.id
        });

        res.status(201).json({ message: 'Knowledge entry added', entry });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getKnowledge(req, res) {
    try {
        const { village, category } = req.query;
        const filter = {};
        if (village) filter.village = village;
        if (category) filter.category = category;

        const entries = await LocalKnowledge.find(filter).sort({ lastUpdated: -1 });
        res.status(200).json(entries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { addKnowledge, getKnowledge };
