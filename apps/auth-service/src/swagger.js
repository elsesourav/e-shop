import swaggerAutoGen from "swagger-autogen";

const doc = {
  info: {
    title: "Auth Service",
    description: "Automatically generated swagger docs",
    version: "1.0.0",
  },
  host: "localhost:6001",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/auth.route.ts"];

swaggerAutoGen()(outputFile, endpointsFiles, doc).then(() => {
  console.log("Swagger documentation generated successfully.");
});