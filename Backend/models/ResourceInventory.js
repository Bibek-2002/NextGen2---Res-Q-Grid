const mongoose = require('mongoose');

const resourceInventorySchema = new mongoose.Schema({
    ownerType: { type: String, enum: ['Hospital', 'NGO', 'Camp'], required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resourceType: { type: String, required: true }, // e.g. Beds, Food, Water, Blankets, Oxygen
    quantity: { type: Number, default: 0 },
    unit: String
}, { timestamps: true });

module.exports = mongoose.model('ResourceInventory', resourceInventorySchema);
