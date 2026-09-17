require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const EvidenceReport = require('./models/EvidenceReport');
const Incident = require('./models/Incident');
const LocalKnowledge = require('./models/LocalKnowledge');
const ResourceInventory = require('./models/ResourceInventory');


async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear old data
    await User.deleteMany({});
    await EvidenceReport.deleteMany({});
    await Incident.deleteMany({});
    await LocalKnowledge.deleteMany({});
    await ResourceInventory.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Users
    const citizen = await User.create({
        name: 'Bibek Gorai', phone: '9000000001', password: hashedPassword,
        role: 'Citizen', location: { lat: 22.9868, lng: 87.8550 }
    });
    const volunteer = await User.create({
        name: 'Ravi Volunteer', phone: '9000000002', password: hashedPassword,
        role: 'Volunteer', location: { lat: 22.9870, lng: 87.8560 }
    });
    const hospital = await User.create({
        name: 'Balarampur Hospital', phone: '9000000003', password: hashedPassword,
        role: 'Hospital', location: { lat: 22.9880, lng: 87.8570 }
    });
    const rescueTeam = await User.create({
        name: 'NDRF Team 1', phone: '9000000004', password: hashedPassword,
        role: 'RescueTeam', location: { lat: 22.9860, lng: 87.8540 }
    });

    // Incident
    const incident = await Incident.create({
        location: { lat: 22.9868, lng: 87.8550 },
        village: 'Balarampur',
        estimatedVictims: 20,
        confidenceScore: 0.85,
        needs: ['Rescue', 'Food'],
        status: 'Open',
        priority: 'High',
        timeline: [
            { actor: 'Citizen', action: 'Reported need for rescue' },
            { actor: 'Volunteer', action: 'Reached location' }
        ]
    });

    // Evidence reports
    await EvidenceReport.create([
        {
            source: 'Citizen', submittedBy: citizen._id,
            location: { lat: 22.9868, lng: 87.8550 },
            evidenceType: 'Rescue', description: 'Stuck on rooftop',
            status: 'Reconciled', linkedIncident: incident._id
        },
        {
            source: 'Volunteer', submittedBy: volunteer._id,
            location: { lat: 22.9870, lng: 87.8560 },
            evidenceType: 'Rescue', description: 'Confirmed victims present',
            status: 'Reconciled', linkedIncident: incident._id
        }
    ]);

    // Local knowledge
    await LocalKnowledge.create([
        {
            category: 'Bridge', village: 'Balarampur',
            description: 'Old bridge near river is weak, avoid heavy vehicles',
            submittedBy: volunteer._id, location: { lat: 22.9865, lng: 87.8545 }
        },
        {
            category: 'Shelter', village: 'Balarampur',
            description: 'School building is safe and used as shelter',
            submittedBy: volunteer._id, location: { lat: 22.9872, lng: 87.8555 }
        }
    ]);

    // Resource inventory
    await ResourceInventory.create([
        { ownerType: 'Hospital', ownerId: hospital._id, resourceType: 'Beds', quantity: 15, unit: 'beds' },
        { ownerType: 'Hospital', ownerId: hospital._id, resourceType: 'Oxygen', quantity: 30, unit: 'cylinders' }
    ]);

    console.log('Seeding done');
    await mongoose.disconnect();
}

seed().catch(async (err) => {
    console.error('Seeding failed:', err.message);
    await mongoose.disconnect();
    process.exit(1);
});
