const pdf = require('pdf-poppler');
const { createWorker } = require('tesseract.js');
const error = require("../../../utils/error");

module.exports = function () {
    async function convertPage(file, page) {
        return new Promise(async function(resolve, reject) {
            let opts = {
                format: 'jpeg',
                out_dir: `./files/img/`,
                out_prefix: `page`,
                page: page
            }
    
            await pdf.convert(`./files/pdf/${file}`, opts)
            .then(res => {
                resolve(true);
            })
            .catch(err => {
                resolve(false);
            });
        });
    }

    async function pdftopic(file, pages) {
        try {
            let nameShort = file.split('.');

            for (const page of pages) {
                try {
                    let opts = {
                        format: 'jpeg',
                        out_dir: `./files/img/`,
                        out_prefix: `page`,
                        page: page
                    }

                    pdf.convert(`./files/pdf/${file}`, opts)
                    .then(res => {
                        console.log('Successfully converted');
                    })
                    .catch(error => {
                        console.error(error);
                    });
                } catch (err) {
                    throw error(err);
                }
            }
        
            return "paginas";
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
        convertPage,
        readpdf,
        moveFile
    };
};