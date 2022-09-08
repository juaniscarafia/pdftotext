const express = require("express");
const response = require("../../../network/response");
const controller = require("./index");
const error = require("../../../utils/error");
const router = express.Router();

/**
 * @swagger
 * /api/pdftotext/:
 *   post:
 *     summary: Extraer texto de archivos PDF.
 *     tags: [PDF]
 *     requestBody:
 *      required: true
 *      content:
 *        multipart/form-data:
 *          schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: file
 *                 format: binary
 *                 required: true
 *               pages:
 *                 items: integer
 *                 required: true
 *             required:
 *               - file
 *     responses:
 *      200:
 *         description: Extraer texto de archivos PDF.
 *      default:
 *         description:
 */
 router.post("/", readpdf);

 async function pdftopic(req, res, next) {
        try {
            const file = req.file;
        
            response.success(req, res, "pdftopic", 200);
        } catch (error) {
            next(error);
        }
  }
  
  async function readpdf(req, res, next) {
    try {
        const file = req.files.file;
        let pages = req.body.pages.split(',').map(Number);
    
        let nameShort = file.name.split('.');
        let ext = nameShort[nameShort.length - 1];
    
        // Extensiones Permitidas
        let extPer = ['pdf'];
    
        if (extPer.indexOf(ext) < 0) {
          throw error('Extensión no permitida', 400);
        }

        let moveFile = await controller.moveFile(file);

        if (!moveFile) {
            throw error("No se pudo guardar el archivo.", 400);
        }

        let pagesConvert = [];

        for (const page of pages) {
            let convertion = await controller.convertPage(file.name, page);
            if (convertion){
                pagesConvert.push(`./files/img/page-${page}.jpg`);
            }
        }

        let textpdf;
        if (pagesConvert.length > 0) {
            textpdf = await controller.readpdf(pagesConvert);
        }

        let nota = "";
        if (pagesConvert.length != pages.length) {
            nota = `de las ${pages.length} ${pages.length > 1 ? "páginas" : "página"} solo se pudieron procesar ${pagesConvert.length} ${pagesConvert.length > 1 ? "páginas" : "página"}`;
        }
  
        response.success(req, res, {
            "Traducción": textpdf,
            "Observaciones": nota
        }, 200);
    } catch (error) {
        next(error);
    }
  }
  
  module.exports = router;