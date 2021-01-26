let formidable = require('formidable');

var data = {
    getSomething: {
        method: "get",
        dbItem: "material",
        callback: function(req, res, dbInfo, db) {


        }
    },
    updateSomething: {
        method: "post",
        dbItem: "material",
        callback: function(req, res, dbInfo, db) {

        }
    }
}

module.exports = data;