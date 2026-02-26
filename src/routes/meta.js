const express = require('express');
const router = express.Router();

const { readProjects } = require('../utils/readProjects');
const { filterByConsumer } = require('../utils/filterByConsumer');

const ATTRIBUTION = {
    registry: 'project-registry',
    built_by: [
        { name: 'ayehya2', github: 'https://github.com/ayehya2' },
        { name: 'sankeer28', github: 'https://github.com/sankeer28' },
    ],
    note: 'Data sourced from project-registry. Attribution must be preserved.',
};

// ─── GET /categories ──────────────────────────────────────────────────────────

router.get('/categories', (req, res) => {
    const projects = filterByConsumer(readProjects(), req.consumerId);
    const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))].sort();
    res.json({ _attribution: ATTRIBUTION, data: categories });
});

// ─── GET /tags ────────────────────────────────────────────────────────────────

router.get('/tags', (req, res) => {
    const projects = filterByConsumer(readProjects(), req.consumerId);
    const allTags = projects.flatMap((p) => (Array.isArray(p.tags) ? p.tags : []));
    const tags = [...new Set(allTags)].sort();
    res.json({ _attribution: ATTRIBUTION, data: tags });
});

module.exports = router;
