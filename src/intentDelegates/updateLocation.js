'use strict';

module.exports = function(handler, table) {

    const slots = handler.event.request.intent.slots

    if (slots.Item && slots.Item.value && slots.Location.value) {
        table
            .find({hash: handler.event.session.user.userId,
                    range: slots.Item.value
                    })
            .then(function(resp){
                if (resp != undefined) {
                    table.update({ hash: handler.event.session.user.userId,
                            range: slots.Item.value
                            }, {location: slots.Location.value})
                    .then(function(resp) {
                        handler.emit('Affirmative');
                    })
                    .catch(function(err) {
                        console.log(err);
                        handler.emit('Error');
                    })
                } else {
                    handler.emit(":tell", handler.t('NO_ITEM_MESSAGE'))
                }
            })
            .catch(function(err){
                console.log(err);
                handler.emit('Error');
            })

    } else {
        console.log("error with itemName slot");
        handler.emit('Error')
    }
}
