const express = require('express');
const router = express.Router();

const { readProjects } = require('../utils/readProjects');
const { writeProject, deleteProject } = require('../utils/writeProject');
const { filterByConsumer } = require('../utils/filterByConsumer');
const { requireAuth } = require('../middleware/auth');

// ─── Attribution block injected on every response ────────────────────────────

const ATTRIBUTION = {
    registry: 'project-registry',
    built_by: [
        { name: 'ayehya2', github: 'https://github.com/ayehya2' },
        { name: 'sankeer28', github: 'https://github.com/sankeer28' },
    ],
    note: 'Data sourced from project-registry. Attribution must be preserved.',
};

function respond(res, data, status = 200) {
    return res.status(status).json({ _attribution: ATTRIBUTION, data });
}

// ─── GET /projects ────────────────────────────────────────────────────────────

router.get('/', (req, res) => {
    let projects = readProjects();

    // Apply consumer visibility filter
    projects = filterByConsumer(projects, req.consumerId);

    // Query filters
    const { category, tags, status } = req.query;

    if (category) {
        projects = projects.filter(
            (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
        );
    }

    if (tags) {
        const requestedTags = tags
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter(Boolean);
        projects = projects.filter((p) =>
            Array.isArray(p.tags) &&
            requestedTags.every((t) => p.tags.map((x) => x.toLowerCase()).includes(t))
        );
    }

    if (status) {
        projects = projects.filter(
            (p) => p.status && p.status.toLowerCase() === status.toLowerCase()
        );
    }

    respond(res, projects);
});

// ─── GET /projects/:id ────────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
    const all = readProjects();
    const project = all.find((p) => p.id === req.params.id);

    if (!project) {
        return res.status(404).json({ error: `Project "${req.params.id}" not found` });
    }

    // Check visibility for this specific project
    const visible = filterByConsumer([project], req.consumerId);

    if (visible.length === 0) {
        return res.status(404).json({ error: `Project "${req.params.id}" not found` });
    }

    respond(res, visible[0]);
});

// ─── POST /projects ───────────────────────────────────────────────────────────

router.post('/', requireAuth, (req, res) => {
    const project = req.body;

    if (!project.id) {
        return res.status(400).json({ error: 'Project must have an "id" field (slug-style)' });
    }

    if (!project.title) {
        return res.status(400).json({ error: 'Project must have a "title" field' });
    }

    const all = readProjects();
    const exists = all.find((p) => p.id === project.id);

    if (exists) {
        return res.status(409).json({ error: `Project "${project.id}" already exists. Use PUT to update.` });
    }

    // Set defaults for optional fields
    const now = new Date().toISOString().split('T')[0];
    const newProject = {
        features: [],
        status: 'planned',
        category: '',
        tags: [],
        tech_stack: [],
        live_url: '',
        github_url: '',
        demo_video_url: '',
        gallery: [],
        client: 'personal',
        duration: '',
        challenges: '',
        outcome: '',
        last_updated: now,
        visibility: { default: true, consumers: {} },
        ...project,
    };

    writeProject(newProject.id, newProject);
    respond(res, newProject, 201);
});

// ─── PUT /projects/:id ────────────────────────────────────────────────────────

router.put('/:id', requireAuth, (req, res) => {
    const all = readProjects();
    const existing = all.find((p) => p.id === req.params.id);

    if (!existing) {
        return res.status(404).json({ error: `Project "${req.params.id}" not found` });
    }

    const updated = {
        ...existing,
        ...req.body,
        id: existing.id, // ID cannot be changed via PUT
        last_updated: new Date().toISOString().split('T')[0],
    };

    writeProject(updated.id, updated);
    respond(res, updated);
});

// ─── DELETE /projects/:id ─────────────────────────────────────────────────────

router.delete('/:id', requireAuth, (req, res) => {
    const all = readProjects();
    const exists = all.find((p) => p.id === req.params.id);

    if (!exists) {
        return res.status(404).json({ error: `Project "${req.params.id}" not found` });
    }

    try {
        deleteProject(req.params.id);
        respond(res, { deleted: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
