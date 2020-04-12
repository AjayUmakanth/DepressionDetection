const router = require('express').Router()
var BigQuery = require('@google-cloud/bigquery');
var bigQuery = BigQuery({ projectId: 'depression-detection-030498' });

router.post('/', (req, res) => {
    var Id = 0;
    var name=req.body.Name;
    var gender=req.body.Gender;
    var dob=req.body.DateOfBirth;
    var phone=req.body.Phone;
    var pass=req.body.Password;
    var email=req.body.Email;
    var result={};
    bigQuery.query({
        query: `SELECT * FROM depression-detection-030498.depression_detection.User where Email='${email}'`,
        useLegacySql: false
    }).then(function (data) {     
        data=data[0];
        if(data.length==0)
        {      
            bigQuery.query({
                query:`(Select MAX(Id) As Id from depression-detection-030498.depression_detection.User);`,
                useLegacySql:false
            }).then(function(data){
                data = data[0];
                Id = parseInt(data[0].Id);                 
                Id = Id+1;
                bigQuery.query({
                    query:`INSERT INTO depression-detection-030498.depression_detection.User VALUES ( ${Id} ,'${name}','${gender}','${dob}',${phone},'${pass}','${email}')`,
                    useLegacySql:false
                }).then(function(){
                    result["Id"]=Id;
                    result["Name"]=name;
                    result["Gender"]=gender;
                    result["DateOfBirth"]=dob;
                    result["Phone"]=phone;
                    result["Email"]=email;
                    return res.status(200).send(result);
                }).catch(function(error){
                    return res.status(500).send(error);
                });         
            }).catch(function(error){
                return res.status(500).send(error);
            });
                       
        }
        else
        {
            return res.status(500).json({"error":"Email has already been registered"});
        }
    }).catch(function (error) {
        return res.status(500).send(error);
    });
})



module.exports = router
