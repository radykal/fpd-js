import * as THREE from './three.module.js';
import { FBXLoader } from './FBXLoader.js';
import { RGBELoader } from './RGBELoader.js';
import { OrbitControls } from './OrbitControls.js';

class FPD3DPreview {

	constructor(elemId, opts) {

		opts = undefined ? {} : opts;

		// canvas size
		this.elemId = elemId;
		this.canvasW = opts.width ? opts.width : 1200;
		this.canvasH = opts.height ? opts.height : 800;
		this.imgPath = opts.imgPath ? opts.imgPath : './img/';
		this.modelPath = opts.modelPath ? opts.modelPath : './models/';
		this.modelFilename = opts.modelFilename;
		this.envMap;
		this.orbitControls;
		this.renderer;
		this.scene;
		this.camera;
		this.cameraZ = opts.cameraZ;
		this.texture_material;
		this.texture;
		this.modalCreated = false;
		this.baseMaterialMetalness = opts.baseMaterialMetalness;
		this.baseMaterialRoughness = opts.baseMaterialRoughness;

		this.initConfigurator();

	}

	// init the component
	initConfigurator() {

		// setup renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true });
		this.renderer.setClearColor (0xffffff, 1); // set background color
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.toneMappingExposure = 1;
		this.renderer.physicallyCorrectLights = true;

		var canvasContainer = document.getElementById(this.elemId);

		// adjustments for mobile
		var screenW = $("#"+this.elemId).width();
		if(screenW < 450){
			this.canvasW = screenW*2-2;
			this.canvasH = this.canvasW/3*2;
		}

		this.renderer.setSize( this.canvasW, this.canvasH );

		// rendering double size for retina display
		$(this.renderer.domElement).attr("style", "width: "+this.canvasW/2+"px; height: "+this.canvasH/2+"px;");

		canvasContainer.appendChild( this.renderer.domElement );

		// load environment map
		var pmremGenerator = new THREE.PMREMGenerator( this.renderer );
		pmremGenerator.compileEquirectangularShader();
		//
		new RGBELoader()
		.setDataType( THREE.UnsignedByteType )
		.setPath(this.imgPath)
		.load( 'environment_map.hdr', ( texture ) => {
			// set environment map
			this.envMap = pmremGenerator.fromEquirectangular( texture ).texture;
			pmremGenerator.dispose();
			// initiate 3d model loading
			this.loadModel();
		} );

		// setup scene, camera, lights
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera( 45, this.canvasW / this.canvasH, 0.1, 1000 );
		this.camera.position.z = this.cameraZ;

		this.orbitControls = new OrbitControls( this.camera, this.renderer.domElement );
		this.orbitControls.minDistance = this.cameraZ-10;
		this.orbitControls.maxDistance = this.cameraZ+10;

		const bg = new THREE.Color( 0xffffff );
		this.scene.background = bg;

		var ambient = new THREE.AmbientLight( 0xcccccc );
		this.scene.add( ambient );

		var spot1 = new THREE.SpotLight( 0xffffff, 1 );
		spot1.position.set( 5, 10, 5 );
		spot1.angle = 0.50;
		spot1.penumbra = 0.75;
		spot1.intensity = 1;
		spot1.decay = 3;

		spot1.castShadow = true;
		spot1.shadow.bias = 0.0001;
		spot1.shadow.mapSize.width = 2048;
		spot1.shadow.mapSize.height = 2048;
		this.scene.add( spot1 );

	}

	// load texture from url
	loadImage(url){
		this.texture = new THREE.TextureLoader().load(url);
		this.texture_material.map = this.texture;
	}

	// swap texture on material
	swapTexture(tex){
		this.texture_material.map = tex;
	}

	// function to load base64 image
	loadBase64(base64){

		// Create an image
		const image = new Image(); // or document.createElement('img' );

		// Create texture
		this.texture = new THREE.Texture(image);

		// On image load, update texture
		image.onload = () =>  {
			this.swapTexture(this.texture)
			this.texture.needsUpdate = true
		};

		// Set image source
		image.src = base64;
	}

	// load FBX model
	loadModel(){

		let _this = this;

		var rand = Math.random()*99999999999; // randomise to prevent cache for debugging
		var loader = new FBXLoader()
		loader.setPath(this.modelPath)
		loader.load(this.modelFilename+'?id='+rand, ( object ) => {

			// hide loader
			//$('#'+this.elemId).find(".fpd-loading").hide();

			// get "custom" object and customise material transparency and reflection (label mesh)

			var old_material;
			var s = this;
			object.traverse( function ( child ) {

				if ( child.isMesh  ) {

					if(child.name == 'custom'){

						var textureObject = child;
						old_material = textureObject.material;
						var new_material = new THREE.MeshStandardMaterial( {color:0xffffff, roughness:0.2, envMap: s.envMap, map:old_material.map, transparent:true} );
						s.texture_material = new_material;
						s.texture_material.needsUpdate = true;
						textureObject.material = new_material;

					}else{

						//get "base" object and customise material reflection (label mesh)
						var baseObject = child;
						old_material = baseObject.material;

						var new_base_material = new THREE.MeshStandardMaterial( {color:old_material.color, metalness:s.baseMaterialMetalness, roughness:s.baseMaterialRoughness, envMap: s.envMap} );

						if(old_material.map){
							new_base_material.map = old_material.map;
						}

						baseObject.material = new_base_material;
					}

				}

			} );

			object.position.set(0,0,0); // reset model position

			this.scene.add( object );
			this.modalCreated = true;
			//this.loadImage('./img/bottle-alpha.png');

		});

		var animate = function() {

			requestAnimationFrame( animate );
			_this.renderer.render( _this.scene, _this.camera );
		};

		animate();

	}

	setSize(width, height) {

		this.canvasW = width;
		this.canvasH = height;

		// adjustments for mobile
/*
		var screenW = $("#"+this.elemId).width();
		if(screenW < 450){
			this.canvasW = screenW*2-2;
			this.canvasH = this.canvasW/3*2;
		}
*/

		this.renderer.setSize( this.canvasW, this.canvasH );

		if(this.camera) {
			this.camera.aspect = this.canvasW / this.canvasH;
			this.camera.updateProjectionMatrix();
		}

		// rendering double size for retina display
		$(this.renderer.domElement).attr("style", "width: "+this.canvasW/2+"px; height: "+this.canvasH/2+"px;");

	}

};

export default FPD3DPreview;