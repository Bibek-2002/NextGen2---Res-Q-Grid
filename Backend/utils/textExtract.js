function extractVictimCount(text) {
    if (!text) return null;
    const match = text.match(/(\d+)\s*(people|persons|victims|villagers)/i);
    return match ? parseInt(match[1], 10) : null;
}

module.exports = { extractVictimCount };
