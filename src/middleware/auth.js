/**
 * Write auth middleware.
 * Guards POST, PUT, DELETE endpoints.
 * Expects the admin API key in the `x-api-key` header.
 */
function requireAuth(req, res, next) {
    const provided = req.headers['x-api-key'];
    const expected = process.env.WRITE_API_KEY;

    if (!expected) {
        console.error('WRITE_API_KEY is not set in environment');
        return res.status(500).json({ error: 'Server misconfiguration: WRITE_API_KEY not set' });
    }

    if (!provided || provided !== expected) {
        return res.status(401).json({ error: 'Unauthorized. Valid x-api-key header is required.' });
    }

    next();
}

module.exports = { requireAuth };
