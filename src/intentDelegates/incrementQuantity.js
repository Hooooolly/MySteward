'use strict';

const pluralize = require('pluralize');

module.exports = function(handler, table) {

    const slots = handler.event.request.intent.slots
    var baseQuantity = 1;
    var addedQuantity = 1;
    var skip = false;

    if (slots.Item && slots.Item.value) {
        table
        .find({ hash: handler.event.session.user.userId,
                range: slots.Item.value
                })
        .then(function(resp) {
            if (resp == undefined) {
                handler.emit('SetQuantity')
            } else {
              if (resp.quantity != undefined) {
                baseQuantity = resp.quantity;
              }
              if (slots.Quantity && slots.Quantity.value) {
                addedQuantity = parseInt(slots.Quantity.value);
              } else if (slots.Quantity.value == 0) {
                addedQuantity = 0;
              }
              var total = eval(baseQuantity) + eval(addedQuantity);
              table
              .update({hash: handler.event.session.user.userId, range: slots.Item.value.toLowerCase()}, { quantity: total })
              .then(function(resp) {
                var response = handler.t('QUANTITY_UPDATE', total, pluralize(slots.Item.value, total))
                handler.emit(':tell', response);
              })
              .catch(function(err) {
                  console.log(err);
                  handler.emit('Error');
              });
            }
        })



    } else {
        console.log("error with itemName slot");
        handler.emit('Error')
    }
}
