(function (global){

  "use strict";

  var fabric=global.fabric||(global.fabric={}),
    extend=Object.assign,
    clone=fabric.util.clone;

  if(fabric.CurvedText){
    console.warn('fabric.CurvedText is already defined');
    return;
  }
  var stateProperties=fabric.Text.prototype.stateProperties.concat();
  stateProperties.push(
    'radius',
    'spacing',
    'reverse',
    'effect',
    'range',
    'largeFont',
    'smallFont'
  );
  var _dimensionAffectingProps=fabric.Text.prototype._dimensionAffectingProps
    .concat(['radius','spacing','reverse','fill','effect','width','height','range','fontSize','shadow','largeFont','smallFont']);

  var letterProperties = [
    'backgroundColor',
    'textBackgroundColor',
    'textDecoration',
    'stroke',
    'fill',
    'strokeWidth',
    'fontSize',
    'fontFamily',
    'shadow',
    'fontWeight',
    'overline',
    'underline',
    'linethrough',
    'lineHeight',
    'fontStyle'
  ];



  /**
   * Group class
   * @class fabric.CurvedText
   * @extends fabric.Text
   * @mixes fabric.Collection
   */
  fabric.CurvedText=fabric.util.createClass(fabric.Text, fabric.Collection, /** @lends fabric.CurvedText.prototype */ {
    /**
     * Type of an object
     * @type String
     * @default
     */
    type: 'curvedText',
    /**
     * The radius of the curved Text
     * @type Number
     * @default 50
     */
    radius: 50,
    /**
     * Special Effects, Thanks to fahadnabbasi
     * https://github.com/EffEPi/fabric.curvedText/issues/9
     */
    range: 5,
    smallFont: 10,
    largeFont: 30,
    effect: 'curved',
    /**
     * Spacing between the letters
     * @type fabricNumber
     * @default 20
     */
    spacing: 20,
//		letters: null,

    /**
     * Reversing the radius (position of the original point)
     * @type Boolean
     * @default false
     */
    reverse: false,
    /**
     * List of properties to consider when checking if state of an object is changed ({@link fabric.Object#hasStateChanged})
     * as well as for history (undo/redo) purposes
     * @type Array
     */
    stateProperties: stateProperties,
    /**
     * Properties that are delegated to group objects when reading/writing
     * @param {Object} delegatedProperties
     */
    // delegatedProperties: delegatedProperties,
    /**
     * Properties which when set cause object to change dimensions
     * @type Object
     * @private
     */
    _dimensionAffectingProps: _dimensionAffectingProps,
    /**
     *
     * Rendering, is we are rendering and another rendering call is passed, then stop rendering the old and
     * rendering the new (trying to speed things up)
     */
    _isRendering: 0,
    /**
     * Added complexity
     */
    complexity: function (){
      this.callSuper('complexity');
    },
    initialize: function (text, options){
      options||(options={});
      this.__skipDimension=true;
      delete options.text;
      this.setOptions(options);
      this.__skipDimension=false;

      if(parseFloat(fabric.version) >= 2) {
        this.callSuper('initialize', text, options);
      }

      this.letters=new fabric.Group([], {
        selectable: false,
        padding: 0
      });
      this.setText(text);
      // this.render(this.ctx,true);
    },
    setText: function (text){
      if(this.letters){
        while(this.letters.size()){
          this.letters.remove(this.letters.item(0));
        }
        for(var i=0; i<text.length; i++){
          //I need to pass the options from the main options
          if(this.letters.item(i)===undefined){
            this.letters.add(new fabric.Text(text[i]));
          }else{
            this.letters.item(i).text = text[i];
          }
        }
      }
      this.text = text;

      var i = this.letters.size();
      while(i--){
        var letter = this.letters.item(i);

        for(var keyIndex = 0; keyIndex < letterProperties.length; keyIndex ++){
          var prop = letterProperties[keyIndex];
          letter.set(prop, this[prop]);
        }
      }

      this._updateLetters();

      this.canvas && this.canvas.renderAll();
    },
    _initDimensions: function (ctx){
      // from fabric.Text.prototype._initDimensions
      // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
      if(this.__skipDimension){
        return;
      }
      if(!ctx){
        ctx=fabric.util.createCanvasElement().getContext('2d');
        this._setTextStyles(ctx);
      }
      this._textLines=this.text.split(this._reNewline);
      this._clearCache();
      var currentTextAlign=this.textAlign;
      this.textAlign='left';
      this.width=this.get('width');
      this.textAlign=currentTextAlign;
      this.height=this.get('height');
      // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
      this._updateLetters();
    },
    _updateLetters: function (){
      var renderingCode=fabric.util.getRandomInt(100, 999);
      this._isRendering=renderingCode;
      if(this.letters && this.text){
        var curAngle=0,
          curAngleRotation=0,
          angleRadians=0,
          align=0,
          textWidth=0,
          space=parseInt(this.spacing),
          fixedLetterAngle=0;

        //get text width
        if(this.effect==='curved'){
          for(var i=0, len=this.text.length; i<len; i++){
            textWidth+=this.letters.item(i).width+space;
          }
          textWidth-=space;
        }else if(this.effect==='arc'){
          fixedLetterAngle=((this.letters.item(0).fontSize+space)/this.radius)/(Math.PI/180);
          textWidth=((this.text.length+1)*(this.letters.item(0).fontSize+space));
        }
        // Text align
        if(this.get('textAlign')==='right'){
          curAngle=90-(((textWidth/2)/this.radius)/(Math.PI/180));
        }else if(this.get('textAlign')==='left'){
          curAngle=-90-(((textWidth/2)/this.radius)/(Math.PI/180));
        }else{
          curAngle=-(((textWidth/2)/this.radius)/(Math.PI/180));
        }
        if(this.reverse)
          curAngle=-curAngle;

        var width=0,
          multiplier=this.reverse?-1:1,
          thisLetterAngle=0,
          lastLetterAngle=0;

        for(var i=0, len=this.text.length; i<len; i++){
          if(renderingCode!==this._isRendering)
            return;
          var letter = this.letters.item(i);

          for(var keyIndex = 0; keyIndex < letterProperties.length; keyIndex ++){
            var prop = letterProperties[keyIndex];
            letter.set(prop, this[prop]);
          }

          letter.set('left', (width));
          letter.set('top', (0));
          letter.set('angle',0);
          letter.set('padding', 0);

          if(this.effect==='curved'){
            thisLetterAngle=((letter.width+space)/this.radius)/(Math.PI/180);
            curAngle=multiplier*((multiplier*curAngle)+lastLetterAngle);
            angleRadians=curAngle*(Math.PI/180);
            lastLetterAngle=thisLetterAngle;

            letter.set('angle',curAngle);
            letter.set('top', multiplier*-1*(Math.cos(angleRadians)*this.radius));
            letter.set('left', multiplier*(Math.sin(angleRadians)*this.radius));
            letter.set('padding', 0);
            letter.set('selectable', false);

          }else if(this.effect==='arc'){//arc
            curAngle=multiplier*((multiplier*curAngle)+fixedLetterAngle);
            angleRadians=curAngle*(Math.PI/180);

            letter.set('top', multiplier*-1*(Math.cos(angleRadians)*this.radius));
            letter.set('left', multiplier*(Math.sin(angleRadians)*this.radius));
            letter.set('padding', 0);
            letter.set('selectable', false);
          }else if(this.effect==='STRAIGHT'){//STRAIGHT
            //var newfont=(i*5)+15;
            //letter.set('fontSize',(newfont));
            letter.set('left', (width));
            letter.set('top', (0));
            letter.set('angle',0);
            width+=letter.get('width');
            letter.set('padding', 0);
            letter.set({
              borderColor: 'red',
              cornerColor: 'green',
              cornerSize: 6,
              transparentCorners: false
            });
            letter.set('selectable', false);
          }else if(this.effect==='smallToLarge'){//smallToLarge
            var small=parseInt(this.smallFont);
            var large=parseInt(this.largeFont);
            //var small = 20;
            //var large = 75;
            var difference=large-small;
            var center=Math.ceil(this.text.length/2);
            var step=difference/(this.text.length);
            var newfont=small+(i*step);

            //var newfont=(i*this.smallFont)+15;

            letter.set('fontSize', (newfont));

            letter.set('left', (width));
            width+=letter.get('width');
            //letter.set('padding', 0);
            /*letter.set({
                         borderColor: 'red',
                         cornerColor: 'green',
                         cornerSize: 6,
                         transparentCorners: false
                         });*/
            letter.set('padding', 0);
            letter.set('selectable', false);
            letter.set('top', -1*letter.get('fontSize')+i);
            //this.letters.width=width;
            //this.letters.height=letter.get('height');

          }else if(this.effect==='largeToSmallTop'){//largeToSmallTop
            var small=parseInt(this.largeFont);
            var large=parseInt(this.smallFont);
            //var small = 20;
            //var large = 75;
            var difference=large-small;
            var center=Math.ceil(this.text.length/2);
            var step=difference/(this.text.length);
            var newfont=small+(i*step);
            //var newfont=((this.text.length-i)*this.smallFont)+12;
            letter.set('fontSize', (newfont));
            letter.set('left', (width));
            width+=letter.get('width');
            letter.set('padding', 0);
            letter.set({
              borderColor: 'red',
              cornerColor: 'green',
              cornerSize: 6,
              transparentCorners: false
            });
            letter.set('padding', 0);
            letter.set('selectable', false);
            letter.top=-1*letter.get('fontSize')+(i/this.text.length);

          }else if(this.effect==='largeToSmallBottom'){
            var small=parseInt(this.largeFont);
            var large=parseInt(this.smallFont);
            //var small = 20;
            //var large = 75;
            var difference=large-small;
            var center=Math.ceil(this.text.length/2);
            var step=difference/(this.text.length);
            var newfont=small+(i*step);
            //var newfont=((this.text.length-i)*this.smallFont)+12;
            letter.set('fontSize', (newfont));
            letter.set('left', (width));
            width+=letter.get('width');
            letter.set('padding', 0);
            letter.set({
              borderColor: 'red',
              cornerColor: 'green',
              cornerSize: 6,
              transparentCorners: false
            });
            letter.set('padding', 0);
            letter.set('selectable', false);
            //letter.top =-1* letter.get('fontSize')+newfont-((this.text.length-i))-((this.text.length-i));
            letter.top=-1*letter.get('fontSize')-i;

          }else if(this.effect==='bulge'){//bulge
            var small=parseInt(this.smallFont);
            var large=parseInt(this.largeFont);
            //var small = 20;
            //var large = 75;
            var difference=large-small;
            var center=Math.ceil(this.text.length/2);
            var step=difference/(this.text.length-center);
            if(i<center)
              var newfont=small+(i*step);
            else
              var newfont=large-((i-center+1)*step);
            letter.set('fontSize', (newfont));

            letter.set('left', (width));
            width+=letter.get('width');

            letter.set('padding', 0);
            letter.set('selectable', false);

            letter.set('top', -1*letter.get('height')/2);
          }
        }

        var scaleX=this.letters.get('scaleX');
        var scaleY=this.letters.get('scaleY');
        var angle=this.letters.get('angle');

        this.letters.set('scaleX', 1);
        this.letters.set('scaleY', 1);
        this.letters.set('angle', 0);

        // Update group coords
        this.letters._calcBounds();
        this.letters._updateObjectsCoords();
        //this.letters.saveCoords();
        // this.letters.render(ctx);

        this.letters.set('scaleX', scaleX);
        this.letters.set('scaleY', scaleY);
        this.letters.set('angle', angle);

        this.width=this.letters.width;
        this.height=this.letters.height;
        this.letters.left= -(this.letters.width/2);
        this.letters.top= -(this.letters.height/2);
//				console.log('End rendering')
      }
    },
    render: function (ctx){
      // do not render if object is not visible
      if(!this.visible)
        return;
      if(!this.letters)
        return;


      ctx.save();

      // if(noTransform){
      this.transform(ctx);
      // }

      var groupScaleFactor=Math.max(this.scaleX, this.scaleY);

      this.clipTo&&fabric.util.clipContext(this, ctx);

      //The array is now sorted in order of highest first, so start from end.
      for(var i=0, len=this.letters.size(); i<len; i++){
        var object=this.letters.item(i),
          originalScaleFactor=object.borderScaleFactor,
          originalHasRotatingPoint=object.hasRotatingPoint;

        // do not render if object is not visible
        if(!object.visible)
          continue;

//				object.borderScaleFactor=groupScaleFactor;
//				object.hasRotatingPoint=false;

        object.render(ctx);
//				object.borderScaleFactor=originalScaleFactor;
//				object.hasRotatingPoint=originalHasRotatingPoint;
      }
      this.clipTo&&ctx.restore();

      //Those lines causes double borders.. not sure why
//			if(!noTransform&&this.active){
//				this.drawBorders(ctx);
//				this.drawControls(ctx);
//			}
      ctx.restore();
      this.setCoords();
    },
    /**
     * @private
     */
    _set: function (key, value){
      if(key === "text"){
        this.setText(value);
        return;
      }
      this.callSuper('_set', key, value);
      if(this.text && this.letters){
        if(letterProperties.indexOf(key) !== -1){
          var i = this.letters.size();
          while(i--){
            this.letters.item(i).set(key, value);
          }
        }
        //Properties are delegated with the object is rendered
//				if (key in this.delegatedProperties) {
//					var i = this.letters.size();
//					while (i--) {
//						this.letters.item(i).set(key, value);
//					}
//				}
        if(this._dimensionAffectingProps.indexOf(key) !== -1){
          this._updateLetters();
          //this._initDimensions();
          this.setCoords();
        }
      }
    },
    initDimensions: function() {

    },
    toObject: function (propertiesToInclude){
      var object = extend(this.callSuper('toObject', propertiesToInclude), {
        radius: this.radius,
        spacing: this.spacing,
        reverse: this.reverse,
        effect: this.effect,
        range: this.range,
        smallFont: this.smallFont,
        largeFont: this.largeFont
        //letters: this.letters	//No need to pass this, the letters are recreated on the fly every time when initiated
      });

      if(!this.includeDefaultValues){
        this._removeDefaultValues(object);
      }
      return object;
    },
    /**
     * Returns string represenation of a group
     * @return {String}
     */
    toString: function (){
      return '#<fabric.CurvedText ('+this.complexity()+'): { "text": "'+this.text+'", "fontFamily": "'+this.fontFamily+'", "radius": "'+this.radius+'", "spacing": "'+this.spacing+'", "reverse": "'+this.reverse+'" }>';
    },
    /* _TO_SVG_START_ */
    /**
     * Returns svg representation of an instance
     * @param {Function} [reviver] Method for further parsing of svg representation.
     * @return {String} svg representation of an instance
     */
    toSVG: function (reviver){
      var markup=[
        '<g ',
        'transform="', this.getSvgTransform(),
        '">'
      ];
      if(this.letters){
        for(var i=0, len=this.letters.size(); i<len; i++){
          markup.push(this.letters.item(i).toSVG(reviver));
        }
      }
      markup.push('</g>');
      return reviver?reviver(markup.join('')):markup.join('');
    }
    /* _TO_SVG_END_ */
  });

  /**
   * Returns {@link fabric.CurvedText} instance from an object representation
   * @static
   * @memberOf fabric.CurvedText
   * @param {Object} object Object to create a group from
   * @param {Object} [options] Options object
   * @return {fabric.CurvedText} An instance of fabric.CurvedText
   */
  // fabric.CurvedText.fromObject=function (object){
  //   var obj =  new fabric.CurvedText(object.text, clone(object));
  //   return obj;
  // };

  fabric.CurvedText.fromObject = function(object, callback) {
    return fabric.Object._fromObject("CurvedText", object, callback,"text");
  };

  // fabric.util.createAccessors(fabric.CurvedText);

  /**
   * Indicates that instances of this type are async
   * @static
   * @memberOf fabric.CurvedText
   * @type Boolean
   * @default
   */
  fabric.CurvedText.async=false;

})(typeof exports!=='undefined'?exports:this);


