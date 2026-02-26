const path = require('path');
const fs = require('fs');

/**
 * Reads all project.json files from data/projects/ and returns them as an array.
 */
function readProjects() {
  const projectsDir = path.join(__dirname, '../../data/projects');

  if (!fs.existsSync(projectsDir)) {
    return [];
  }

  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const projectFile = path.join(projectsDir, entry.name, 'project.json');
    if (!fs.existsSync(projectFile)) continue;

    try {
      const raw = fs.readFileSync(projectFile, 'utf-8');
      const project = JSON.parse(raw);
      projects.push(project);
    } catch (err) {
      console.error(`Failed to read project ${entry.name}:`, err.message);
    }
  }

  return projects;
}

module.exports = { readProjects };
