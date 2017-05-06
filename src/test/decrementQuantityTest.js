'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;
const languageStrings = require('../languageStrings')
const ssmlWrap = require('./resources/ssmlWrap')
const executor = require('./resources/alexaExecutor')
const dynasty = require('dynasty')({});
const sprintf = require("sprintf-js").sprintf
const find = require('./resources/databaseWrappers').find

const strings = languageStrings.strings.en.translation
const stewardItems = dynasty.table('Steward_Items');

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
            "name": "DecrementQuantity",
            "slots": {
                "Item": {"name": "Item"},
                "Quantity": {"name": "Quantity"}
            }
        },
        "dialogState": "COMPLETED"
    },
    "version": "1.0"
}

describe("Testing DecrementQuantity intent", function() {

  describe("valid input without quantity", function() { //Remove this, useless considering Sample Utterances format
      var speechResponse = null
      var speechError = null
      var decrementedItem = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          const testItem = {userId: testUserId, itemName: testItemName, quantity: testQuantity};
          executor.insertItemThenExecute(stewardItems, testItem, input, function(err, resp) {
              if (err) { console.log(err); speechError = err}
              else { speechResponse = resp }
              done()
          })
      })

      it('should not have errored',function() {
          expect(speechError).to.be.null
      })

      it("should have a message saying there aren't any of the item to remove", function() {
        const expected = ssmlWrap(sprintf(strings.QUANTITY_UPDATE, testQuantity - 1, testItemName));
        return expect(speechResponse.response.outputSpeech.ssml).to.be.equal(expected);
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

  })

  describe("valid input with quantity > 1", function() {
      var speechResponse = null
      var speechError = null
      var decrementedItem = null
      var randomQuant = Math.floor((Math.random() * (100 - 2)) + 2);

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = randomQuant
          const testItem = {userId: testUserId, itemName: testItemName, quantity: (randomQuant+2)};
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
        const expected = ssmlWrap(sprintf(strings.QUANTITY_UPDATE, 2, testItemName));
        return expect(speechResponse.response.outputSpeech.ssml).to.be.equal(expected);
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item should have quantity decreased", function() {
          return find(stewardItems, {hash: testUserId, range: testItemName})
          .then(function(resp) {
              decrementedItem = resp
          }).catch(function(err) {
              assert.fail()
          })
      })

      it("item should have quantity decreased by testQuantity", function() {
          expect(decrementedItem.quantity).to.be.equal(2)
      })
  })

  describe("valid input with quantity equal to current database quantity (remove item)", function() {
      var speechResponse = null
      var speechError = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = testQuantity
          const testItem = {userId: testUserId, itemName: testItemName, quantity: testQuantity};
          executor.insertItemThenExecute(stewardItems, testItem, input, function(err, resp) {
              if (err) { console.log(err); speechError = err}
              else { speechResponse = resp }
              done()
          })
      })

      it('should not have errored',function() {
          expect(speechError).to.be.null
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item should have been removed", function() {
        return find(stewardItems, {hash: testUserId, range: testItemName})
        .then(function(resp) {
            expect(resp).to.be.undefined;
        }).catch(function(err) {
            assert.fail()
        })
      })
  })

  describe("valid input with quantity greater than current database quantity (remove item)", function() {
      var speechResponse = null
      var speechError = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = testQuantity + 1
          const testItem = {userId: testUserId, itemName: testItemName, quantity: testQuantity};
          executor.insertItemThenExecute(stewardItems, testItem, input, function(err, resp) {
              if (err) { console.log(err); speechError = err}
              else { speechResponse = resp }
              done()
          })
      })

      it('should not have errored',function() {
          expect(speechError).to.be.null
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item should have been removed", function() {
        return find(stewardItems, {hash: testUserId, range: testItemName})
        .then(function(resp) {
            expect(resp).to.be.undefined;
        }).catch(function(err) {
            assert.fail()
        })
      })
  })

  describe("valid input with quantity 0", function() {
      var speechResponse = null
      var speechError = null
      var decrementedItem = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = 0
          const testItem = {userId: testUserId, itemName: testItemName, quantity: testQuantity};
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
        const expected = ssmlWrap(sprintf(strings.QUANTITY_UPDATE, testQuantity, testItemName));
        return expect(speechResponse.response.outputSpeech.ssml).to.be.equal(expected);
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item should not have quantity decreased", function() {
          return find(stewardItems, {hash: testUserId, range: testItemName})
          .then(function(resp) {
              decrementedItem = resp
          }).catch(function(err) {
              assert.fail()
          })
      })

      it("item should have quantity of testQuantity", function() {
          expect(decrementedItem.quantity).to.be.equal(testQuantity)
      })
  })

  describe("invalid input", function() {
      var speechResponse = null
      var speechError = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          const testItem = {userId: testUserId, itemName: testItemName, quantity: testQuantity};
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

      it("should not have modified the database", function() {
          return find(stewardItems, {hash: testUserId, range: testItemName})
          .then(function(resp) {
             expect(resp.quantity).to.be.equal(testQuantity)
          })
      })
  })
})
