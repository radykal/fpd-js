/**
 * Video Object library for FabricJS
 *
 * Extension of Group object.
 * Allow to create Video objects , play video by clicking on them.
 * Works with object events from fabric.canvasEx library.
 *
 *
 * @example
 nnew fabric.Video({
         left: 100,
         top: 100,
         width: 800,
         height: 600,
         poster: "path/to/poster.png",
         sources :{"video/mp4": "video.mp4",  "video/ogg": "video.ogv"}
     })
 *
 * @author Denis Ponomarev
 * @email den.ponomarev@gmail.com
 */
'use strict';



fabric.Video = fabric.util.createClass(fabric.Group, {
  type: 'video',

  stateProperties: fabric.Group.prototype.stateProperties.concat(["poster"]),

  initialize: function (options) {
    options || ( options = {});
    this.paused = true;
    this.callSuper('initialize', [], options);
    this.set('poster', options.poster || false);
    this.set('sources', options.sources || {});
    this.createPoster();
    this.loadVideo();
  },

  toObject: function () {
    return Object.assign(this.callSuper('toObject'), {
      poster: this.get('poster'),
      sources: this.get('sources')
    });
  },

  _render: function (ctx) {
    this.callSuper('_render', ctx);
  },

  blackScreen: "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=",
  createPoster: function () {

    fabric.util.loadImage(this.poster || this.blackScreen, function (img) {
      var _image = new fabric.Image(img, {
        width: this.width,
        height: this.height,
        originX: 'center',
        originY: 'center'
      });
      this.image = _image;
      this.add(_image);
    }.bind(this))

  },
  createHint: function () {

    //play/pause hint
    this.text = new fabric.Text('', {
      fontFamily: 'videogular',
      textAlign: "center",
      fontSize: 60,
      left: -25,
      top: -28,
      width: 40,
      fill: "white",
      shadow: {color: '#000', offsetX: 1, offsetY: 1, blur: 5},
      visible: false
    });


    var _self = this;

    this.on('object:click', function (e) {
      _self.text.setCoords();
      var t = this.searchPossibleTargets(e.e);
      t.target && t.target.fire("click");
    });


    this.text.on("click", function () {
      _self.togglePlayPause()
    })


    //show/hide play/pause hint
    this.on('mouse:over', function (e) {
      _self.text.setVisible(true);
      _self.canvas.renderAll();
    });
    this.on('mouse:out', function (e) {
      _self.text.setVisible(false);
      _self.canvas.renderAll();
    });

    this.add(this.text);
  },
  destructor: function (e) {
    this.mediaElement.pause();
    this.mediaElement.currentTime = 0;
    this.paused = true;
    delete this.mediaElement;
  },
  togglePlayPause: function (e) {
    var el = this.video.getElement();
    if (el.paused) {
      el.play();
      this.paused = false;
      this.video.setVisible(true);
      this.text.setText("");
    } else {
      el.pause();
      el.currentTime = 0;
      this.paused = true;
      if (this.poster) {
        this.video.setVisible(false);
      }
      this.text.setText("");
    }
  },
  createVideo: function () {

    this.video = new fabric.Image(this.mediaElement, {
      width: this.width,
      height: this.height,
      originX: 'center',
      originY: 'center'
    });

    if (this.poster) {
      this.video.setVisible(false);
    }

    this.add(this.video);

    this.createHint();

    this.fire("ready");
    //this.canvas.renderAll();
  },
  setPoster: function (img) {

    this.poster = img.src;
    this.image.setElement(img);
    this.image.set({
      width: this.width,
      height: this.height
    });
    this.canvas.renderAll();
  },
  loadVideo: function () {
    fabric.util.loadVideo(this.sources, function (el) {
      this.mediaElement = el;
      this.createVideo();
    }.bind(this))
  }
});
fabric.Video.fromObject = function (object) {
  return new fabric.Video(object);
};
