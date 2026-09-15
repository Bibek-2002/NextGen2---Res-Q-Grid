const stringSimilarity = require('string-similarity');
const EvidenceReport = require('../models/EvidenceReport');
const Incident = require('../models/Incident');
const { haversineDistance } = require('../utils/geo');
const { extractVictimCount } = require('../utils/textExtract');

const RADIUS_CONFIG = { Medical: 150, Rescue: 250, Medicine: 300, Water: 400, Food: 500 };
const TIME_WINDOW_MS = 48 * 60 * 60 * 1000;
const DUPLICATE_SIM_THRESHOLD = 0.55;
const SUPPORT_SIM_THRESHOLD = 0.2;

function getRadius(evidenceType) {
    return RADIUS_CONFIG[evidenceType] || 300;
}

function textSim(a = '', b = '') {
    if (!a || !b) return 0;
    return stringSimilarity.compareTwoStrings(a.toLowerCase(), b.toLowerCase());
}

function detectRelationship(reportA, reportB) {
    const distance = haversineDistance(reportA.location, reportB.location);
    const radius = getRadius(reportA.evidenceType);
    const timeDiff = Math.abs(new Date(reportA.timestamp) - new Date(reportB.timestamp));
    const sameType = reportA.evidenceType === reportB.evidenceType;
    const sim = textSim(reportA.description, reportB.description);

    if (distance > radius * 2 || timeDiff > TIME_WINDOW_MS) {
        return { type: 'Unrelated', distance, sim };
    }

    const countA = extractVictimCount(reportA.description);
    const countB = extractVictimCount(reportB.description);
    if (countA != null && countB != null) {
        const diffRatio = Math.abs(countA - countB) / Math.max(countA, countB);
        if (diffRatio > 0.5 && distance < radius) {
            return { type: 'Conflicts', distance, sim, countA, countB };
        }
    }

    if (sameType && distance <= radius && sim >= DUPLICATE_SIM_THRESHOLD) {
        return { type: 'Duplicate', distance, sim };
    }

    if (distance <= radius * 1.5 && sim >= SUPPORT_SIM_THRESHOLD) {
        return { type: 'Supports', distance, sim };
    }

    if (/resolved|rescued|safe now|evacuated|reached hospital/i.test(reportB.description || '')) {
        return { type: 'Completes', distance, sim };
    }

    return { type: 'Unrelated', distance, sim };
}

function computeConfidence(reports) {
    const sourceTypes = new Set(reports.map((report) => report.source));
    let score = Math.min(sourceTypes.size * 0.2, 0.8);
    score += Math.min(reports.length, 5) * 0.04;
    const hasConflict = reports.some((report) => report.status === 'Conflicting');
    if (hasConflict) score *= 0.7;
    return Math.min(Math.round(score * 100) / 100, 1);
}

async function reconcileNewReport(reportId) {
    const newReport = await EvidenceReport.findById(reportId);
    if (!newReport) return null;

    const since = new Date(Date.now() - TIME_WINDOW_MS);
    const candidates = await EvidenceReport.find({
        _id: { $ne: newReport._id },
        evidenceType: newReport.evidenceType,
        createdAt: { $gte: since }
    });

    let bestMatch = null;
    let bestRelation = null;
    let conflictMatch = null;
    let hasConflict = false;

    for (const candidate of candidates) {
        const relation = detectRelationship(newReport, candidate);

        if (relation.type === 'Conflicts') {
            hasConflict = true;
            if (!conflictMatch && candidate.linkedIncident) {
                conflictMatch = candidate;
            }
        }

        if (relation.type === 'Duplicate' || relation.type === 'Supports') {
            if (!bestMatch || relation.sim > bestRelation.sim) {
                bestMatch = candidate;
                bestRelation = relation;
            }
        }
    }

    const linkCandidate = bestMatch || conflictMatch;

    let incident = null;
    if (linkCandidate && linkCandidate.linkedIncident) {
        incident = await Incident.findById(linkCandidate.linkedIncident);
    }

    function finalStatus() {
        if (hasConflict) return 'Conflicting';
        if (bestRelation && bestRelation.type === 'Duplicate') return 'Duplicate';
        return 'Reconciled';
    }

    if (incident) {
        newReport.status = finalStatus();
        newReport.linkedIncident = incident._id;
        await newReport.save();

        if (!incident.relatedReports.some((id) => id.equals(newReport._id))) {
            incident.relatedReports.push(newReport._id);
        }

        const count = extractVictimCount(newReport.description);
        if (count && !hasConflict && (!incident.estimatedVictims || count > incident.estimatedVictims)) {
            incident.estimatedVictims = count;
        }

        if (!incident.needs.includes(newReport.evidenceType)) {
            incident.needs.push(newReport.evidenceType);
        }

        incident.timeline.push({
            actor: newReport.source,
            action: hasConflict
                ? `Conflicting evidence added (reported count differs): "${newReport.description || newReport.evidenceType}"`
                : `${bestRelation ? bestRelation.type : 'Reconciled'} evidence added: "${newReport.description || newReport.evidenceType}"`
        });

        const allReports = await EvidenceReport.find({ linkedIncident: incident._id });
        incident.confidenceScore = computeConfidence(allReports);

        await incident.save();
    } else {
        incident = await Incident.create({
            location: newReport.location,
            estimatedVictims: extractVictimCount(newReport.description) || undefined,
            needs: [newReport.evidenceType],
            status: 'Open',
            priority: ['Medical', 'Rescue'].includes(newReport.evidenceType) ? 'High' : 'Medium',
            timeline: [{ actor: newReport.source, action: `Incident created from report: "${newReport.description || newReport.evidenceType}"` }],
            relatedReports: [newReport._id]
        });

        incident.confidenceScore = computeConfidence([newReport]);
        await incident.save();

        newReport.status = hasConflict ? 'Conflicting' : 'Reconciled';
        newReport.linkedIncident = incident._id;
        await newReport.save();
    }

    return incident;
}

module.exports = { reconcileNewReport, detectRelationship };
