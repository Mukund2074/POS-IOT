/**
 * Transformer function for orval.
 * Ignores/bypasses mailgun-related schemas and operations (internal feature).
 *
 * @param {OpenAPIObject} inputSchema
 * @return {OpenAPIObject}
 */
const transformer = (inputSchema) => {
    // Filter out mailgun paths
    const filteredPaths = Object.entries(inputSchema.paths || {}).reduce((acc, [path, pathItem]) => {
        // Skip paths containing 'mailgun'
        if (path.toLowerCase().includes('mailgun')) {
            return acc;
        }
        return {
            ...acc,
            [path]: pathItem,
        };
    }, {});

    // Filter out mailgun schemas
    const filteredSchemas = Object.entries(inputSchema.components?.schemas || {}).reduce(
        (acc, [schemaName, schema]) => {
            // Skip schemas containing 'mailgun'
            if (schemaName.toLowerCase().includes('mailgun')) {
                return acc;
            }
            return {
                ...acc,
                [schemaName]: schema,
            };
        },
        {},
    );

    // Recursively filter out mailgun $refs
    const filterMailgunRefs = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(filterMailgunRefs).filter((item) => {
                // Skip items with mailgun $refs
                if (item && typeof item === 'object' && item.$ref) {
                    return !item.$ref.toLowerCase().includes('mailgun');
                }
                return true;
            });
        } else if (obj && typeof obj === 'object' && obj !== null) {
            // Skip if this object has a mailgun $ref
            if (obj.$ref && typeof obj.$ref === 'string' && obj.$ref.toLowerCase().includes('mailgun')) {
                return undefined;
            }

            return Object.entries(obj).reduce((acc, [key, value]) => {
                const processed = filterMailgunRefs(value);
                // Only include if processed value is not undefined (wasn't skipped)
                if (processed !== undefined) {
                    acc[key] = processed;
                }
                return acc;
            }, {});
        }
        return obj;
    };

    return {
        ...inputSchema,
        paths: filterMailgunRefs(filteredPaths),
        components: {
            ...inputSchema.components,
            schemas: filterMailgunRefs(filteredSchemas),
        },
    };
};

export default transformer;
