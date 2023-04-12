
// require("../modules/pathfinder");
require("../filters/removeWhite");

Object.assign(fabric.Image.prototype, {
  removeWhite: function (threshold, removeAll, callback) {


    var rwf = _.findWhere(this.filters, {type: 'RemoveWhiteDP'});

    if (rwf) {
      rwf.options.colorThreshold = threshold;
      rwf.options.fromCorners = !removeAll;
    } else {
      rwf = new fabric.Image.filters.RemoveWhiteDP({
        fromCorners: !removeAll,
        blurRadius: 2,
        colorThreshold: threshold
      });
      this.filters.push(rwf);
    }

    var _this = this;
    this.applyFilters(function () {
      //_this.width = _this._element.width;
      //_this.height = _this._element.height;
      _this.canvas.renderAll();
      _this.fire("content:modified", {filter: rwf, bounds: rwf.bounds});
      callback && callback();
    });
  },
  removeWhiteAll: true,

  actions: Object.assign(fabric.Image.prototype.actions, {
    removeWhiteFromBorders: {
      title: 'Remove Background',
      type: 'effect',
      className: "fa fa-dot-circle-o",
      effectTpl: '<button id="select-colors-action-button" class="fa fa-check"></button>' +
      '<input id="select-colors-checkbox" type="checkbox">' +
      '<input id="select-colors-threshold" type="range"   min="1" max="255">',
      actionParameters: function (el, data) {
        var
          actionChk = el.find('#select-colors-checkbox'),
          actionBtn = el.find('#select-colors-action-button');
        data.thresholdEl = el.find('#select-colors-threshold');

        data.removeWhiteAll = actionChk.is(":checked");
        actionChk.change(function () {
          data.removeWhiteAll = actionChk.is(":checked")
        });
        actionBtn.click(function () {
          data.action();
        });
        if (!data.__action) {

          data.__action = data.action;
          data.action = function () {
            data.__action(parseInt(data.thresholdEl.val()), data.removeWhiteAll)
          };
        }
      },
      action: "removeWhite",
      insert: 'imageTools'
    }
  })
});
