'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;
const languageStrings = require('../languageStrings')
const ssmlWrap = require('./resources/ssmlWrap')
const executor = require('./resources/alexaExecutor')
const dynasty = require('dynasty')({});
const find = require('./resources/databaseWrappers').find
const pluralize = require('pluralize');
const sprintf = require("sprintf-js").sprintf

const strings = languageStrings.strings.en.translation
const stewardItems = dynasty.table('Steward_Items');

const testUserId = 'test'
const testItemName = 'eggs'
const testOldLocation = 'in the refrigerator'
const testNewLocation = 'on the table'

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
            "name": "UpdateLocation",
            "slots": {
                "Item": {"name": "Item"},
                "Location": {"name": "Location"}
            }
        },
        "dialogState": "COMPLETED"
    },
    "version": "1.0"
}

describe("Testing UpdateLocation intent", function() {
    ////put item from location1 to location 2
    ////put item from no location to location 2
    //there is no such item
    ////invalid input
    describe("valid input with existing item and location to a new location", function() {
        var speechResponse = null
        var speechError = null

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            input.request.intent.slots.Item.value = testItemName
            input.request.intent.slots.Location.value = testNewLocation
            const testItem = {userId: testUserId, itemName: testItemName, location: testOldLocation};
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
         var expected = [sprintf(strings.MOVE_MESSAGE_PLURAL, pluralize(testItemName), testNewLocation), sprintf(strings.MOVE_MESSAGE_SINGULAR, pluralize.singular(testItemName), testNewLocation)]
         expect(speechResponse.response.outputSpeech.ssml).to.be.oneOf(expected.map(ssmlWrap))
       })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
         it("should have updated an item", function() {
            return find(stewardItems, {hash: testUserId, range: testItemName})
            .then(function(resp) {
                expect(resp.location).not.to.be.undefined
                expect(resp.location).to.be.string(testNewLocation)
            }).catch(function(err) {
                assert.fail()
            })
        })
    })

    describe("valid input with existing item and no location", function() {
        var speechResponse = null
        var speechError = null

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            input.request.intent.slots.Item.value = testItemName
            input.request.intent.slots.Location.value = testNewLocation
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
         var expected = [sprintf(strings.MOVE_MESSAGE_PLURAL, pluralize(testItemName), testNewLocation), sprintf(strings.MOVE_MESSAGE_SINGULAR, pluralize.singular(testItemName), testNewLocation)]
         expect(speechResponse.response.outputSpeech.ssml).to.be.oneOf(expected.map(ssmlWrap))
       })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
        it("should have updated an item", function() {
            return find(stewardItems, {hash: testUserId, range: testItemName})
            .then(function(resp) {
                expect(resp.location).not.to.be.undefined
                expect(resp.location).to.be.string(testNewLocation)
            }).catch(function(err) {
                assert.fail()
            })
        })
    })

    describe("invalid input with no existing item", function() {
        var speechResponse = null
        var speechError = null

        before(function(done){
            var input = JSON.parse(JSON.stringify(blankInput))
            input.request.intent.slots.Item.value = testItemName
            input.request.intent.slots.Location.value = testNewLocation
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

       it("should have a no item message", function() {
            expect(speechResponse.response.outputSpeech.ssml).to.be.string(ssmlWrap(strings.NO_ITEM_MESSAGE))
        })

        it("should end the alexa session", function() {
            expect(speechResponse.response.shouldEndSession).not.to.be.null
            expect(speechResponse.response.shouldEndSession).to.be.true
        })
    })

    describe("invalid input", function() {
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
