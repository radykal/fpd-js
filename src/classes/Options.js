import { deepMerge } from '../utils';

/**
 * The class defining the default options for Fancy Product Designer.
 *
 * @class Options
 */
export default class Options {

	/**
	 * The default options. See: {{#crossLink "Options.defaults"}}{{/crossLink}}
	 *
	 * @property defaults
	 * @for Options
	 * @type {Object}
	 */
	defaults = {
		imageLoadTimestamp: false,
	    /**
		* The stage(canvas) width for the product designer.
		*
		* @property stageWidth
		* @for Options.defaults
		* @type {Number}
		* @default "900"
		*/
		stageWidth: 900,
		/**
		* The stage(canvas) height for the product designer.
		*
		* @property stageHeight
		* @for Options.defaults
		* @type {Number}
		* @default "600"
		*/
		stageHeight: 600,
		/**
		* Enables the editor mode, which will add a helper box underneath the product designer with some options of the current selected element.
		*
		* @property editorMode
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		editorMode: false,
		/**
		* The properties that will be displayed in the editor box when an element is selected.
		*
		* @property editorBoxParameters
		* @for Options.defaults
		* @type {Array}
		* @default ['left', 'top', 'angle', 'fill', 'width', 'height', 'fontSize', 'price']
		*/
		editorBoxParameters: ['left', 'top', 'angle', 'fill', 'width', 'height', 'fontSize', 'price'],
		/**
		* An array containing all available fonts.<br/>Since V4.3 you can use TrueType fonts (ttf), which is also recommend. TrueType fonts are required to include the font in the PDF for Fancy Product Designer - Admin, see example.
		*
		* @property fonts
		* @for Options.defaults
		* @type {Aarray}
		* @default [{name: 'Arial'}, {name: 'Lobster', url: 'google'}]
		* @example <br />[{name: "Lobster", url: "google"}, {name: 'Custom', url: 'https://yourdomain.com/fonts/custom.ttf"}, {name: 'Aller', url: 'path/Aller.ttf', variants: {'n7': 'path/Aller__bold.ttf','i4': 'path/Aller__italic.ttf','i7': 'path/Aller__bolditalic.ttf'}}]
		*/
		fonts: [{name: 'Arial'}, {name: 'Lobster', url: 'google'}],
		/**
		* The directory path that contains the templates.
		*
		* @property templatesDirectory
		* @for Options.defaults
		* @type {String}
		* @default 'templates/'
		*/
		templatesDirectory: 'html/',
		/**
		* To add photos from Facebook, you have to set your own Facebook API key.
		*
		* @property facebookAppId
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		facebookAppId: '',
		/**
		* To add photos from Instagram, you have to set an <a href="http://instagram.com/developer/" target="_blank">Instagram client ID</a>.
		*
		* @property instagramClientId
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		instagramClientId: '', //the instagram client ID
		/**
		* This URI to the html/instagram_auth.html. You have to update this option if you are using a different folder structure.
		*
		* @property instagramRedirectUri
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		instagramRedirectUri: '',
		/**
		* The URI to the script that get the access token from Instagram. You need the enter the Instagram Secret ID.
		*
		* @property instagramTokenUri
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		instagramTokenUri: '',
		/**
		* The zoom step when using the UI slider to change the zoom level.
		*
		* @property zoomStep
		* @for Options.defaults
		* @type {Number}
		* @default 0.2
		*/
		zoomStep: 0.2,
		/**
		* The maximal zoom factor. Set it to 1 to hide the zoom feature in the user interface.
		*
		* @property maxZoom
		* @for Options.defaults
		* @type {Number}
		* @default 3
		*/
		maxZoom: 3,
		/**
		* Set custom names for your hexdecimal colors. key=hexcode without #, value: name of the color.
		*
		* @property hexNames
		* @for Options.defaults
		* @type {Object}
		* @default {}
		* @example hexNames: {000000: 'dark',ffffff: 'white'}
		*/
		hexNames: {},
		/**
		* The border color of the selected element.
		*
		* @property selectedColor
		* @for Options.defaults
		* @type {String}
		* @default '#d5d5d5'
		*/
		selectedColor: '#f5f5f5',
		/**
		* The border color of the bounding box.
		*
		* @property boundingBoxColor
		* @for Options.defaults
		* @type {String}
		* @default '#005ede'
		*/
		boundingBoxColor: '#2185d0',
		/**
		* The border color of the element when its outside of his bounding box.
		*
		* @property outOfBoundaryColor
		* @for Options.defaults
		* @type {String}
		* @default '#990000'
		*/
		outOfBoundaryColor: '#990000',
		/**
		* If true only the initial elements will be replaced when changing the product. Custom added elements will not be removed.
		*
		* @property replaceInitialElements
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		replaceInitialElements: false,
		/**
		* If true lazy load will be used for the images in the "Designs" module and "Change Product" module.
		*
		* @property lazyLoad
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		lazyLoad: true,
		/**
		* Defines the file type used for the templates. E.g. if you want to convert all template files (productdesigner.html and canvaserror.html) into PHP files, you need to change this option to 'php'.
		*
		* @property templatesType
		* @for Options.defaults
		* @type {String}
		* @default 'html'
		*/
		templatesType: 'html',
		/**
		* An object that contains the settings for the AJAX post when a custom added image is added to the canvas (Uploaded Images, Facebook/Instagram Photos). This allows to send the URL of the image to a custom-built script, that returns the data URI of the image or uploads the image to your server and returns the new URL on your server. By default the URL is send to php/custom-image-handler.php. See the <a href="http://api.jquery.com/jquery.ajax/" target="_blank">official jQuery.ajax documentation</a> for more information. The data object has a reserved property called url, which is the image URL that will send to the script. The success function is also reserved.
		*
		* @property customImageAjaxSettings
		* @for Options.defaults
		* @type {Object}
		* @example
		* <pre> customImageAjaxSettings: {<br />  url: 'src/php/custom-image-handler.php',<br />  data: {<br/>   saveOnServer: 1, //image is uploaded to your server <br/>   uploadsDir: '/path/to/uploads_dir', //into this directory <br/>   uploadsDirURL: 'http://yourdomain.com/uploads_dir' //and returns the new URL from this location <br />}}</pre>
		*/
		customImageAjaxSettings: {
			/**
			* The URL to the custom-image-handler.php
			*
			* @property url
			* @type {String}
			* @for Options.defaults.customImageAjaxSettings
			* @default 'php/custom-image-handler.php'
			*/
			url: 'php/custom-image-handler.php',
			/**
			* The HTTP method to use for the request.
			*
			* @property method
			* @type {String}
			* @for Options.defaults.customImageAjaxSettings
			* @default 'POST'
			*/
			method: 'POST',
			/**
			* The type of data that you're expecting back from the server.
			*
			* @property dataType
			* @type {String}
			* @for Options.defaults.customImageAjaxSettings
			* @default 'json'
			*/
			dataType: 'json',
			/**
			* The data object sent to the server.
			*
			* @property data
			* @type {Object}
			* @for Options.defaults.customImageAjaxSettings
			* @default {
				saveOnServer: 0, - use integer as boolean value. 0=false, 1=true
				uploadsDir: './uploads', - if saveOnServer is 1, you need to specify the directory path where the images are saved
				uploadsDirURL: 'http://yourdomain.com/uploads' - if saveOnServer is 1, you need to specify the directory URL where the images are saved
			}
			*/
			data: {
				saveOnServer: 0, //use integer as boolean value. 0=false, 1=true
				uploadsDir: './uploads', //if saveOnServer is true, you need to specify the directory path where the images are saved
				uploadsDirURL: 'http://yourdomain.com/uploads' //if saveOnServer is true, you need to specify the directory URL where the images are saved
			}
		},
		/**
		* Enable an improved resize filter, that may improve the image quality when its resized.
		*
		* @property improvedResizeQuality
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		improvedResizeQuality: false,
		/**
		* Make the canvas and the elements in the canvas responsive.
		*
		* @property responsive
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		responsive: true,
		/**
		* Hex color value defining the color for the corner icon controls.
		*
		* @property cornerIconColor
		* @for Options.defaults
		* @type {String}
		* @default '#000000'
		*/
		cornerIconColor: '#000000', //hex
		/**
		* The URL to the JSON file or an object containing all content from the JSON file. Set to false, if you do not need it.
		*
		* @property langJSON
		* @for Options.defaults
		* @type {String | Object | Boolean}
		* @default 'lang/default.json'
		*/
		langJSON: 'lang/default.json',
		/**
		* The color palette when the color wheel is displayed.
		*
		* @property colorPickerPalette
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @example ['#000', '#fff']
		*/
		colorPickerPalette: [], //when colorpicker is enabled, you can define a default palette
		/**
		* An object defining the available actions in the different zones.
		*
		* @property actions
		* @for Options.defaults
		* @type {Object}
		* @default {'top': [], 'right': [], 'bottom': [], 'left': []}
		* @example {'top': ['manage-layers'], 'right': ['info'], 'bottom': ['undo', 'redo'], 'left': []}
		*/
		actions:  {
			'top': [],
			'right': [],
			'bottom': [],
			'left': []
		},
		/**
		* An array defining the available modules in the main bar. Possible values: 'products', 'images', 'text', 'designs'. 'names-numbers', 'drawing' requires Fancy Product Designer Plus Add-On.
		*
		* @property mainBarModules
		* @for Options.defaults
		* @type {Array}
		* @default ['products', 'images', 'text', 'designs']
		*/
		mainBarModules: ['products', 'images', 'text', 'designs', 'manage-layers'],
		/**
		* Set the initial active module.
		*
		* @property initialActiveModule
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		initialActiveModule: '',
		/**
		* An object defining the maximum values for input elements in the toolbar.
		*
		* @property maxValues
		* @for Options.defaults
		* @type {String}
		* @default {}
		*/
		maxValues: {},
		/**
		* Set a watermark image when the user downloads/prints the product via the actions. To pass a watermark, just enter a string with an image URL.
		*
		* @property watermark
		* @for Options.defaults
		* @type {Boolean | String}
		* @default false
		*/
		watermark: false,
		/**
		* The number of columns used for the grid images in the images and designs module.
		*
		* @property gridColumns
		* @for Options.defaults
		* @type {Number}
		* @default 2
		*/
		gridColumns: 2,
		/**
		* An object containing the currency string(use %d as placeholder for price), decimal separator and thousand separator.
		*
		* @property priceFormat
		* @for Options.defaults
		* @type {Object}
		* @default {currency: '&#36;%d', decimalSep: '.', thousandSep: ','}
		*/
		priceFormat: {currency: '&#36;%d', decimalSep: '.', thousandSep: ','},
		/**
		* The ID of an element that will be used as container for the main bar.
		*
		* @property mainBarContainer
		* @for Options.defaults
		* @type {Boolean | String}
		* @default false
		* @example #customMainBarContainer
		*/
		mainBarContainer: false,
		/**
		* The ID of an element that will be used to open the modal, in which the designer is included.
		*
		* @property modalMode
		* @for Options.defaults
		* @type {Boolean | String}
		* @default false
		* @example #modalButton
		*/
		modalMode: false,
		/**
		* Enable keyboard control. Use arrow keys to move and backspace key to delete selected element.
		*
		* @property keyboardControl
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		keyboardControl: true,
		/**
		* Deselect active element when clicking outside of the product designer.
		*
		* @property deselectActiveOnOutside
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		deselectActiveOnOutside: true,
		/**
		* All upload zones will be always on top of all elements.
		*
		* @property uploadZonesTopped
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		uploadZonesTopped: true,
		/**
		* Loads the first initial product into stage.
		*
		* @property loadFirstProductInStage
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		loadFirstProductInStage: true,
		/**
		* If the user leaves the page without saving the product or the getProduct() method is not, a alert window will pop up.
		*
		* @property unsavedProductAlert
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		unsavedProductAlert: false,
		/**
		* If the user adds something and off-canvas panel or dialog is opened, it will be closed.
		*
		* @property hideDialogOnAdd
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		hideDialogOnAdd: true,
		/**
		* Set the placement of the toolbar. For smartphones the toolbar will be fixed at the bottom of the page. Possible values:'smart', 'inside-bottom', 'inside-top'
		*
		* @property toolbarPlacement
		* @for Options.defaults
		* @type {String}
		* @default 'smart'
		*/
		toolbarPlacement: 'smart',
		/**
		* The grid size for snap action. First value defines the width on the a-axis, the second on the y-axis.
		*
		* @property snapGridSize
		* @for Options.defaults
		* @type {Array}
		* @default [50, 50]
		*/
		snapGridSize: [50, 50],
		/**
		* An object containing <a href="http://fabricjs.com/docs/fabric.Canvas.html" target="_blank">options for the fabricjs canvas</a>.
		*
		* @property fabricCanvasOptions
		* @for Options.defaults
		* @type {Object}
		* @default {}
		*/
		fabricCanvasOptions: {},
		/**
		* Defines the values for the select element in the names & numbers module. Requires Fancy Product Designer Plus Add-On.
		*
		* @property namesNumbersDropdown
		* @for Options.defaults
		* @type {Array}
		* @default []
		*/
		namesNumbersDropdown: [],
		/**
		* Sets price for any extra entry in the names & numbers module. Requires Fancy Product Designer Plus Add-On.
		*
		* @property namesNumbersEntryPrice
		* @for Options.defaults
		* @type {Number}
		* @default 0
		*/
		namesNumbersEntryPrice: 0,
		/**
		* Sets the placement for the color selection, possible values: 'inside-tl', 'inside-tc', 'inside-tr', 'inside-bl', 'inside-bc', 'inside-br' or ID of another element(#my-color-selection). Requires Fancy Product Designer Plus Add-On.
		*
		* @property colorSelectionPlacement
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		colorSelectionPlacement: '',
		/**
		* Sets the display type for the color selection. By default the color items will be shown in a grid. You can also enable a dropdown for the color selection, but this is only working when using a custom element in colorSelectionPlacement. Possible values: grid, dropdown. Requires Fancy Product Designer Plus Add-On.
		*
		* @property colorSelectionDisplayType
		* @for Options.defaults
		* @type {String}
		* @default 'grid'
		* @version PLUS 1.1.1
		*/
		colorSelectionDisplayType: 'grid',
		/**
		* Sets the placement for the Bulk-Add Variations Form. Just enter ID or class of another element(#my-color-selection). Requires Fancy Product Designer Plus Add-On.
		*
		* @property bulkVariationsPlacement
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		bulkVariationsPlacement: '',
		/**
		* The available variations for the Bulk-Add Variations Form, e.g.: {'Size': ['XL', 'L', 'M', 'S'], 'Color': ['Red', 'Blue']}. Requires Fancy Product Designer Plus Add-On.
		*
		* @property bulkVariations
		* @for Options.defaults
		* @type {Object}
		* @default {}
		*/
		bulkVariations: {},
		/**
		* The element where the toolbar will be appended when toolbarPlacement='smart'.
		*
		* @property toolbarDynamicContext
		* @for Options.defaults
		* @type {String}
		* @default 'body'
		*/
		toolbarDynamicContext: 'body',
		/**
		* Addtional properties for the bounding box. Can be used to set the stroke width etc.. See http://fabricjs.com/docs/fabric.Rect.html
		*
		* @property boundingBoxProps
		* @for Options.defaults
		* @type {Object}
		* @default {strokeWidth: 1}
		*/
		boundingBoxProps: {strokeWidth: 1},
		/**
		* If the image (custom uploaded or design) is larger than the canvas, it will be scaled down to fit into the canvas.
		*
		* @property fitImagesInCanvas
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		fitImagesInCanvas: false,
		/**
		* Set a maximum price for all products or for specific views. -1 disables the max. price.
		*
		* @property maxPrice
		* @for Options.defaults
		* @type {Number}
		* @default -1
		*/
		maxPrice: -1,
		/**
		* The text can be edited in the canvas by double click/tap.
		*
		* @property inCanvasTextEditing
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		inCanvasTextEditing: true,
		/**
		* The text input in the toolbar when be opened when an editable text is selected.
		*
		* @property openTextInputOnSelect
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		openTextInputOnSelect: false,
		/**
		* An array of design category titles (only top-level categories) to enable particular design categories for an upload zone or for the view. An empty array will enable all design categories.
		*
		* @property designCategories
		* @type {Array}
		* @for Options.defaults
		* @default []
		*/
		designCategories: [],
		/**
		* Will make the view(s) optional, so the user have to unlock it. The price for the elements in the view will be added to the total product price as soon as the view is unlocked.
		*
		* @property optionalView
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		optionalView: false,
		/**
		* When using the save/load actions, store the product in user's browser storage.
		*
		* @property saveActionBrowserStorage
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		*/
		saveActionBrowserStorage: true,
		/**
		* An array containing the pricing rules groups. Use the <a href="http://fancyproductdesigner.com/addon-pricing-rules/" target="_blank" style="text-decoration: underline;">online tool to generate pricing rules</a>. Requires Fancy Product Designer Pricing Add-On.
		*
		* @property pricingRules
		* @for Options.defaults
		* @type {Array}
		* @default []
		*/
		pricingRules: [],
		/**
		* Enables an agreement modal that needs to be confirmed before uploaded images can be used in the product designer. The text in the agreement modal can be set through the language JSON.
		*
		* @property uploadAgreementModal
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		uploadAgreementModal: false,
		/**
		* An object containing the settings for the image editor.
		*
		* @property imageEditorSettings
		* @for Options.defaults
		* @type {Object}
		* @default {masks: []}
		*/
		imageEditorSettings: {
			/**
			* An array containing the SVG urls for custom mask shapes. Use only one path per SVG, only the first path will be used as mask shape.
			*
			* @property masks
			* @type {Array}
			* @for Options.defaults.imageEditorSettings
			* @default []
			*/
			masks: []
		},
		/**
		* An object containing left, top, width and height properties that represents a printing box. A printing box is a rectangle which is always visible in the canvas and represents the printing area. It is used in the ADMIN solution to create a PDF with a specific printing area.
		*
		* @propert printingBox
		* @for Options.defaults
		* @type {Object}
		* @default null
		*/
		printingBox: null,
		/**
		* Open the Info modal when product designer is loaded. The Info action needs to be added to show the modal.
		*
		* @property autoOpenInfo
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		autoOpenInfo: false,
		/**
		* Create a custom guided tour by definifing an object with a key/css selector for the target element and the value for the text in the guided tour step. The first part of the key string defines the target type (module or action) followed by a a colon and the name of the module/action or just enter a custom CSS selector string, e.g. module:products, action:manage-layers or #any-element.
		*
		* @property guidedTour
		* @for Options.defaults
		* @type {Null | Object}
		* @default null
		* @example guidedTour: {
"module:products": "This is the text for first step.",
"action:manage-layers": "This is the text for second step.",
"#any-element": "Pointer on a custom HTML element"
}
		*/
		guidedTour: null,
		/**
		* As soon as an element with a color link group is added, the colours of this element will be used for the color group. If false, the colours of all element in the color group will be concatenated.
		*
		* @property replaceColorsInColorGroup
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		replaceColorsInColorGroup: false,
		/**
		* Defines the image types in lowercase that can be uploaded. Currently the designer supports jpg, svg, png images and PDF files.
		*
		* @property allowedImageTypes
		* @for Options.defaults
		* @type {Array}
		* @default ['jpeg', 'png', 'svg', 'pdf']
		*/
		allowedImageTypes: ['jpeg', 'png', 'svg', 'pdf'],
		/**
		* To add photos from Pixabay, you have to set an <a href="https://pixabay.com/api/docs/" target="_blank">Pixabay API key</a>.
		*
		* @property pixabayApiKey
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		pixabayApiKey: '',
		/**
		* If you want to access high-resolution images, enable this option and you have to ask Pixabay for permission. <a href="https://pixabay.com/api/docs/#hires_image_search_response" target="_blank">You can easily do that here, next to the headline</a>.
		*
		* @property pixabayHighResImages
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		pixabayHighResImages: false,
		/**
		* Language code of the language to be searched in. Accepted values: cs, da, de, en, es, fr, id, it, hu, nl, no, pl, pt, ro, sk, fi, sv, tr, vi, th, bg, ru, el, ja, ko, zh.
		*
		* @property pixabayLang
		* @for Options.defaults
		* @type {String}
		* @default ''
		* @version 4.7.5
		*/
		pixabayLang: 'en',
		/**
		* Display the internal modals (info, qr-code etc.) in the product designer instead in the whole page.
		*
		* @property openModalInDesigner
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		openModalInDesigner: false,
		/**
		* Shows the current image size in pixels in a tooltip above the image element when its selected.
		*
		* @property imageSizeTooltip
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		*/
		imageSizeTooltip: false,
		/**
		* To add photos from DepositPhotos, you have to set an <a href="https://pixabay.com/api/docs/" target="_blank">Pixabay API key</a>.
		*
		* @property depositphotosApiKey
		* @for Options.defaults
		* @type {String}
		* @default ''
		*/
		depositphotosApiKey: '',
		/**
		* The language shortcut that defines the language for the category titles. Available language shortcuts: en,de,fr,sp,ru,it,pt,es,pl,nl,jp,cz,se,zh,tr,mx,gr,ko,br,hu,uk,ro,id,th.
		*
		* @property depositphotosLang
		* @for Options.defaults
		* @type {String}
		* @default 'en'
		*/
		depositphotosLang: 'en',
		/**
		* The price that is charged when adding an image from depositphotos.com.
		*
		* @property depositphotosPrice
		* @for Options.defaults
		* @type {Number}
		* @default 0
		*/
		depositphotosPrice: 0,
		/**
		* Highlight objects (editable texts and upload zones) with a dashed border. To enable this just define a hexadecimal color value.
		*
		* @property highlightEditableObjects
		* @for Options.defaults
		* @type {String}
		* @default ''
		* @version 3.7.2
		*/
		highlightEditableObjects: '',
		/**
		* When an element is replaced, apply fill(color) from replaced element to added element.
		*
		* @property applyFillWhenReplacing
		* @for Options.defaults
		* @type {Boolean}
		* @default true
		* @version 3.7.2
		*/
		applyFillWhenReplacing: true,
		/**
		* An array containing layouts. A layout is technically a view that will replace all elements in a view when selected.
		*
		* @property layouts
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @version 4.7.0
		*/
		layouts: [],
		/**
		* Options for the Dynamic Views modul. Requires Fancy Product Designer Plus Add-On.
		*
		* @property dynamicViewsOptions
		* @for Options.defaults
		* @type {Object}
		* @default {}
		* @version 4.7.0
		*/
		dynamicViewsOptions: {
			/**
			* Set the length unit that you would like to set the canvas site: 'mm', 'cm', 'inch'
			*
			* @property unit
			* @type {String}
			* @for Options.defaults.dynamicViewsOptions
			* @default 'mm'
			*/
			unit: 'mm',
			/**
			* An array will all available formats when adding a new view.
			*
			* @property formats
			* @type {Array}
			* @for Options.defaults.dynamicViewsOptions
			* @default []
			*@example [
	[100, 100],
	[500, 500],
	[1000, 1000]
]
			*/
			formats: [],
			/**
			* Charge price per area in centimeter. For example if you want to charge a price of 1 per 10cm2, you have to enter 0.1.
			*
			* @property pricePerArea
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 0
			*/
			pricePerArea: 0,
			/**
			* Minimum width that the user can enter as view width.
			*
			* @property minWidth
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 0
			*/
			minWidth: 0,
			/**
			* Minimum height that the user can enter as view height.
			*
			* @property minHeight
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 0
			*/
			minHeight: 0,
			/**
			* Maximum width that the user can enter as view width.
			*
			* @property maxWidth
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 10000
			*/
			maxWidth: 10000,
			/**
			* Maximum height that the user can enter as view height.
			*
			* @property maxHeight
			* @type {Number}
			* @for Options.defaults.dynamicViewsOptions
			* @default 10000
			*/
			maxHeight: 10000
		},
		/**
		* Emojis in text elements will be removed when changing or adding text.
		*
		* @property disableTextEmojis
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.7.4
		*/
		disableTextEmojis: false,
		/**
		* Enable guide lines to align the selected object to the edges of the other objects.
		*
		* @property smartGuides
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.7.7
		*/
		smartGuides: false,
		/**
		* Set the toolbar theme. Possible values: white, dark.
		*
		* @property toolbarTheme
		* @for Options.defaults
		* @type {String}
		* @default 'white'
		* @version 4.7.7
		*/
		toolbarTheme: 'white',
		/**
		* If a printing box has been defined for a view and the element has no individual bounding box, the printing box will be used as bounding box.
		*
		* @property usePrintingBoxAsBounding
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.8.0
		*/
		usePrintingBoxAsBounding: false,
		/**
		* An object defining the printing area when exporting the product as SVG. {top: Number, left: Number, width: Number, height: Number, visibility: Boolean}. The visibility property shows the printing box to the customers.
		*
		* @property printingBox
		* @for Options.defaults
		* @type {Object}
		* @default {}
		* @version 4.7.0
		* @example {top: 100, left: 100, width: 400, height: 500, visibility: true}
		*/
		printingBox: {},
		/**
		* A JSON object or URL to a JSON file that stores all initial products. These products will be displayed in the Products module.
		*
		* @property productsJSON
		* @for Options.defaults
		* @type {String}
		* @default null
		* @version 4.9.0
		*/
		productsJSON: null,
		/**
		* A JSON object or URL to a JSON file that stores all designs. These designs will be displayed in the Designs module.
		*
		* @property designsJSON
		* @for Options.defaults
		* @type {String}
		* @default null
		* @version 4.9.0
		*/
		designsJSON: null,
		/**
		* When the customizationRequired argument in the getProduct is set to true, you can control if any view needs to be customized or all. Possible values: any, all.
		*
		* @property customizationRequiredRule
		* @for Options.defaults
		* @type {String}
		* @default 'any'
		* @version 4.9.4
		*/
		customizationRequiredRule: 'any',
		/**
		* Display the notification that the product is going to be changed when clicking on a product item in the Products module.
		*
		* @property swapProductConfirmation
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 4.9.5
		*/
		swapProductConfirmation: false,
		/**
		* The position of the textarea in the toolbar. Possible values: sub, top (Only possible when toolbarPlacement = smart).
		*
		* @property toolbarTextareaPosition
		* @for Options.defaults
		* @type {String}
		* @default 'sub'
		* @version 4.9.6
		*/
		toolbarTextareaPosition: 'sub',
		/**
		* The width of a textbox can set via the "Texts" module or changed via the corner controls of the selected textbox.
		*
		* @property setTextboxWidth
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.0.1
		*/
		setTextboxWidth: false,
		/**
		* Define additional properties that will be applied to all text elements in the same textLinkGroup. E.g.: ['fontFamily', 'fontSize', 'fontStyle']
		*
		* @property textLinkGroupProps
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @version 5.0.3
		*/
		textLinkGroupProps: [],
		/**
		* Text Templates that will appear in the Text module.
		*
		* @property textTemplates
		* @for Options.defaults
		* @type {Array}
		* @default []
		* @example [{text: 'Hello World', properties: {fontFamily: 'Arial', textSize: 35}}]
		* @version 5.1.0
		*/
		textTemplates: [],
		/**
		* Multiple objects can be selected and moved at the same time.
		*
		* @property multiSelection
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.1.0
		*/
		multiSelection: false,
		/**
		* The UI theme that you would like to use. Choose between 'flat' or 'doyle'.
		*
		* @property uiTheme
		* @for Options.defaults
		* @type {String}
		* @default 'flat'
		* @version 5.1.0
		*/
		uiTheme: 'flat',
		/**
		* The maximum canvas height related to the window height. A number between 0 and 1, e.g. 0.8 will set a maximum canvas height of 80% of the window height. A value of 1 will disable a calculation of a max. height.
		*
		* @property maxCanvasHeight
		* @for Options.defaults
		* @type {Number}
		* @default 1
		* @version 5.1.1
		*/
		maxCanvasHeight: 1,
		/**
		* Set the behaviour for mobile gestures. Possible values:  <ul><li>'none': No behaviour</li><li>'pinchPanCanvas': Zoom in/out and pan canvas</li><li> 'pinchImageScale': Scale selected image with pinch</li></ul> .
		*
		* @property mobileGesturesBehaviour
		* @for Options.defaults
		* @type {String}
		* @default 'none'
		* @version 5.1.3
		*/
		mobileGesturesBehaviour: 'none',
		/**
		* Enable image quality ratings for uploaded images. Therefore you can define low, mid and high quality steps. The object receives low, mid and high keys. The values of these keys are arrays, where the first entry defines the width and the second entry defines the height.
		*
		* @property imageQualityRatings
		* @for Options.defaults
		* @type {Object}
		* @default null
		* @example {low: [100, 200], mid: [500, 600], high: [1000, 1200]}
		* @version 5.1.4
		*/
		imageQualityRatings: null,
		/**
		* Displays the paths of a SVG in the advanced image editor.
		*
		* @property splitMultiSVG
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.1.4
		*/
		splitMultiSVG: false,
		/**
		* Set corner controls style: Basic (Rescale and Rotate), Advanced (Rescale, Rotate, Delete, Duplicate).
		*
		* @property cornerControlsStyle
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.1.4
		*/
		cornerControlsStyle: 'advanced',
		/**
		* The filename when the user downloads the product design as image or PDF.
		*
		* @property downloadFilename
		* @for Options.defaults
		* @type {String}
		* @default 'Product'
		* @version 5.1.5
		*/
		downloadFilename: 'Product',
		/**
		* Fill all upload zones with the first uploaded images.
		*
		* @property autoFillUploadZones
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.2.7
		*/
		autoFillUploadZones: false,
		/**
		* Drag & Drop images from the images and designs module into upload zones or on canvas.
		*
		* @property dragDropImagesToUploadZones
		* @for Options.defaults
		* @type {Boolean}
		* @default false
		* @version 5.2.7
		*/
		dragDropImagesToUploadZones: false,
		/**
		* An object containing the default element parameters in addition to the <a href="http://fabricjs.com/docs/fabric.Object.html" target="_blank">default Fabric Object properties</a>. See <a href="./Options.defaults.elementParameters.html">Options.defaults.elementParameters</a>.
		*
		* @property elementParameters
		* @for Options.defaults
		* @type {Object}
		*/
		elementParameters: {
			objectCaching: false,
			/**
			* Allows to set the z-index of an element, -1 means it will be added on the stack of layers
			*
			* @property z
			* @type {Number}
			* @for Options.defaults.elementParameters
			* @default -1
			*/
			z: -1,
			/**
			* The price for the element.
			*
			* @property price
			* @type {Number}
			* @for Options.defaults.elementParameters
			* @default 0
			*/
			price: 0, //how much does the element cost
			/**
			* <ul><li>If false, no colorization for the element is possible.</li><li>One hexadecimal color will enable the colorpicker</li><li>Mulitple hexadecimal colors separated by commmas will show a range of colors the user can choose from.</li></ul>
			*
			* @property colors
			* @type {Boolean | String}
			* @for Options.defaults.elementParameters
			* @default false
			* @example colors: "#000000" => Colorpicker, colors: "#000000,#ffffff" => Range of colors
			*/
			colors: false,
			/**
			* If true the user can remove the element.
			*
			* @property removable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			removable: false,
			/**
			* If true the user can drag the element.
			*
			* @property draggable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			draggable: false,
			/**
			* If true the user can rotate the element.
			*
			* @property rotatable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			rotatable: false,
			/**
			* If true the user can resize the element.
			*
			* @property resizable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			resizable: false,
			/**
			* If true the user can copy non-initial elements. Copyable property is enabled for designs and custom added elements automatically.
			*
			* @property copyable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			copyable: false,
			/**
			* If true the user can change the z-position the element.
			*
			* @property zChangeable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			zChangeable: false,
			/**
			* Defines a bounding box (printing area) for the element.<ul>If false no bounding box</li><li>The title of an element in the same view, then the boundary of the target element will be used as bounding box.</li><li>An object with x,y,width and height defines the bounding box</li></ul>
			*
			* @property boundingBox
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			boundingBox: false,
			/**
			* Set the mode for the bounding box. Possible values: 'none', 'clipping', 'limitModify', 'inside'
			*
			* @property boundingBoxMode
			* @type {String}
			* @for Options.defaults.elementParameters
			* @default 'clipping'
			*/
			boundingBoxMode: 'clipping',
			/**
			* Centers the element in the canvas or when it has a bounding box in the bounding box.
			*
			* @property autoCenter
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			autoCenter: false,
			/**
			* Replaces an element with the same type and replace value.
			*
			* @property replace
			* @type {String}
			* @for Options.defaults.elementParameters
			* @default ''
			*/
			replace: '',
			/**
			* If a replace value is set, you can decide if the element replaces the elements with the same replace value in all views or only in the current showing view.
			*
			* @property replaceInAllViews
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default ''
			*/
			replaceInAllViews: false,
			/**
			* Selects the element when its added to stage.
			*
			* @property autoSelect
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			autoSelect: false,
			/**
			* Sets the element always on top.
			*
			* @property topped
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			topped: false,
			/**
			* You can define different prices when using a range of colors, set through the colors option.
			*
			* @property colorPrices
			* @type {Object}
			* @for Options.defaults.elementParameters
			* @default {}
			* @example colorPrices: {"000000": 2, "ffffff: "3.5"}
			*/
			colorPrices: {},
			/**
			* Include the element in a color link group. So elements with the same color link group are changing to same color as soon as one element in the group is changing the color.
			*
			* @property colorLinkGroup
			* @type {Boolean | String}
			* @for Options.defaults.elementParameters
			* @default false
			* @example 'my-color-group'
			*/
			colorLinkGroup: false,
			/**
			* An array of URLs to pattern image - onyl for SVG images or text elements.
			*
			* @property patterns
			* @type {Array}
			* @for Options.defaults.elementParameters
			* @default []
			* @example patterns: ['patterns/pattern_1.png', 'patterns/pattern_2.png',]
			*/
			patterns: [],
			/**
			* An unique identifier for the element.
			*
			* @property sku
			* @type {String}
			* @for Options.defaults.elementParameters
			* @default ''
			*/
			sku: '',
			/**
			* When true the element is not exported in SVG. If you are going to use one of the data URL methods (e.g. <a href="./FancyProductDesigner.html#method_getProductDataURL">getProductDataURL()</a>), you need to set onlyExportable=true in the options, so the element is not exported in the data URL.
			*
			* @property excludeFromExport
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			excludeFromExport: false,
			/**
			* Shows the element colors in color selection panel. Requires Fancy Product Designer Plus Add-On.
			*
			* @property showInColorSelection
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			showInColorSelection: false,
			/**
			* By the default the element will be locked and needs to be unlocked by the user via the "Manage Layers" module.
			*
			* @property locked
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			locked: false,
			/**
			* Allow user to unlock proportional scaling in the toolbar. After that the user scale the element unproportional via toolbar or element boundary controls.
			*
			* @property uniScalingUnlockable
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			uniScalingUnlockable: false,
			/**
			* The layer is fixed and will stay on the canvas when changing the product.
			*
			* @property fixed
			* @type {Boolean}
			* @for Options.defaults.elementParameters
			* @default false
			*/
			fixed: false,
			originX: 'center',
			originY: 'center',
			cornerSize: 24,
			fill: false,
			lockUniScaling: true,
			pattern: false,
			top: 0,
			left: 0,
			angle: 0,
			flipX: false,
			flipY: false,
			opacity: 1,
			scaleX: 1,
			scaleY: 1,
		},
		/**
		* An object containing the default text element parameters in addition to the <a href="http://fabricjs.com/docs/fabric.IText.html" target="_blank">default Fabric IText properties</a>. See <a href="./Options.defaults.textParameters.html">Options.defaults.textParameters</a>. The properties in the object will merge with the properties in the elementParameters.
		*
		* @property textParameters
		* @for Options.defaults
		* @type {Object}
		*/
		textParameters: {
			/**
			* The maximal allowed characters. 0 means unlimited characters.
			*
			* @property maxLength
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			maxLength: 0,
			/**
			* If true the text will be curved.
			*
			* @property curved
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			curved: false,
			/**
			* If true the the user can switch between curved and normal text.
			*
			* @property curvable
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			curvable: false,
			/**
			* The letter spacing when the text is curved.
			*
			* @property curveSpacing
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 10
			*/
			curveSpacing: 10,
			/**
			* The radius when the text is curved.
			*
			* @property curveRadius
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 80
			*/
			curveRadius: 80,
			/**
			* Reverses the curved text.
			*
			* @property curveReverse
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			curveReverse: false,
			/**
			* The maximal allowed lines. 0 means unlimited characters.
			*
			* @property maxLines
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			maxLines: 0,
			/**
			* Enables the text element as a text box. A text box has a fixed width and not be resized.
			*
			* @property textBox
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			textBox: false,
			/**
			* Enables the text element as a placeholder for the Names & Numbers module. You can enable this parameter for one text element in a view.
			*
			* @property textPlaceholder
			* @type {Boolean | Array}
			* @for Options.defaults.textParameters
			* @default false
			*/
			textPlaceholder: false,
			/**
			* Enables the text element as a number placeholder for the Names & Numbers module. You can enable this parameter for one text element in a view. If you want to define a range of allowed numbers, just use an array. The first value in the array defines the minimum value, the second value defines the maximum value, e.g. [0, 10].
			*
			* @property numberPlaceholder
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			numberPlaceholder: false,
			/**
			* Addtional space between letters.
			*
			* @property letterSpacing
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			letterSpacing: 0,
			/**
			* The price will be charged first after the text has been edited.
			*
			* @property chargeAfterEditing
			* @type {Boolean}
			* @for Options.defaults.textParameters
			* @default false
			*/
			chargeAfterEditing: false,
			/**
			* The minimum font size.
			*
			* @property minFontSize
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 1
			*/
			minFontSize: 1,
			/**
			* Set the text transform - none, lowercase, uppercase.
			*
			* @property textTransform
			* @type {String}
			* @for Options.defaults.textParameters
			* @default 'none'
			*/
			textTransform: 'none',
			/**
			* Set a width for the text, so the text will be scaled up/down to the given area.
			*
			* @property widthFontSize
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			widthFontSize: 0,
			/**
			* The maximum font size. Using a value higher than 200 can cause performance issues with text boxes.
			*
			* @property maxFontSize
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 1
			*/
			maxFontSize: 200,
			/**
			* The color of the shadow.
			*
			* @property shadowColor
			* @type {String}
			* @for Options.defaults.textParameters
			* @default ''
			*/
			shadowColor: '',
			/**
			* Shadow Blur.
			*
			* @property shadowBlur
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			shadowBlur: 0,
			/**
			* Shadow horizontal offset.
			*
			* @property shadowOffsetX
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			shadowOffsetX: 0,
			/**
			* Shadow vertical offset.
			*
			* @property shadowOffsetY
			* @type {Number}
			* @for Options.defaults.textParameters
			* @default 0
			*/
			shadowOffsetY: 0,
			/**
			* Link the text of different text elements, changing the text of one element will also change the text of text elements with the same textLinkGroup value.
			*
			* @property textLinkGroup
			* @type {String}
			* @for Options.defaults.textParameters
			* @default ""
			*/
			textLinkGroup: "",
			/**
			* The colors for the stroke. If empty, the color wheel will be displayed.
			*
			* @property strokeColors
			* @type {Array}
			* @for Options.defaults.textParameters
			* @default []
			*/
			strokeColors: [],
			editable: true,
			fontFamily: "Arial",
			fontSize: 18,
			lineHeight: 1,
			fontWeight: 'normal', //set the font weight - bold or normal
			fontStyle: 'normal', //'normal', 'italic'
			textDecoration: 'normal', //'normal' or 'underline'
			padding: 10,
			textAlign: 'left',
			stroke: null,
			strokeWidth: 0,
			charSpacing: 0,
		},
		/**
		* An object containing the default image element parameters in addition to the <a href="http://fabricjs.com/docs/fabric.Image.html" target="_blank">default Fabric Image properties</a>. See <a href="./Options.defaults.imageParameters.html">Options.defaults.imageParameters</a>. The properties in the object will merge with the properties in the elementParameters.
		*
		* @property imageParameters
		* @for Options.defaults
		* @type {Object}
		*/
		imageParameters: {
			/**
			* If true the image will be used as upload zone. That means the image is a clickable area in which the user can add different media types.
			*
			* @property uploadZone
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			*/
			uploadZone: false,
			/**
			* Sets a filter on the image. Possible values: 'grayscale', 'sepia', 'sepia2' or any filter name from FPDFilters class.
			*
			* @property filter
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default null
			*/
			filter: null,
			/**
			* Set the scale mode when image is added into an upload zone or resizeToW/resizeToH properties are set. Possible values: 'fit', 'cover'
			*
			* @property scaleMode
			* @type {String}
			* @for Options.defaults.imageParameters
			* @default 'fit'
			*/
			scaleMode: 'fit',
			/**
			* Resizes the uploaded image to this width. 0 means it will not be resized.
			*
			* @property resizeToW
			* @type {Number}
			* @for Options.defaults.imageParameters
			* @default 0
			*/
			resizeToW: 0,
			/**
			* Resizes the uploaded image to this height. 0 means it will not be resized.
			*
			* @property resizeToH
			* @type {Number}
			* @for Options.defaults.imageParameters
			* @default 0
			*/
			resizeToH: 0,
			/**
			* Enables advanced editing, the user can crop, set filters and manipulate the color of the image. This works only for png or jpeg images. If the original image has been edited via the image editor, the original image will be replaced by a PNG with 72DPI!
			*
			* @property advancedEditing
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			*/
			advancedEditing: false,
			/**
			* If true the upload zone can be moved by the user.
			*
			* @property uploadZoneMovable
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			* version 4.8.2
			*/
			uploadZoneMovable: false,
			/**
			* If true the upload zone can be removed by the user.
			*
			* @property uploadZoneRemovable
			* @type {Boolean}
			* @for Options.defaults.imageParameters
			* @default false
			* version 5.0.0
			*/
			uploadZoneRemovable: false,
			padding: 0,
			minScaleLimit: 0.01
		},
		/**
		* An object containing the default parameters for custom added images. See <a href="./Options.defaults.customImageParameters.html">Options.defaults.customImageParameters</a>. The properties in the object will merge with the properties in the elementParameters and imageParameters.
		*
		* @property customImageParameters
		* @for Options.defaults
		* @type {Object}
		*/
		customImageParameters: {
			/**
			* The minimum upload size width.
			*
			* @property minW
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 100
			*/
			minW: 100,
			/**
			* The minimum upload size height.
			*
			* @property minH
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 100
			*/
			minH: 100,
			/**
			* The maximum upload size width.
			*
			* @property maxW
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 1500
			*/
			maxW: 1500,
			/**
			* The maximum upload size height.
			*
			* @property maxH
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 1500
			*/
			maxH: 1500,
			/**
			* The minimum allowed DPI for uploaded images. Works only with JPEG images.
			*
			* @property minDPI
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 72
			*/
			minDPI: 72,
			/**
			* The maxiumum image size in MB.
			*
			* @property maxSize
			* @type {Number}
			* @for Options.defaults.customImageParameters
			* @default 10
			*/
			maxSize: 10
		},
		/**
		* An object containing additional parameters for custom added text.The properties in the object will merge with the properties in the elementParameters and textParameters.
		*
		* @property customTextParameters
		* @for Options.defaults
		* @type {Object}
		*/
		customTextParameters: {},
		/**
		* An object containing the supported media types the user can add in the product designer.
		*
		* @property customAdds
		* @for Options.defaults
		* @type {Object}
		*/
		customAdds: {
			/**
			* If true the user can add images from the designs library.
			*
			* @property designs
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			designs: true,
			/**
			* If true the user can add an own image.
			*
			* @property uploads
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			uploads: true,
			/**
			* If true the user can add own text.
			*
			* @property texts
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			texts: true,
			/**
			* If true the user can add own drawings.
			*
			* @property drawing
			* @type {Boolean}
			* @for Options.defaults.customAdds
			* @default true
			*/
			drawing: true
		},
		/**
		* An object containing the properties (parameters) for the QR code.
		*
		* @property qrCodeProps
		* @for Options.defaults
		* @type {Object}
		*/
		qrCodeProps: {
			/**
			* @property autoCenter
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			autoCenter: true,
			/**
			* @property draggable
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			draggable: true,
			/**
			* @property removable
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			removable: true,
			/**
			* @property resizable
			* @type {Boolean}
			* @for Options.defaults.qrCodeProps
			* @default true
			*/
			resizable: true
		},
	};

