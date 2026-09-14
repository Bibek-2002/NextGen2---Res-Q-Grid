const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    location: {
        lat: Number,
        lng: Number
    },
    village: String,
    estimatedVictims: Number,
    confidenceScore: { type: Number, default: 0 },
    needs: [{ type: String, enum: ['Rescue', 'Food', 'Water', 'Medicine', 'Medical'] }],
    status: { type: String, enum: ['Open', 'InProgress', 'Resolved'], default: 'Open' },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    timeline: [{
        timestamp: { type: Date, default: Date.now },
        actor: String,
        action: String
    }],
    relatedReports: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EvidenceReport' }]
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
