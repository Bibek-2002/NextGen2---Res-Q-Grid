const ResourceInventory = require('../models/ResourceInventory');
const LocalKnowledge = require('../models/LocalKnowledge');

// Volunteer: status update + local knowledge submission
async function volunteerUpdate(req, res) {
    try {
        const { category, description, location, village } = req.body;

        if (!category || !description) {
            return res.status(400).json({ message: 'category and description are required' });
        }

        const entry = await LocalKnowledge.create({
            category, description, location, village,
            submittedBy: req.user.id
        });

        res.status(201).json({ message: 'Volunteer update saved', entry });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Hospital: beds/doctors/blood/medicine/oxygen update
async function hospitalUpdate(req, res) {
    try {
        const { resourceType, quantity, unit } = req.body;

        if (!resourceType || quantity === undefined) {
            return res.status(400).json({ message: 'resourceType and quantity are required' });
        }

        const updated = await ResourceInventory.findOneAndUpdate(
            { ownerType: 'Hospital', ownerId: req.user.id, resourceType },
            { quantity, unit },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Hospital resource updated', updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// NGO: inventory management (food/water/blankets/generators/medicine)
async function ngoInventoryUpdate(req, res) {
    try {
        const { resourceType, quantity, unit } = req.body;

        if (!resourceType || quantity === undefined) {
            return res.status(400).json({ message: 'resourceType and quantity are required' });
        }

        const updated = await ResourceInventory.findOneAndUpdate(
            { ownerType: 'NGO', ownerId: req.user.id, resourceType },
            { quantity, unit },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'NGO inventory updated', updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Camp: capacity + resource status update
async function campStatusUpdate(req, res) {
    try {
        const { resourceType, quantity, unit } = req.body;

        if (!resourceType || quantity === undefined) {
            return res.status(400).json({ message: 'resourceType and quantity are required' });
        }

        const updated = await ResourceInventory.findOneAndUpdate(
            { ownerType: 'Camp', ownerId: req.user.id, resourceType },
            { quantity, unit },
            { new: true, upsert: true }
        );

        res.status(200).json({ message: 'Camp status updated', updated });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getAllResources(req, res) {
    try {
        const resources = await ResourceInventory.find().populate('ownerId', 'name role');
        res.status(200).json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { volunteerUpdate, hospitalUpdate, ngoInventoryUpdate, campStatusUpdate, getAllResources };
