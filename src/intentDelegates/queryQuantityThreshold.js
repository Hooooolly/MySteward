'use strict';

module.exports = function(handler, table) {

    const slots = handler.event.request.intent.slots
    var returnedItems = [];

    if (slots.Quantity && slots.Quantity.value) {
        table
            .findAll(handler.event.session.user.userId)
            .then(function(userItems) {
                if (userItems != undefined) {
                    userItems.forEach(function(item) {
                        if (item.quantity < slots.Quantity.value) {
                            returnedItems.push(item.itemName) // pluralize this when emitting for more natural response
                        }
                    });
                    handler.emit(':tell', handler.t('THRESHOLD_GROUP', slots.Quantity.value, parseItemsIntoString(returnedItems)));
                }
                else {
                  handler.emit(':tell', handler.t('THRESHOLD_NONE', slots.Quantity.value))
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
