const path = require('path');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const yaml = require('yaml');

// Read and parse the swagger.yaml file
const swaggerYamlPath = path.join(__dirname, 'docs', 'swagger.yaml'); // Adjust path if necessary
const swaggerFile = fs.readFileSync(swaggerYamlPath, 'utf8');
const swaggerDocument = yaml.parse(swaggerFile);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(swaggerDocument),
};
