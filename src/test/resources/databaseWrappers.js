'use strict';

const index = require('../../index');
const dynasty = require('dynasty')({});
const pluralize = require('pluralize');

module.exports = {
    delete: function(table, item) {
        if (item.range) {
            item.range = pluralize.singular(item.range);
        } else {
            console.log("database wrapper singularize problem")
        }
        return table.remove(item)
    },

    insert: function(table, item) {
        if (item.itemName) {
            item.itemName = pluralize.singular(item.itemName);
        } else {
            console.log("database wrapper singularize problem")
        }
        return table.insert(item)
    },

    find: function(table, item) {
        if (item.range) {
            item.range = pluralize.singular(item.range);
        } else {
            console.log("database wrapper singularize problem")
        }
        return table.find(item)
    },
}
