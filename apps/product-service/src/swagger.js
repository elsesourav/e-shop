import swaggerAutoGen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Product Service',
    description: 'Automatically generated swagger docs',
    version: '1.0.0',
  },
  host: 'localhost:6002',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/product.route.ts'];

swaggerAutoGen()(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully.');
});
