transweb_cn({
  task: {
    data: {
      message: "Module B"
    },
    template: '<div style="width: 100%; height: 100%;  position: relative;">Hello, {{message}}</div>',
    promise: {
      beforeRender: function (container, data, task) {

      },
      afterRender: function (container, data, task) {
        

      }
    }
  }
});