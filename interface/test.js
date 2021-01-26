let formidable = require('formidable');

var data = {
    remove: {
        method: "delete",
        dbItem: "material",
        callback: function(req, res, dbInfo, db) {


        }
    },
    upload: {
        method: "post",
        dbItem: "material",
        callback: function(req, res, dbInfo, db) {

        }
    }
};

module.exports = data;