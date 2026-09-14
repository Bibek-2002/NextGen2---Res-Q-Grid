const mongoose = require('mongoose');

const localKnowledgeSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ['Road', 'Bridge', 'Shelter', 'BoatLaunchPoint', 'WaterDepth', 'VillageContact',
            'LocalLanguage', 'MedicalResource', 'LivestockArea', 'DangerZone'],
        required: true
    },
    location: {
        lat: Number,
        lng: Number
    },
    village: String,
    description: { type: String, required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('LocalKnowledge', localKnowledgeSchema);
