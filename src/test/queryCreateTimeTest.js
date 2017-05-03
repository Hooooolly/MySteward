'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;
const languageStrings = require('../languageStrings')
const ssmlWrap = require('./resources/ssmlWrap')
const executor = require('./resources/alexaExecutor')
const dynasty = require('dynasty')({});
const sprintf = require("sprintf-js").sprintf

const strings = languageStrings.strings.en.translation
const stewardItems = dynasty.table('Steward_Items');

const testUserId = 'test'
const testItemName = 'eggs'
const testTime = Date.now()
const testTime10 = Date.now() - (1000*60*60*24*10)

const blankInput =
{
    "session": {
        "sessionId": "SessionId.26e6421a-0b46-45e4-baed-874c2ee039df",
        "application": {"applicationId": "amzn1.ask.skill.8371afd6-d231-4b54-bf1d-5987733228cd"},
        "attributes": {},
        "user": {"userId": testUserId},
        "new": true
    },
    "request": {
        "type": "IntentRequest",
        "locale": "en-US",
        "intent": {
            "name": "QueryCreateTime",
            "slots": {
                "Item": {"name": "Item"}
            }
        },
        "dialogState": "COMPLETED"
    },
    "version": "1.0"
}

describe("Testing QueryCreateTime intent", function() {

    describe("valid input with existing item and time", function() {
        var speechResponse = null
        var speechError = null

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            input.request.intent.slots.Item.value = testItemName
            const testItem = {userId: testUserId, itemName: testItemName, createTime: testTime};
            executor.insertItemThenExecute(stewardItems, testItem, input, function(err, resp) {
                if (err) { console.log(err); speechError = err}
                else { speechResponse = resp }
                done()
            })
        })

        it('should not have errored',function() {
            expect(speechError).to.be.null
        })

        it("should have an answer with time", function() {
            var expected = sprintf(strings.TIME_MESSAGE,testItemName,0)
            expect(speechResponse.response.outputSpeech.ssml).to.be.string(ssmlWrap(expected))
        })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })

	describe("valid input with existing item and previous time", function() {
        var speechResponse = null
        var speechError = null

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            input.request.intent.slots.Item.value = testItemName
            const testItem = {userId: testUserId, itemName: testItemName, createTime: testTime10};
            executor.insertItemThenExecute(stewardItems, testItem, input, function(err, resp) {
                if (err) { console.log(err); speechError = err}
                else { speechResponse = resp }
                done()
            })
        })

        it('should not have errored',function() {
            expect(speechError).to.be.null
        })

        it("should have an answer with time", function() {
            var expected = sprintf(strings.TIME_MESSAGE,testItemName,10)
            expect(speechResponse.response.outputSpeech.ssml).to.be.string(ssmlWrap(expected))
        })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })

    describe("valid input with no existing item", function() {
        var speechResponse = null
        var speechError = null

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            input.request.intent.slots.Item.value = testItemName
            const testItem = {hash: testUserId, range: testItemName};
            executor.deleteItemThenExecute(stewardItems, testItem, input, function(err, resp) {
                if (err) { console.log(err); speechError = err}
                else { speechResponse = resp }
                done()
            })
        })

        it('should not have errored',function() {
            expect(speechError).to.be.null
        })

        it("should have an answer without time", function() {
            var expected = sprintf(strings.NOTIME_MESSAGE,testItemName)
            expect(speechResponse.response.outputSpeech.ssml).to.be.string(ssmlWrap(expected))
        })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })

    describe("invalid input - no item", function() {
        var speechResponse = null
        var speechError = null
        var currentQuantity = 0;

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            const testItem = {userId: testUserId, itemName: testItemName};
            executor.insertItemThenExecute(stewardItems, testItem, input, function(err, resp) {
                if (err) { console.log(err); speechError = err}
                else { speechResponse = resp }
                done()
            })
        })

        it('should not have errored',function() {
            expect(speechError).to.be.null
        })

        it("should have an error message", function() {
            expect(speechResponse.response.outputSpeech.ssml).to.be.string(ssmlWrap(strings.ERROR_MESSAGE))
        })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })
})
