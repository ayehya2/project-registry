const path = require('path');
const fs = require('fs');

let consumers = null;

function loadConsumers() {
    if (consumers) return consumers;
    const file = path.join(__dirname, '../../data/consumers.json');
    try {
        consumers = JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
        consumers = [];
    }
    return consumers;
}

/**
 * Consumer identity middleware.
 * Reads `x-consumer-id` header, looks it up in consumers.json,
 * and attaches the consumer object (or null) to req.consumer.
 *
 * Does NOT block requests — visibility filtering is handled downstream
 * in filterByConsumer.js. This middleware only identifies the caller.
 */
function identifyConsumer(req, res, next) {
    const consumerId = req.headers['x-consumer-id'] || null;
    req.consumerId = null;

    if (consumerId) {
        const all = loadConsumers();
        const match = all.find((c) => c.id === consumerId && c.active);
        req.consumerId = match ? match.id : null;
    }

    next();
}

module.exports = { identifyConsumer };
