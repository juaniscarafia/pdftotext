const express = require("express");
const bodyParser = require("body-parser");
const config = require("../config.js");
const pdftotext = require("./components/pdftotext/network");
const errors = require("../network/errors");
const err = require("../utils/error.js");
const path = require("path");
const fileUpload = require("express-fileupload");
const fs = require("fs");

//SWAGGER
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerSpec = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api PDFtoText Service App's de Nosis",
      version: "1.0",
      description:
        "App destinada a traducir archivos PDF a texto",
      contact: {
        name: "Desarrollos Internos",
        email: "desarrollosinternos@nosis.com",
      },
    },
  },
  apis: [
    `${path.join(__dirname, "./components/pdftotext/*.js")}`
  ],
};

const app = express();
app.use(bodyParser.json());

app.use(fileUpload());

if (!fs.existsSync(config.files)){
  fs.mkdirSync(config.files);
}
if (!fs.existsSync(config.pdf)){
  fs.mkdirSync(config.pdf);
}
if (!fs.existsSync(config.img)){
  fs.mkdirSync(config.img);
}

// RUTAS

app.use(
  "/api/documentacion",
  swaggerUI.serve,
  swaggerUI.setup(swaggerJsDoc(swaggerSpec))
);

app.get("/", (req, res) => {
  res.send({ Estado: "Api PDFtoText Service()!" }).status(200);
});

app.use("/api/pdftotext", pdftotext);

app.use(errors);
app.listen(config.api.port, () => {
  console.log("Api escuchando en el puerto ", config.api.port);
});
