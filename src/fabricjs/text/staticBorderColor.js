//todo
Object.assign(fabric.Text.prototype,{
    staticBorderColor: false,
    _render_staticBorderColorOverwritten: fabric.Text.prototype.render,
    render: function(ctx, noTransform){
        this._render_staticBorderColorOverwritten(ctx);

        ctx.save();
        if (!noTransform) {
            this.transform(ctx);
        }
        this._drawBorders(ctx);
        ctx.restore();
    },
    _staticBorderColorRender: fabric.IText.prototype._render,
    _drawBorders: function(ctx){

        if(this.canvas && this.canvas._exporting)return;

        if (this.active || !this.staticBorderColor) {
            return;
        }
        ctx.strokeStyle = this.staticBorderColor;
        ctx.strokeRect(
            -this.width / 2,
            -this.height / 2,
            this.width,
            this.height
        );
    }
});
