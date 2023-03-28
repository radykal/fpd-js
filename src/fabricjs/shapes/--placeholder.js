'use strict';


//fabric.DPI todo why do not use it?

//fabric.require("Placeholder",["Frame","TextFrame","TextAreaMixin","Video"], function(){

  fabric.Placeholder = fabric.util.createClass(fabric.Frame, {
    type: 'placeholder',

    //stateProperties: fabric.Group.prototype.stateProperties.concat(["poster"]),
    _scaling_events_enabled: true,
    fitText: true,
      toObject: function(propertiesToInclude){
          var object = this.callSuper('toObject', propertiesToInclude);
          //if(this.clip){
          //    object.clip = this.clip;
          //}

          return object;
      },
    initialize: function (options) {
        options || ( options = {});

        var _text = options.text;
        delete options.text;
        this.callSuper('initialize', options);


        this.uploadButton = this._create_button({
            text: '',
        });
        if(!this.element){
            this.uploadButton.setVisible(true);
            this.button.setVisible(false);
            this.clipButton.setVisible(false);
        };


        if(this.uploadAction){
            this.uploadButton.on("click",this.uploadAction.bind(this));
        }


        this._initText(_text);

        this.text.setOptions({
            hoverCursor: "text",
            width: this.width,
            height: 60
        });

        this.on("clipping:entered",function(){
            this.text.evented = false;
        });
        this.on("clipping:exited",function(){
            if(this.text)this.text.evented = true;
        });


        this.text.on("editing:exited", function (e) {
            this.text.setOpacity(this.text.text ? 1 : 0);
            this.text.hoverCursor = "text";
            this._update_interface_element_position(this.text,this.textPosition);
        }.bind(this));
        this._create_play();

        this.textPosition = Object.assign({},options.textPosition || this.textPosition);



        var pos = Object.assign({},this.textPosition, {element: this.text});
        this._add_element_to_update(pos);
    },
      stateProperties: fabric.Group.prototype.stateProperties.concat(["poster"]),
      _is_clipping_available : function(e){

          if(e){
              this.text.setCoords();
              if(this.isPossibleTarget(e,this.text)){
                  return;
              }
          }
          return this.element && (this.clippingSupportedTypes == "*" || this.clippingSupportedTypes.indexOf(this.element.type)!= -1);
      },


    clippingSupportedTypes: ["image"], // * or ["image","video",...]
    /**
     * Создание элемента фото
     * @private
     */
    _create_play: function(){

        this.playButton = this._create_button({
            text: ''
        });

        this.playButton.on("click",function(){
            this.element.togglePlayPause();
            this.playButton.setText(this.element.paused? '': "");
        }.bind(this))


        var _self = this;
        //show/hide play/pause hint
        this.on('mouse:over', function(e) {
            if(this.playAvailable){
                this.playButton.setVisible(true);
                _self.canvas.renderAll();
            }
        });
        this.on('mouse:out', function(e) {
            this.playButton.setVisible(false);
            _self.canvas.renderAll();
        });
    },


  uploadAction: function(){
      var self = this;
      fabric.util.uploadImage(function(img){
          self.setElement({
              type: "image",
              src:   this.src,
              original: {
                  width: this.width,
                  height: this.height
              }
          })
      });
  },

    "textPosition": {
        bottom: 0,
        left: 0 ,
        right: 0
    },
    "text": {
        "text": "",
        "backgroundColor": "rgba(255,255,255,0.5)"
    },

    supportedTypes: ["image","video","path"],

      createButtons:function(){

          this._clip_end_function =  function(e){
              if(this.isPossibleTarget(e.e,this.submit)){
                  this.clipPhotoEnd();
              }
          }.bind(this);

          this.on('object:click', function(e) {
              var t = this.searchPossibleTargets(e.e);
              t.target && t.target.fire("click");
          });
          this.submit = this._create_button({
              text: "",
              options: {
                  visible: false
              },
              position:{
                  top: 0,
                  right: 26
              }
          });

          this.submit.on("click",this.clipPhotoEnd.bind(this));

          this.clipButton = this._create_button({
              text: "",
              options: {
                  visible: false
              },
              position:{
                  top: 0,
                  right: 26
              }
          });

          this.clipButton.on("click",this.clipPhotoStart.bind(this));

          //show/hide play/pause hint
          this.on('mouse:over', function(e) {
              if(this.element && !this.element._edited || this._pending){
                  this.button.setOpacity(1);
              }
              if(this._is_clipping_available()){
                  this.clipButton.setOpacity(1);
              }
              this.canvas.renderAll();
          });

          this.on('mouse:out', function(e) {
              if(!this._pending){
                  this.button.setOpacity(0);
              }
              this.clipButton.setOpacity(0);
              this.canvas.renderAll();
          });

          this._create_remove_button();

          if(this.element){
              this._set_element_callback(this.element);
          }

          this.on('added',function(){
              this.canvas.on('mouse:move', function(e) {
                  if(e.target === this || e.target === this.element){
                      var target = this.searchPossibleTargets(e.e).target ;

                      if(target){
                          this.canvas.hoverCursor = target.hoverCursor || "move";
                      }else{
                          this.canvas.hoverCursor = 'move';
                      }
                  }
                  //
                  //if(e.target == this || e.target == this.element &&  this.isPossibleTarget(e.e,this.submit)){
                  //    this.canvas.hoverCursor = 'pointer';
                  //}else{
                  //    this.canvas.hoverCursor = 'move';
                  //}
              }.bind(this));
          });

          this.on("clipping:entered",function(){
              this.submit.setVisible(true);
              this.clipButton.setVisible(false);
              this.button.setVisible(false);
          }.bind(this));

          this.on("clipping:exited",function(){
              this.submit.setVisible(false);
              this.clipButton.setVisible(true);
              this.button.setVisible(true);
          }.bind(this));


          this.on("element:loading",function(){
              this.button.setText("");
              this.button.setVisible(false);
              //this.button.false(val ? 26: 32);
          }.bind(this));

          this.on("element:loaded",function(){
              this.button.setText("");
              this.button.setVisible(true);
              //this.button.setFontSize(val ? 26: 32);
          }.bind(this));

          this.on("element:loaded",function(){

              if(this._is_clipping_available()) {
                  this.clipButton.setVisible(true);
                  this.button.setVisible(true);
                  this.element.on("dblclick", this.clipPhotoEnd.bind(this));
              }
          })
      },

      _create_button : function(data){
          var btn = new fabric.Text(data.text || "", Object.assign({
              originX: "center",
              originY: "center",
              visible: false,
              width: 16,
              height: 16,
              fontSize: 26,
              fontFamily: "FontAwesome",
              fill: "white",
              shadow: { color: '#000', offsetX: 1,offsetY : 1,blur: 5 },
              hoverCursor: "pointer"
          },data.options));

          this._add_element_to_update(Object.assign({
              element: btn
          },data.position));

          this.add(btn);

          btn.setCoords();
          return btn;
      },

    _remove_element: function(){

        if(this.element){
            if(this.element.type == "video"){
                this.playAvailable = false;
                // this.element.mediaElement.pause();
                // this.element.mediaElement.currentTime = 0;
                this.paused = true;
                //    delete this.element.mediaElement;
            }
            this.uploadButton.setVisible(true);
            this.text.setVisible(false);
        }
    },
    _set_element: function(options,callback){

        this.text && this.text.setVisible(true);
        this.uploadButton && this.uploadButton.setVisible(false);
        if(options.type == "image"){
            this._original = options.original;
            fabric.Image.fromURL(options.src,function(o){
                o.on("rotating", fabric.util.stepRotating.bind(o));
                callback(o);
            }.bind(this));
        }
        if(options.type == "video"){
            this._original = options.original;
            options.originX = "center";
            options.originY = "center";
            options.width = options.width || options.original.width;
            options.height = options.height || options.original.height;

            var el = fabric.Video.fromObject(options);



            el.on("rotating", fabric.util.stepRotating.bind(el));
            el.on("ready", function(){
                this.playAvailable = true;
            }.bind(this));
            callback(el);
        }

    }

});


    Object.assign(fabric.Placeholder.prototype,fabric.TextAreaMixin);
    fabric.util.createAccessors(fabric.Placeholder);
    /**
     * @author Denis Ponomarev
     * @email den.ponomarev@gmail.com
     */
    fabric.Placeholder.fromObject = function(object, callback) {

        var instance = new fabric.Placeholder(object);
        callback && callback(instance);
    };
