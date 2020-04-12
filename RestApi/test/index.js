const router = require('express').Router();
const path = require('path');
const os = require('os');
const fs = require('fs');
var BigQuery = require('@google-cloud/bigquery');
var bigQuery = BigQuery({ projectId: 'depression-detection-030498' });
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('depressed_videos')
const uuidV1 = require('uuid/v1');

const Busboy = require('busboy');

router.get('/', (req, res) => {
    var id = req.query.id;
    bigQuery.query({
        query: `SELECT Id, DateTime, QuestionnaireResult, ModelResult FROM depression-detection-030498.depression_detection.Test where UserId=${id} order by DateTime desc;`,
        useLegacySql: false
    }).then(function (data) {
            data=data[0];
            data.forEach(function(value){
                value["DateTime"]=value["DateTime"]["value"];
            });
            return res.status(200).send(data);
        })
        .catch(function(error){
                return res.status(500).send(error);
        });
    });
router.post('/',  (req, res) => {

    if (req.method !== 'POST') {
        return res.status(405).end();
    }
    const busboy = new Busboy({headers: req.headers});
    const dir = os.tmpdir();

    const fields = {};
    const uploads = {};
    const fileWrites = [];

    busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
    });

    busboy.on('file', (fieldname, file, filename) => {
        const filepath = path.join(dir, filename);
        uploads[fieldname] = filepath;

    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
                writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fileWrites.push(promise);
    });

    console.log(`Promise created`);
    
    busboy.on('finish', async () => {
        await Promise.all(fileWrites);
        console.log(`Promise finished`   );
        const name = fields["ID"]+"-"+uuidV1();
        bucket.upload(uploads["VIDEO"], {destination: 'VIDEO/'+name+'.mp4'}, function(err, file, apiResponse) {
            if (err)
                console.log("Vedio file was not written");
            fs.unlinkSync(uploads["VIDEO"]);
        });
        bucket.upload(uploads["JSON"], {destination: 'JSON/'+name+'.json'}, function(err, file, apiResponse){
            if (err)
                console.log("Json file was not written");
            fs.unlinkSync(uploads["JSON"]);
        });

        console.log(`File Write Finished finished`);
        return res.status(200).json({"message":"File uploaded"});
  });
  busboy.end(req.rawBody);
})
module.exports = router