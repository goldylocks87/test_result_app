const expect = require('expect');
const request = require('supertest');
const { ObjectId } = require('mongodb');

const { app } = require('./../server');
const { TestResult } = require('./../models/testResult');

const testResults = [
    {
        _id: new ObjectId(),
        attributes: {
            type: 'ApexTestResult',
            url: '/someUrl/123'
        },
        Id: '123',
        QueueItemId: '456',
        StackTrace: null,
        Message: null,
        AsyncApexJobId: '789',
        MethodName: 'test',
        Outcome: 'Pass',
        ApexClass: {
            attributes: {
                type: 'ApexClass',
                url: '/someUrl'
            },
            Id: '012',
            Name: 'Some_Test',
            NamespacePrefix: null
        },
        RunTime: 100,
        FullName: 'Some_Test.test'
    }, {
        _id: new ObjectId(),
        attributes: {
            type: 'ApexTestResult',
            url: '/someUrl/1234'
        },
        Id: '1234',
        QueueItemId: '4567',
        StackTrace: null,
        Message: null,
        AsyncApexJobId: '7890',
        MethodName: 'test',
        Outcome: 'Fail',
        ApexClass: {
            attributes: {
                type: 'ApexClass',
                url: '/someUrl'
            },
            Id: '0123',
            Name: 'Some_Test_2',
            NamespacePrefix: null
        },
        RunTime: 100,
        FullName: 'Some_Test_2.test2'
    }
];

// clear the db before each test
beforeEach((done) => {
    TestResult.remove({}).then(() => {
        return TestResult.insertMany(testResults);
    }).then(() => done());
});

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
                    
                    done(testresults.AsyncApexJobId);
                }).catch((err) => done(err));
            });
    });

    it('should not create a testresult with a bad body', (done) => {

        request(app)
            .post('/testresults')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) return done(err);
                else done();
            });
    });
});

describe('GET /testresults', () => {
    it('should get all testresults', (done) => {
        request(app)
            .get('/testresults')
            .expect(200)
            .expect((res) => {
                expect(res.body.testresults.length).toBe(2);
                done();
            })
            .end((err, res) => {
                if(err) return done(err);

            });
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
                done();
            })
            .end((err, res) => {
                if(err) return done(err);

            });
    })

    it('should return an error 404 if testresult not found', (done) => {
        let hexId = new ObjectId().toHexString();

        request(app)
            .get(`/testresults/${hexId}`)
            .expect(404)
            .expect((res) => {
                expect(res.body.error.length).toBeGreaterThan(0);
                done();
            })
            .end((err, res) => {
                if(err) return done(err);

            });
    });

    it('should return an error 404 if id is not valid', (done) => {
        request(app)
            .get('/testresults/123')
            .expect(404)
            .end(done);
    });
});