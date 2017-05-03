'use strict';

module.exports = function(itemArray) {
        if (itemArray.length < 1) {
          return "nothing" //consider making "nothing" an illegal item
        } else if (itemArray.length == 1) {
          return itemArray[0]
        }
        else {
          var returnString = ""
          for (var i = 0; i < itemArray.length; i++) {
              if (i == (itemArray.length - 1)) {
                  returnString = returnString + ", and " + itemArray[i]
              }
                  returnString = returnString + ", " + itemArray[i]
          })
          return returnString
        }
}
