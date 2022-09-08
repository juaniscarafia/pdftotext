//const pdf = require('pdf-poppler');
var pdf2img = require('pdf-img-convert-node-fix');
const fs = require('fs');
const { createWorker } = require('tesseract.js');
const error = require("../../../utils/error");

module.exports = function () {
    // async function convertPage(file, page) {
    //     return new Promise(async function(resolve, reject) {
    //         let opts = {
    //             format: 'jpeg',
    //             out_dir: `./files/img/`,
    //             out_prefix: `page`,
    //             page: page
    //         }
    
    //         await pdf.convert(`./files/pdf/${file}`, opts)
    //         .then(res => {
    //             resolve(true);
    //         })
    //         .catch(err => {
    //             resolve(false);
    //         });
    //     });
    // }

    async function pdftopic(file, pages) {
        try {
            let paginas = [];
      
            let options = {
                width: 2480,
                height: 3508,
                page_numbers: pages
            }
      
            try {
                pdfArray = await pdf2img.convert(`./files/pdf/${file}`, options);
            } catch (err) {
                throw error(err);
            }
      
            //let xPage = 1;
            for (i = 0; i < pdfArray.length; i++){
                fs.writeFile(`./files/img/page_${i}.jpg`, pdfArray[i], function (err) {
                    if (err) { console.error("Error: " + err); }
                });
                paginas.push(`./files/img/page_${i}.jpg`);
                //xPage++;
            }
      
            if (paginas.length == 0) {
                throw error(`Las páginas no se encontraron en el pdf`, 400);
            }
            
            return paginas;
        } catch (err) {
            throw error(err, 400);
        }
    }

    async function readpdf(listOfImages) {
        return new Promise(async function(resolve, reject) {
            try {
                const worker = createWorker({
                    logger: m => console.log(m)
                });
                await worker.load();
                // await worker.loadLanguage(lenguaje);
                // await worker.initialize(lenguaje);
        
                // Le paso el trainig data como string, porque usando las lineas de arriba da error
                await worker.loadLanguage('spa');
                await worker.initialize('spa');
        
                let data = [];
        
                for (const page of listOfImages) {
                var { data: { text } } = await worker.recognize(page);
                    data.push({
                        "page": page.split('/').pop().split('.').shift(),
                        text
                    });
                }
        
                await worker.terminate();
                resolve(data);
            } catch (err) {
                reject(err);
            }
        });
    }

    async function moveFile(file) {
        return new Promise(async function(resolve, reject) {
            file.mv(`./files/pdf/${file.name}`, function(err) {
                if (err) {
                reject(false);
                }
                resolve(true);
            });
        });
    }

    return {
        pdftopic,
        readpdf,
        moveFile
    };
};