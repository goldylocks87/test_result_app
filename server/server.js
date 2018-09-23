require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');

const { mongoose } = require('./db/mongoose');

const { TestResult } = require('./models/testResult');

const app = express();
const port = process.env.PORT; 

app.use( bodyParser.json() );

app.post('/testresult', (req, res) => {

    var testResult = new TestResult(req.body);

    testResult.save()
    .then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err); 
    }).catch(err => console.error(err));
});

app.post('/testresults', (req, res) => {

    if ( !Array.isArray(req.body) )
        return res.status(404).send({error: 'This is not a valid array.'}); 

    const testResults = req.body.map(item => new TestResult(item));
    TestResult.insertMany(testResults, (err) => {
        if (err) res.status(404).send(err); 
        else res.send(testResults);
    });
});

app.get('/testresults', (req, res) => {

    TestResult.find({})
    .then((testresults) => {
        res.send({testresults});
    },(err) => {
        res.status(400).send(err); 
    }).catch(err => console.error(err));
});

app.get('/testresults/:id', (req, res) => {

    let id = req.params.id;

    if( !ObjectId.isValid(id) ){
        return res.status(404).send({error: 'Could not find that ish...'}); 
    }

    TestResult.findById(id)
    .then((testresult) => {
        if(!testresult) res.status(404).send({error: 'Could not find that ish...'}); 
        else res.send({testresult});

    }).catch((err) => {
        res.status(400).send({error: 'Bad shit happened...'})
    }); 
});

app.delete('/testresults/:id', (req, res) => {

    let id = req.params.id;

    if( !ObjectId.isValid(id) ){
        return res.status(404).send({error: 'Could not find that ish...'}); 
    }

    TestResult.findByIdAndRemove(id)
    .then((testresult) => {
        if(!testresult) res.status(404).send({error: 'Could not find that ish...'}); 
        else res.send({testresult});
        
    }).catch((err) => {
        res.status(400).send({error: 'Bad shit happened...'})
    }); 
});

module.exports = { app };

app.listen(port, () => {
    console.log(`started app on port ${port}...`);
});