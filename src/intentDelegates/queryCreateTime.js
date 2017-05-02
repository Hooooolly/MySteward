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
                const pluralName = pluralize(slots.Item.value)

                if (resp != undefined && resp.createTime != undefined) {
					// rounding accounts for daylight savings
					var timeDiff = Math.round((Date.now() - resp.createTime)/(1000*60*60*24))
					handler.emit(':tell', handler.t('TIME_MESSAGE', pluralName, timeDiff));
                }
                else {

					handler.emit(':tell', handler.t('NOTIME_MESSAGE', pluralName));
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
