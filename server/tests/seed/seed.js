const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const { TestResult } = require('./../../models/testResult');
const { User } = require('./../../models/user');

const userOneId = new ObjectId();
const userTwoId = new ObjectId();

// users for testing
const users = [
    {
        _id: userOneId,
        email: 'test@user1.com',
        password: 'Onepassword123!',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, 'bssecret').toString()
        }]
    },
    {
        _id: userTwoId,
        email: 'test2@user2.com',
        password: 'Twopassword123!',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access: 'auth'}, 'bssecret').toString()
        }]
    }];

// test result records for testing
const testResults = [
    {
        _id: new ObjectId(),
        _creator: userOneId,
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
        _creator: userTwoId,
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

const populateTestResults = (done) => {
    TestResult.remove({}).then(() => {
        return TestResult.insertMany( testResults );
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        let userOne = new User( users[0] ).save();
        let userTwo = new User( users[1] ).save();

        // this will wait for all promises to complete then call then
        return Promise.all([userOne, userTwo]); // returning
    }).then(() => done());
};

module.exports = {
    testResults, populateTestResults,
    users, populateUsers
}