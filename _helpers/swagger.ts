import express from 'express';
const router = express.Router();
import YAML from 'yamljs';
import path from 'path';

// Load the swagger.yaml file from the project root
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

router.get('/swagger.json', (req, res) => {
    res.json(swaggerDocument);
});

const swaggerPage = (req: express.Request, res: express.Response) => {
    res.send(`<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function () {
            window.ui = SwaggerUIBundle({
                url: '/api-docs/swagger.json',
                dom_id: '#swagger-ui',
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                layout: 'StandaloneLayout'
            });
        };
    </script>
</body>
</html>`);
};

router.get(['/', ''], swaggerPage);

export default router;
