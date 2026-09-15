const EvidenceReport = require('../models/EvidenceReport');
const { reconcileNewReport } = require('../services/caderfEngine');

async function submitSOS(req, res) {
    try {
        const { location, evidenceType, description, mediaURL } = req.body;

        if (!location || !evidenceType) {
            return res.status(400).json({ message: 'location and evidenceType are required' });
        }

        let report = await EvidenceReport.create({
            source: req.user.role,
            submittedBy: req.user.id,
            location,
            evidenceType,
            description,
            mediaURL,
            status: 'Pending'
        });

        const incident = await reconcileNewReport(report._id);
        report = await EvidenceReport.findById(report._id);

        res.status(201).json({ message: 'SOS submitted', report, incident });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getMyReports(req, res) {
    try {
        const reports = await EvidenceReport.find({ submittedBy: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { submitSOS, getMyReports };
