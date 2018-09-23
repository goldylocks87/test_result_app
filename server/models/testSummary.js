const mongoose = require('mongoose');

var TestSummary = mongoose.model('TestSummary', {
	outcome: {
		type: 'String'
	},
	testsRan: {
		type: 'Number'
	},
	passing: {
		type: 'Number'
	},
	failing: {
		type: 'Number'
	},
	skipped: {
		type: 'Number'
	},
	passRate: {
		type: 'Date'
	},
	failRate: {
		type: 'Date'
	},
	testStartTime: {
		type: 'Date'
	},
	testExecutionTime: {
		type: 'String'
	},
	testTotalTime: {
		type: 'String'
	},
	commandTime: {
		type: 'String'
	},
	hostname: {
		type: 'String'
	},
	orgId: {
		type: 'String'
	},
	username: {
		type: 'String'
	},
	testRunId: {
		type: 'String'
	},
	userId: {
		type: 'String'
	},
	testRunCoverage: {
		type: 'Date'
	},
	orgWideCoverage: {
		type: 'Date'
	}
});

module.exports = { TestSummary };