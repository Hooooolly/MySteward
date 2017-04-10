'use strict';

const createItem = require('./../helperDelegates/createItem');

module.exports = function(handler, table) {

    const slots = handler.event.request.intent.slots
    var baseQuantity = 1;
    var addedQuantity = 1;

    if (slots.Item && slots.Item.value)
        table
        .find({ hash: handler.event.session.user.userId
                range: slots.Item.value
                })
        .then(function(resp) {
            if (resp != undefined) {
              createItem(handler, table);
            } else {
              if (resp.quantity != undefined) {
                baseQuantity = resp.quantity;
              }
            }
        })

      if (slots.Quantity && slots.Quantity.value) {
        addedQuantity = slots.Quantity.value;
      }
      table
      .update({hash: handler.event.session.user.userId, range: slots.Item.value.toLowerCase()}, { quantity: baseQuantity + addedQuantity })
      .then(function(resp) {
          handler.emit('Affirmative');
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
