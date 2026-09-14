const mongoose = require('mongoose');

const evidenceReportSchema = new mongoose.Schema({
    source: { type: String, enum: ['Citizen', 'Volunteer', 'Hospital', 'NGO', 'Camp', 'Drone'], required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    location: {
        lat: Number,
        lng: Number
    },
    timestamp: { type: Date, default: Date.now },
    evidenceType: { type: String, enum: ['Rescue', 'Food', 'Water', 'Medicine', 'Medical'], required: true },
    description: String,
    mediaURL: String,
    status: { type: String, enum: ['Pending', 'Reconciled', 'Duplicate'], default: 'Pending' },
    linkedIncident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' }
}, { timestamps: true });

module.exports = mongoose.model('EvidenceReport', evidenceReportSchema);
