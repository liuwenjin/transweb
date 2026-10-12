transweb_appGallery({
  task: {
    data: {
      template: "",
      gap: 20,
      base: 300,
      height: 180,
      line: 10,
      column: 5,
      height: 300,
      items: [],
      // style: "padding: 0px 10px 10px 10px; cursor: pointer; background-color: #fff; border-radius: 5px; height: 100%; text-align: center;",
      style: "cursor: pointer; background-color: #fff; border-radius: 5px; height: 100%; text-align: center;",
      selectType: "",
      selected: -1,
      count: 50
    },
    handleClickContent: function (index, tSelector) {
      console.log(index);
    },
    initContent: function (selector, d, t) {
      console.log(selector);
    },
    template: `<div style="position: relative; float: left; width: 100%; padding-right: 8px;">
                  <div  class="row no-gutters row-cols-{{column}}">
                      <template x-for="i in (items.length || count)">
                        <div  class="col pr-2 pb-2" x-bind:style="'height: ' + height + 'px;'">
                        <template x-if="selectType === 'checkbox' || selectType === 'radio'">  
                          <input x-bind:checked="selected === i || (selected.indexOf && selected.indexOf(i) !== -1)" style="position: absolute; left: 30px; top: 10px; z-index: 9999;" x-bind:type="selectType" name="selectedItem" x-bind:value="i" class="form-check-input">
                        </template>  
                        <div class="contentContainer" x-bind:style="style" x-bind:index="i">  
                            <div style="width: 100%; height: 100%;" x-html="template || i"></div>
                          </div>
                        </div>
                      </template>  
                  </div>
                </div>`,
    promise: {
      beforeRender: function (c, d, t) {
        if(d.base) {
          d.column = Math.floor($(c).width() / d.base) || 1;
        }

      },
      afterRender: function (c, d, t) {
        setTimeout(function () {
          var tSelector = $(c).find(".contentContainer");
          if (typeof (t.initContent)) {
            t.initContent(tSelector, d, t);
          }

          // var tWidth =tSelector.width() - d.gap * (d.column - 1)/d.column;
          // $(c).find(".col").width(tWidth);

          tSelector.find("input[name=selectedItem]").on("click", function(e){
            // e.preventDefault();
            // return false;
          })

          tSelector.on("click", function(){
            var index = $(this).attr("index");
            if(t.data.selectType === "radio") {
              tSelector.find("input[name=selectedItem]").prop("checked", false);
            }
            $(this.parentNode).find("input[name=selectedItem]").prop("checked", true);
            if (typeof (t.handleClickContent)) {
              t.handleClickContent(index, tSelector);
            }
            return false;
          });

        }, 200);
      }
    }
  }

})