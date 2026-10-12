var data = {
	updateItems: function(db, tableName, condition, set, callback) {
		var dbItem = db.db();
		var tObject = dbItem.collection(tableName);
		tObject.updateOne(condition, {
			$set: set
		}, function (err, result) {
			db.close();
			if (err) throw err;
			if (typeof (callback) === "function") {
				callback(err, result, db);
			}
		})
	},
	findItems: function (db, tableName, condition, config, callback) {
		var dbItem = db.db();
		var tObject = dbItem.collection(tableName);
		var temp = tObject.find(condition);
		config = config || {
			pageSize: 10,
			pageNo: 0
		}
		temp.skip(config.pageSize * config.pageNo).limit(config.pageSize).toArray(function (err, result) {
			if (err) {
				console.log(tableName, config, "数据库操作失败");
			}
			if (typeof (callback) === "function") {
				callback(err, result, db);
			}
		})
	},
	addItem: function (db, tableName, data, callback) {
		var dbItem = db.db();
		var tObject = dbItem.collection(tableName);
		if (data.constructor.name !== "Array") {
			data = [data];
		}
		tObject.insertMany(data, function (err, result) {
			if (err) throw err;
			if (typeof (callback) === "function") {
				callback(err, result, db);
			}
		})
	}
}

exports.data = data;