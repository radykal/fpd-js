
export default {
  name: "alignment",
  prototypes: {
    StaticCanvas: {
      /**
       * Aligns an element.
       *
       * @method alignElement
       * @param {fabric.Object.ALIGNMENT_OPTIONS} option
       */
      alignElementsInArea(option, elements) {
        let area = this.canvas._getMovementsLimitsRect(this.movementLimits || "canvas", true);
        this.alignElements(option, area, elements)
      },
      alignElements(option, area, elements) {

        let mX = 0, mY = 0;

        let cX = (area.width) / 2 + area.left;
        let cY = (area.height) / 2 + area.top;

        for (let element of elements) {
          let b = element.getBoundingRect(true, true);
          switch (option) {
            case "center":
              mX = b.left - cX + (b.width) / 2;
              mY = b.top - cY + (b.height) / 2;
              break;
            case "center-x":
              mX = b.left - cX + (b.width) / 2;
              break;
            case "center-y":
              mY = b.top - cY + (b.height) / 2;
              break;
            case "left":
              mX = b.left - area.left;
              break;
            case "top":
              mY = b.top - area.top;
              break;
            case "right":
              mX = b.left + b.width - area.left - area.width;
              break;
            case "bottom":
              mY = b.top + b.height - area.top - area.height;
              break;
          }
          element.set({
            left: element.left - mX,
            top: element.top - mY
          });
          element.setCoords();
        }

        this.renderAll();
      }
    },
    ActiveSelection: {
      setAlign(value) {
        let area = {left: -this.width / 2, top: -this.height / 2, width: this.width, height: this.height};
        this.canvas.alignElements(value, area, this._objects);
      },
      getAlign() {
        return "none"
      },
      "+actions": {
        align: {
          title: "align",
          menu: ["alignCenterVertically", "alignCenterHorizontally", "alignTop", "alignBottom", "alignLeft", "alignRight"]
        },
        distributeVertically: {
          title: "distribute vertically",
          className: "fi fi-distribute-v",
          // buttonContent: icons.distributeVertically
        },
        distributeHorizontally: {
          title: "distribute horizontally",
          className: "fi fi-distribute-h",
          // buttonContent: icons.distributeHorizontally
        },
        alignCenterVertically: {
          // buttonContent: icons.alignCenterVertically,
          className: "fi fi-v-align-center",
          title: "vertical-align middle",
          variable: "align",
          option: "center-y"
        },
        alignTop: {
          // buttonContent: icons.svgIconVAlignmentT,
          className: "fi fi-v-align-top",
          title: "vertical-align top",
          variable: "align",
          option: "top"
        },
        alignBottom: {
          // buttonContent: icons.svgIconVAlignmentB,
          className: "fi fi-v-align-bottom",
          title: "vertical-align bottom",
          variable: "align",

          option: "bottom"
        },
        alignCenterHorizontally: {
          // buttonContent: icons.alignCenterHorizontally,
          className: "fi fi-h-align-center",
          title: "align center",
          variable: "align",
          option: "center-x"
        },
        alignLeft: {
          title: "align left",
          // buttonContent: icons.svgIconHAlignmentL,
          className: "fi fi-h-align-left",
          variable: "align",

          option: "left"
        },
        alignRight: {
          // buttonContent: icons.svgIconHAlignmentR,
          className: "fi fi-h-align-right",
          title: "align right",
          variable: "align",

          option: "right"
        }
      }
    }
  }
}
