'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;
const languageStrings = require('../languageStrings')
const ssmlWrap = require('./resources/ssmlWrap')
const executor = require('./resources/alexaExecutor')
const dynasty = require('dynasty')({});
const pluralize = require('pluralize');
const sprintf = require("sprintf-js").sprintf

const strings = languageStrings.strings.en.translation
const stewardItems = dynasty.table('Steward_Items');
const find = require('./resources/databaseWrappers').find

const testUserId = 'test'
const testItemName = 'eggs'
const testQuantity = 5

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
            "name": "RemoveItem",
            "slots": {
                "Item": {"name": "Item"},
            }
        },
        "dialogState": "COMPLETED"
    },
    "version": "1.0"
}

describe("Testing RemoveItem intent", function() {

    describe("remove item that is there", function() {
        var speechResponse = null
        var speechError = null

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            input.request.intent.slots.Item.value = testItemName
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

        it("should have an affirmative message", function() {
          var expected = ssmlWrap(sprintf(strings.REMOVE_MESSAGE, testItemName))
          expect(speechResponse.response.outputSpeech.ssml).to.be.equal(expected)
        })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })

        it("should have remove item from database", function() {
            return find(stewardItems, {hash: testUserId, range: testItemName})
            .then(function(resp) {
                expect(resp).to.be.undefined;
            }).catch(function(err) {
                assert.fail()
            })
        })
    })

    describe("remove item that is not there", function() {
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

        it("should have an affirmative message", function() {
          var expected = ssmlWrap(sprintf(strings.REMOVE_MESSAGE, testItemName))
          expect(speechResponse.response.outputSpeech.ssml).to.be.equal(expected)
        })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })

    describe("invalid intput", function() {
        var speechResponse = null
        var speechError = null

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

        it("should not have removed from the database", function() {
            return find(stewardItems, {hash: testUserId, range: testItemName})
            .then(function(resp) {
                expect(resp).not.to.be.undefined
            }).catch(function(err) {
                assert.fail()
            })
        })
    })

})
