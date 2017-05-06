'use strict';

const pluralize = require('pluralize');

module.exports = function(handler, table) {

  const slots = handler.event.request.intent.slots
  var setQuantity = 1;

  if (slots.Item && slots.Item.value) {
    table
    .find({ hash: handler.event.session.user.userId,
      range: slots.Item.value
    })
    .then(function(resp) {
      if (resp == undefined) {
        var record = {
          userId: handler.event.session.user.userId,
          createTime: Date.now()
        }

        const slots = handler.event.request.intent.slots

        if (slots.Item && slots.Item.value) {
          record.itemName = slots.Item.value.toLowerCase();

          if (slots.Quantity && slots.Quantity.value) {
            record.quantity = parseInt(slots.Quantity.value);
          } else {
            record.quantity = 1;
          }
          if (slots.Location && slots.Location.value) {
            record.location = slots.Location.value
          }

          table
          .insert(record)
          .then(function(resp) {
            var response = handler.t('QUANTITY_UPDATE', record.quantity, pluralize(slots.Item.value, parseInt(record.quantity)))
            if (record.location != undefined) {
              response = handler.t('QUANTITY_LOCATION_UPDATE', record.quantity, pluralize(slots.Item.value, parseInt(record.quantity)), record.location)
            }
            handler.emit(':tell', response);
          })
          .catch(function(err) {
            console.log(err);
            handler.emit('Error');
          });

        } else {
          console.log("error with itemName slot");
          handler.emit('Error')
        }
      } else {
        var updateRecord = {};
        if (slots.Quantity && slots.Quantity.value) {
          updateRecord.quantity = parseInt(slots.Quantity.value);
        } else {
          updateRecord.quantity = 1
        }
        if (slots.Location && slots.Location.value) {
          updateRecord.location = slots.Location.value
        }
        table
        .update({hash: handler.event.session.user.userId, range: slots.Item.value.toLowerCase()}, updateRecord)
        .then(function(resp) {
          var response = handler.t('QUANTITY_UPDATE', updateRecord.quantity, pluralize(slots.Item.value, parseInt(updateRecord.quantity)))
          if (updateRecord.location != undefined) {
            response = handler.t('QUANTITY_LOCATION_UPDATE', updateRecord.quantity, pluralize(slots.Item.value, parseInt(updateRecord.quantity)), updateRecord.location)
          }
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
