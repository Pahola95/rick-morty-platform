const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rick & Morty API',
      version: '1.0.0',
      description: 'Plataforma de gestión del universo Rick & Morty'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Desarrollo local' }  // ← Solo este
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          tags: ['Health'],
          security: [],
          responses: {
            200: { description: 'API funcionando correctamente' }
          }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT de Auth0'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            auth0Id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'USER'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Favorite: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['CHARACTER', 'LOCATION', 'EPISODE'] },
            externalId: { type: 'integer' },
            name: { type: 'string' },
            image: { type: 'string' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./src/modules/**/*.routes.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;