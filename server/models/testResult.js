const mongoose = require('mongoose');

var TestResult = mongoose.model('TestResult', {
    attributes: {
        type: {
            type: 'String',
            required: true,
        },
        url: {
            type: 'String',
            required: true,
        }
    },
    Id: {
        type: 'String',
        required: true,
        trim: true,
    },
    QueueItemId: {
        type: 'String'
    },
    StackTrace: {
        type: 'Mixed'
    },
    Message: {
        type: 'Mixed'
    },
    AsyncApexJobId: {
        type: 'String',
        required: true,
    },
    MethodName: {
        type: 'String'
    },
    Outcome: {
        type: 'String',
        required: true,
    },
    ApexClass: {
        attributes: {
            type: {
                type: 'String'
            },
            url: {
                type: 'String'
            }
        },
        Id: {
            type: 'String',
            required: true,
        },
        Name: {
            type: 'String',
            required: true,
        },
        NamespacePrefix: {
            type: 'Mixed'
        }
    },
    RunTime: {
        type: 'Number',
        required: false,
    },
    FullName: {
        type: 'String',
        required: true,
    }
});

module.exports = { TestResult };