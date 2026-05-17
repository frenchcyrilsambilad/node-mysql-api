import express from 'express';
const router = express.Router();
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Load the swagger.yaml file from the project root
const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

// Mount Swagger UI on the root path of this router
router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default router;