	/**
	 * Merges the default options with custom options.
	 *
	 * @method merge
	 * @for Options
	 * @param {Object} defaults The default object.
	 * @param {Object} [merge] The merged object, that will be merged into the defaults.
	 * @return {Object} The new options object.
	 */
	merge(defaults, merge) {

		typeof merge === 'undefined' ? {} : merge;
        
        //todo: do deep merge here instead of multiple extends
		var options = deepMerge(defaults, merge);
		// options.elementParameters = jQuery.extend({}, defaults.elementParameters, options.elementParameters);
		// options.textParameters = jQuery.extend({}, defaults.textParameters, options.textParameters);
		// options.imageParameters = jQuery.extend({}, defaults.imageParameters, options.imageParameters);
		// options.customTextParameters = jQuery.extend({}, defaults.customTextParameters, options.customTextParameters);
		// options.customImageParameters = jQuery.extend({}, defaults.customImageParameters, options.customImageParameters);
		// options.customAdds = jQuery.extend({}, defaults.customAdds, options.customAdds);
		// options.customImageAjaxSettings = jQuery.extend({}, defaults.customImageAjaxSettings, options.customImageAjaxSettings);
		// options.qrCodeProps = jQuery.extend({}, defaults.qrCodeProps, options.qrCodeProps);
		// options.imageEditorSettings = jQuery.extend({}, defaults.imageEditorSettings, options.imageEditorSettings);
		// options.dynamicViewsOptions = jQuery.extend({}, defaults.dynamicViewsOptions, options.dynamicViewsOptions);
		// options.priceFormat = jQuery.extend({}, defaults.priceFormat, options.priceFormat);
		// options.printingBox = jQuery.extend({}, defaults.printingBox, options.printingBox);

		return options;

	};

	/**
	 * Returns all element parameter keys.
	 *
	 * @method getParameterKeys
	 * @for Options
	 * @return {Array} An array containing all element parameter keys.
	 */
	getParameterKeys() {
        
		var elementParametersKeys = Object.keys(this.defaults.elementParameters),
			imageParametersKeys = Object.keys(this.defaults.imageParameters),
			textParametersKeys = Object.keys(this.defaults.textParameters);

		elementParametersKeys = elementParametersKeys.concat(imageParametersKeys);
		elementParametersKeys = elementParametersKeys.concat(textParametersKeys);

		return elementParametersKeys;

	};

};