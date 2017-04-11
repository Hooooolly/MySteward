'use strict';

const expect = require('chai').expect;
const assert = require('chai').assert;
const languageStrings = require('../languageStrings')
const ssmlWrap = require('./resources/ssmlWrap')
const executor = require('./resources/alexaExecutor')
const dynasty = require('dynasty')({});

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
        }
    },
    "version": "1.0"
}

describe("Testing DecrementQuantity intent", function() {

  describe("valid input without quantity", function() {
      var speechResponse = null
      var speechError = null
      var incrementedItem = null

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
          expect(speechResponse.response.outputSpeech.ssml).to.be.oneOf(strings.AFFIRMATIVE_MESSAGE.map(ssmlWrap))
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("inserted item should have quantity decreased by 1", function() {
          stewardItems.find({hash: testUserId, range: testItemName})
          .then(function(resp) {
              incrementedItem = resp
          }).catch(function(err) {
              assert.fail()
          })
          expect(incrementedItem.quantity).to.be.equal(testQuantity - 1)
      })

  })

  describe("valid input with quantity > 1", function() {
      var speechResponse = null
      var speechError = null
      var incrementedItem = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          var randomQuant = Math.floor((Math.random() * (100 - 2)) + 2);
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = randomQuant
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
          expect(speechResponse.response.outputSpeech.ssml).to.be.oneOf(strings.AFFIRMATIVE_MESSAGE.map(ssmlWrap))
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item should have quantity increased by testQuantity", function() {
          stewardItems.find({hash: testUserId, range: testItemName})
          .then(function(resp) {
              incrementedItem = resp
          }).catch(function(err) {
              assert.fail()
          })
          expect(incrementedItem.quantity).to.be.equal(testQuantity - randomQuant)
      })
  })

  describe("valid input with quantity equal to current database quantity (remove item)", function() {
      var speechResponse = null
      var speechError = null
      var incrementedItem = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = testQuantity
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
          expect(speechResponse.response.outputSpeech.ssml).to.be.oneOf(strings.AFFIRMATIVE_MESSAGE.map(ssmlWrap))
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item should have been removed", function() {
        return stewardItems.find({hash: testUserId, range: testItemName})
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
      var incrementedItem = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = testQuantity + 1
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
          expect(speechResponse.response.outputSpeech.ssml).to.be.oneOf(strings.AFFIRMATIVE_MESSAGE.map(ssmlWrap))
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item should have been removed", function() {
        return stewardItems.find({hash: testUserId, range: testItemName})
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
      var incrementedItem = null

      before(function(done){
          var input = JSON.parse(JSON.stringify(blankInput))
          input.request.intent.slots.Item.value = testItemName
          input.request.intent.slots.Quantity.value = 0
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
          expect(speechResponse.response.outputSpeech.ssml).to.be.oneOf(strings.AFFIRMATIVE_MESSAGE.map(ssmlWrap))
      })

      it("should end the alexa session", function() {
          expect(speechResponse.response.shouldEndSession).not.to.be.null
          expect(speechResponse.response.shouldEndSession).to.be.true
      })

      it("item quantity should be unchanged", function() {
          stewardItems.find({hash: testUserId, range: testItemName})
          .then(function(resp) {
              incrementedItem = resp
          }).catch(function(err) {
              assert.fail()
          })
          expect(incrementedItem.quantity).to.be.equal(testQuantity)
      })
  })

  describe("invalid input", function() {
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

      it("should not have modified the database", function() {
          return stewardItems.find({hash: testUserId, range: testItemName})
          .then(function(resp) {
             expect(resp.quantity).to.be.equal(testQuantity)
          }).catch(function(err) {
              assert.fail()
          })
      })
  })
})
