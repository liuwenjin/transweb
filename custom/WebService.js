var WebService = function (app, origin, other, dataDealer, params) {
  this.app = app;
  this.origin = origin;
  this.other = other;
  this.dataDealer = dataDealer;
  this.params = params;
  for (var i in origin.data.cardData) {	
    var item = origin.data.cardData[i]; 
    this.addItem(item, this.other);
  }
  for (var i in other.data.cardData) {	 
    var item = other.data.cardData[i];
	item.dataDealer = this.dataDealer;  
	item.params = this.params; 
	// console.log(item);
    this.addItem(item);
  }
}

WebService.prototype.addItem = function (task, config) {
  var method = task.method || "get";
  var _self = this;
  //when config is not defined, the interface created can access this service 
  task.config = config;
  if(task.config) {
	task.service = this;	  
  }
  this.app[task.method](task.url, function (req, res) {
    task.callback(req, res, task);
  });  
}

exports.create = function (app, origin, other, dataDealer, params) {
  return new WebService(app, origin, other, dataDealer, params);
};
