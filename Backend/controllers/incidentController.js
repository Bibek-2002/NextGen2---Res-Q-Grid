const Incident = require('../models/Incident');

async function getIncidents(req, res) {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;

        const incidents = await Incident.find(filter)
            .populate('relatedReports')
            .sort({ priority: -1, updatedAt: -1 });

        res.status(200).json(incidents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getIncidentById(req, res) {
    try {
        const incident = await Incident.findById(req.params.id).populate('relatedReports');
        if (!incident) return res.status(404).json({ message: 'Incident not found' });
        res.status(200).json(incident);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { getIncidents, getIncidentById };
