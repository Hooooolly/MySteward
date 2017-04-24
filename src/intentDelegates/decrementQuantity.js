'use strict';

const removeItem = require('./removeItem');

module.exports = function(handler, table) {

    const slots = handler.event.request.intent.slots
    var baseQuantity = 1;
    var removedQuantity = 1;

    if (slots.Item && slots.Item.value) {
        table
        .find({ hash: handler.event.session.user.userId,
                range: slots.Item.value
                })
        .then(function(resp) {
            if (resp == undefined) {
              handler.emit(':tell', handler.t('QUANTITY_ZERO', slots.Item.value.toLowerCase()));
            } else {
              if (resp.quantity != undefined) {
                baseQuantity = resp.quantity;
              }
              if (slots.Quantity && slots.Quantity.value) {
                removedQuantity = slots.Quantity.value;
              }
              else if (slots.Quantity.value == 0) {
                removedQuantity = 0;
              }
              var finalQuantity = eval(baseQuantity) - eval(removedQuantity);
              if (finalQuantity <= 0) {
                removeItem(handler, table);
              } else {
                table
                .update({hash: handler.event.session.user.userId, range: slots.Item.value.toLowerCase()}, { quantity: finalQuantity })
                .then(function(resp) {
                    handler.emit('Affirmative');
                })
                .catch(function(err) {
                    console.log(err);
                    handler.emit('Error');
                });
              }
            }
        })

    } else {
        console.log("error with itemName slot");
        handler.emit('Error')
    }
}
