import express from 'express';
const router = express.Router();
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load the swagger.yaml file from the project root
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

// Serve Swagger UI assets separately so asset requests do not receive the docs HTML.
router.use('/', swaggerUi.serveFiles(swaggerDocument));
router.get('/', swaggerUi.setup(swaggerDocument));

export default router;
