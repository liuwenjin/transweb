var data = {
	type: "service",
	cardData: [{
		url: "/addService",
		method: "post",
		callback: function (req, res, task) {
			console.log(task.config);
		}
	}, {
		url: "/tServiceList",
		method: "get",
		callback: function (req, res, task) {
			var data = {};
			var cardData = task.config.data.cardData;
			for (var i = 0; i < cardData.length; i++) {
				if (cardData[i].cardName) {
					data[cardData[i].cardName] = {
						url: cardData[i].url,
						method: cardData[i].method
					}
				}
			}
			res.json({
				ret: 0,
				time: (new Date()).getTime(),
				data: data
			});
		}
	}, {
		url: "/editService",
		method: "post",
		callback: function (req, res, task) {
			console.log(task.config);
		}
	}, {
		url: "/removeService",
		method: "post",
		callback: function (req, res, task) {
			console.log(task.config);
		}
	}]
}

module.exports = data;