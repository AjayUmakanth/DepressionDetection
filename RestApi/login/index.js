const router = require('express').Router()
var BigQuery = require('@google-cloud/bigquery');
var bigQuery = BigQuery({ projectId: 'depression-detection-030498' });

router.post('/', (req, res) => {
    var pass=req.body.Password;
    var email=req.body.Email;
    bigQuery.query({
        query: `SELECT * FROM depression-detection-030498.depression_detection.User where Email='${email}'`,
        useLegacySql: false
    }).then(function (data) {     
        data=data[0];
        if(data.length==0)
        {
            return res.status(404).json({"error":"Username not present"});
        }
        data=data[0];
        if(data.Password!=pass)
        {
            return res.status(403).json({"error":"Incorrect password"});
        }
        else
        {
            var result={};
            result["Id"]=data.Id;
            result["Name"]=data.Name;
            result["Gender"]=data.Gender;
            result["DateOfBirth"]=data.DateOfBirth;
            result["Phone"]=data.Phone;
            result["Email"]=data.Email;
            return res.status(200).send(result);
        }
    }).catch(function (error) {
        return res.status(500).send(error);
    });
})



module.exports = router