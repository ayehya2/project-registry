/**
 * Core visibility filtering logic.
 *
 * Rules (in order):
 * 1. If consumer is provided and listed in visibility.consumers → use that value
 * 2. If consumer is provided but NOT listed → fall back to visibility.default
 * 3. If no consumer (anonymous request) → use visibility.default
 *
 * The `visibility` field is stripped from the returned objects — it's an
 * internal field callers don't need.
 *
 * @param {object[]} projects - Full project array from readProjects()
 * @param {string|null} consumerId - Consumer ID from req.consumer, or null
 * @returns {object[]} Filtered projects with `visibility` stripped
 */
function filterByConsumer(projects, consumerId) {
    return projects
        .filter((project) => {
            const vis = project.visibility;

            // No visibility config at all — show it
            if (!vis) return true;

            // Explicit consumer rule takes priority
            if (consumerId && vis.consumers && consumerId in vis.consumers) {
                return vis.consumers[consumerId] === true;
            }

            // Fall back to default
            return vis.default !== false;
        })
        .map((project) => {
            // Strip the internal visibility field before returning
            const { visibility, ...rest } = project;
            return rest;
        });
}

module.exports = { filterByConsumer };
