'use strict';

module.exports = function(handler, table) {

    var record = {
        userId: handler.event.session.user.userId,
        createTime: Math.floor(Date.now() / 1000)
    }

    const slots = handler.event.request.intent.slots

    if (slots.Item && slots.Item.value) {
        record.itemName = slots.Item.value.toLowerCase();

        if (slots.Quantity && slots.Quantity.value) {
            record.quantity = slots.Quantity.value;
        } else {
            record.quantity = 1;
        }

        table
        .insert(record)
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
