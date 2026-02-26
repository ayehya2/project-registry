require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { identifyConsumer } = require('./middleware/consumer');
const projectsRouter = require('./routes/projects');
const metaRouter = require('./routes/meta');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Core middleware ──────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─── Static image serving ─────────────────────────────────────────────────────
//
// Images live at:  data/projects/:projectId/images/:filename
// Served at:       /images/:projectId/:filename
//
// Express can't glob-serve from nested dirs, so we mount one static
// handler per project folder dynamically at startup.

function mountImageRoutes() {
    const projectsDir = path.join(__dirname, '../data/projects');
    if (!fs.existsSync(projectsDir)) return;

    const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const imagesDir = path.join(projectsDir, entry.name, 'images');
        if (fs.existsSync(imagesDir)) {
            app.use(`/images/${entry.name}`, express.static(imagesDir));
        }
    }
}

mountImageRoutes();

// ─── Consumer identification (runs on all routes) ─────────────────────────────

app.use(identifyConsumer);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/projects', projectsRouter);
app.use('/', metaRouter);

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
    res.json({
        name: 'project-registry',
        version: '1.0.0',
        built_by: ['ayehya2', 'sankeer28'],
        endpoints: [
            'GET  /projects',
            'GET  /projects/:id',
            'POST /projects',
            'PUT  /projects/:id',
            'DELETE /projects/:id',
            'GET  /categories',
            'GET  /tags',
        ],
    });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Error handler ────────────────────────────────────────────────────────────

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`project-registry running on http://localhost:${PORT}`);
});

module.exports = app;
