'use strict';

const Alexa = require('alexa-sdk');
const dynasty = require('dynasty')({});
const pluralize = require('pluralize');
const languageStrings = require('./languageStrings');
const setQuantity = require('./intentDelegates/setQuantity');
const queryQuantity = require('./intentDelegates/queryQuantity');
const removeItem = require('./intentDelegates/removeItem');
const queryCreateTime = require('./intentDelegates/queryCreateTime');
const incrementQuantity = require('./intentDelegates/incrementQuantity')
const decrementQuantity = require('./intentDelegates/decrementQuantity')
const queryLocation = require('./intentDelegates/queryLocation');
const updateLocation = require('./intentDelegates/updateLocation');

const APP_ID = "amzn1.ask.skill.8371afd6-d231-4b54-bf1d-5987733228cd";
const stewardItems = dynasty.table('Steward_Items');

const handlers = {

    'SetQuantity': function() { setQuantity(this, stewardItems) },

    'RemoveItem': function() { removeItem(this, stewardItems) },

    'QueryQuantity': function() { queryQuantity(this, stewardItems) },

	'QueryCreateTime' : function() { queryCreateTime(this, stewardItems) },

    'IncrementQuantity': function() { incrementQuantity(this, stewardItems) },

    'DecrementQuantity': function() { decrementQuantity(this, stewardItems) },

    'QueryLocation': function() { queryLocation(this, stewardItems) },

    'UpdateLocation': function() { updateLocation(this, stewardItems) },

    'Affirmative': function() {
        const responses = this.t('AFFIRMATIVE_MESSAGE');
        const idx = Math.floor(Math.random() * responses.length);
        this.emit(':tell', responses[idx]);
    },

    'Error': function() {
        this.emit(':tell', this.t('ERROR_MESSAGE'))
    },

    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMT');
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', this.attributes.speechOutput, this.attributes.repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings.strings;

    // modify event to singualar items
    if (event.request.intent.slots.Item.value) {
        event.request.intent.slots.Item.value = pluralize.singular(event.request.intent.slots.Item.value)
    }
    alexa.registerHandlers(handlers);
    alexa.execute();
};
