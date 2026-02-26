const path = require('path');
const fs = require('fs');

/**
 * Writes a project object to data/projects/:id/project.json.
 * Creates the folder if it doesn't exist.
 * @param {string} id - The project slug ID
 * @param {object} project - The project data to write
 */
function writeProject(id, project) {
    const projectDir = path.join(__dirname, '../../data/projects', id);

    if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true });
    }

    const projectFile = path.join(projectDir, 'project.json');
    fs.writeFileSync(projectFile, JSON.stringify(project, null, 2), 'utf-8');
}

/**
 * Deletes a project folder and all its contents.
 * @param {string} id - The project slug ID
 */
function deleteProject(id) {
    const projectDir = path.join(__dirname, '../../data/projects', id);

    if (!fs.existsSync(projectDir)) {
        throw new Error(`Project "${id}" not found`);
    }

    fs.rmSync(projectDir, { recursive: true, force: true });
}

module.exports = { writeProject, deleteProject };
