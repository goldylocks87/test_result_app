const expect = require('expect');
const request = require('supertest');
const { ObjectId } = require('mongodb');

const { app } = require('./../server');
const { TestResult } = require('./../models/testResult');
const { User } = require('./../models/user');
const { testResults, 
        populateTestResults,
        users,
        populateUsers } = require('./seed/seed');


// clear the db before each test
beforeEach(populateUsers);
beforeEach(populateTestResults);

describe('POST /testresults', () => {
    
    it('should create a new testresult', (done) => {

        let newTestResult = 
            [{

                "attributes": {
                    "type": "ApexTestResult",
                    "url": "/someUrl/12345"
                },
                "Id": "12345",
                "QueueItemId": "45678",
                "StackTrace": null,
                "Message": null,
                "AsyncApexJobId": "78901",
                "MethodName": "test",
                "Outcome": "Fail",
                "ApexClass": {
                    "attributes": {
                        "type": "ApexClass",
                        "url": "/someUrl"
                    },
                    "Id": "01234",
                    "Name": "Some_Test_3",
                    "NamespacePrefix": null
                },
                "RunTime": 100,
                "FullName": "Some_Test_3.test3"
            }];

        request(app)
            .post('/testresults')
            .send(newTestResult)
            .expect(200)
            .expect((res) => {
                expect(res.body.length).toBe(1);
            })
            .end((err, res) => {
                if(err) return done(err);

                // make sure we can find it in the db
                TestResult.find({AsyncApexJobId: '78901'})
                .then((testresults) => {
                    expect(testresults.AsyncApexJobId)
                    .toBe(newTestResult.AsyncApexJobId);
                    
                    done();
                }).catch((err) => done(err));
            });
    });

    it('should not create a testresult with a bad body', (done) => {
        request(app)
            .post('/testresults')
            .send({})
            .expect(400)
            .end(done);
    });
});

describe('GET /testresults', () => {

    it('should get all testresults', (done) => {
        request(app)
            .get('/testresults')
            .expect(200)
            .expect((res) => {
                expect(res.body.testresults.length)
                .toBe(2);
            })
            .end(done);
    })
});

describe('GET /testresults/:id', () => {

    it('should return testresult by id', (done) => {
        request(app)
            .get(`/testresults/${testResults[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.testresults.AsyncApexJobId)
                .toBe(testResults[0].AsyncApexJobId);
            })
            .end(done);
    })

    it('should return an error 404 if testresult not found', (done) => {

        let hexId = new ObjectId().toHexString();

        request(app)
            .get(`/testresults/${hexId}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.error.length).toBeGreaterThan(0);
            })
            .end(done);
    });

    it('should return an error 404 if id is not valid', (done) => {
        request(app)
            .get('/testresults/123')
            .expect(404)
            .end(done);
    });
});

// user tests
describe('GET /users/me', () => {

    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    })

    it('should return a 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', '')
            .expect(401)
            .expect((res) => {
                expect(res.body._id).toBeUndefined;
            })
            .end(done);
    })
});

describe('POST /users', () => {

    let newUser = 
        {
            email: 'new@email.com', 
            password: 'newPassword123!'
        };

    it('should create a user', (done) => {
        request(app)
            .post('/users')
            .send(newUser)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(newUser.email);
            })
            .end((err) => {
                if (err) done(err);

                User.findOne({email: newUser.email})
                .then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(newUser.password);
                    done();
                }).catch(err => done(err));
            });
    })

    it('should not create a user with an invalid email', (done) => {
        request(app)
            .post('/users')
            .send({email: 'bad', password: newUser.password})
            .expect(400)
            .end(done);
    })

    it('should not create a user with an invalid password', (done) => {
        request(app)
            .post('/users')
            .send({email: newUser.email, password: ''})
            .expect(400)
            .end(done);
    })

    it('should not create a user with a duplicate email', (done) => {
        request(app)
            .post('/users')
            .send(users[0])
            .expect(400)
            .end(done);
    })
});

describe('POST /users/login', () => {

    it('should login user and return auth token', (done) => {

        let email = users[1].email;
        let password = users[1].password;

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth'])
                .toExist();
            })
            .end((err, res) => {
                if (err) done(err);

                User.findById(users[1]._id)
                .then((user) => {
                    expect(user.tokens[0].token)
                    .toBe(res.headers['x-auth']);
                    done();
                }).catch(err => done(err));
            });
    })

    it('should reject a login with an incorrect password', (done) => {

        let email = users[1].email;
        let password = 'FakePassword123';

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth'])
                .toNotExist();
            })
            .end((err, res) => {
                if (err) done(err);

                User.findById(users[1]._id)
                .then((user) => {
                    expect(user.tokens.length)
                    .toBe(0)
                    done();
                }).catch(err => done(err));
            });
    })
});

describe('DELETE /users/me/token', () => {

    it('should remove auth token from a users token array', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth'])
                .toNotExist();
            })
            .end((err, res) => {
                if (err) done(err);

                User.findById(users[0]._id)
                .then((user) => {
                    expect(user.tokens.length)
                    .toBe(0)
                    done();
                }).catch(err => done(err));
            });
    })
});