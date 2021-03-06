require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectId } = require('mongodb');

const { mongoose } = require('./db/mongoose');

const { TestResult } = require('./models/testResult');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT; 

app.use( bodyParser.json() );

app.post('/testresult', authenticate, (req, res) => {

    req.body._creator = req.user._id;

    var testResult = new TestResult(req.body);

    testResult.save().then((doc) => {
        res.send(doc);
    }, (err) => {
        res.status(400).send(err); 
    }).catch(err => console.error(err));
});

app.post('/testresults', authenticate, (req, res) => {

    if ( !Array.isArray(req.body) )
        return res.status(400).send({error: 'This is not a valid array.'}); 

    const testResults = req.body.map((item) => {
        item._creator = req.user._id;
        return new TestResult(item);
    });

    TestResult.insertMany(testResults, (err) => {
        if (err) res.status(400).send(err); 
        else res.send(testResults);
    });
});

app.get('/testresults', authenticate, (req, res) => {

    TestResult.find({_creator: req.user._id})
    .then((testresults) => {
        res.send({testresults});
    },(err) => {
        res.status(400).send(err); 
    }).catch(err => console.error(err));
});

app.get('/testresults/:id', authenticate, (req, res) => {

    let id = req.params.id;

    if( !ObjectId.isValid(id) ){
        return res.status(404).send({error: 'Could not find that ish...'}); 
    }

    TestResult.findOne({_id: id, _creator: req.user._id})
    .then((testresults) => {
        if(!testresults) res.status(404).send({error: 'Could not find that ish...'}); 
        else res.send({testresults});

    }).catch((err) => {
        res.status(400).send({error: 'Bad shit happened...'})
    }); 
});

app.delete('/testresults/:id', authenticate, (req, res) => {

    let id = req.params.id;

    if( !ObjectId.isValid(id) ){
        return res.status(404).send({error: 'Could not find that ish...'}); 
    }

    TestResult.findOneAndRemove({_id: id, _creator: req.user._id})
    .then((testresults) => {
        if(!testresults) res.status(404).send({error: 'Could not find that ish...'}); 
        else res.send({testresults});
        
    }).catch((err) => {
        res.status(400).send({error: 'Bad shit happened...'})
    }); 
});

app.patch('/testresults/:id', authenticate, (req, res) => {

    let id = req.params.id;

    if( !ObjectId.isValid(id) ){
        return res.status(404).send({error: 'Could not find that ish...'}); 
    }

    TestResult.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: req.body}, {new: true})
    .then((testresults) => {
        if(!testresults) res.status(404).send({error: 'Could not find that ish...'}); 
        else res.send({testresults});

    }, (err) => {
        res.status(400).send({error: 'Bad shit happened...'})
    }).catch(err => console.error(err)); 
});

app.post('/users', (req, res) => {

    // pick off props that we want users to be able to set
    let body = _.pick(req.body, ['email','password']);

    let user = new User(body);

    user.save()
    .then(() => {
        return user.generateAuthToken();
    })
    .then((token) => {
        // x- denotes a custom header prop
        res.header('x-auth', token).send(user);
    })
    .catch( err => res.status(400).send(err) );
});

app.get('/users/me', authenticate, (req, res) => {

    res.send(req.user); // from the authenticate middleware
});

app.post('/users/login', (req, res) => {

    // pick off props that we want users to be able to set
    let body = _.pick(req.body, ['email','password']);

    User.findByCredentials(body.email, body.password)
    .then((user) => {
        user.generateAuthToken().then((token) => {
            // x- denotes a custom header prop
            res.header('x-auth', token).send(user);
        })
    }).catch(err => {
        res.status(400).send(err);
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {

    req.user.removeToken(req.token)
    .then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    })
});

module.exports = { app };

app.listen(port, () => {
    console.log(`started app on port ${port}...`);
});