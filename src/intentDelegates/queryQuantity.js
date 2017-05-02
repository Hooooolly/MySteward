'use strict';

const pluralize = require('pluralize');

module.exports = function(handler, table) {

    const slots = handler.event.request.intent.slots

    if (slots.Item && slots.Item.value) {
        table
            .find({ hash: handler.event.session.user.userId,
                    range: slots.Item.value
                    })
            .then(function(resp) {
                if (resp != undefined && resp.quantity != undefined && resp.quantity != 0) {
                    const response = handler.t('QUANTITY_NONZERO', resp.quantity, pluralize(slots.Item.value, parseInt(resp.quantity)))
                  handler.emit(':tell', response);
                }
                else {
                  handler.emit(':tell', handler.t('QUANTITY_ZERO', pluralize(slots.Item.value)));
                }
            })
            .catch(function(err) {
                console.log(err);
                handler.emit('Error');
            });

    } else {
        console.log("error with itemName slot");
        handler.emit('Error')
    }
}
