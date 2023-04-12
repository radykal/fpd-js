//original form fabricjs HEADER.js file
// assume we're running under node.js when document/window are not present
import jsdom from 'jsdom'
import jsdomLivingGeneratedUtils from 'jsdom/lib/jsdom/living/generated/utils.js'
import jsDomUtils from 'jsdom/lib/jsdom/utils.js';

var virtualWindow = new jsdom.JSDOM(
	decodeURIComponent('%3C!DOCTYPE%20html%3E%3Chtml%3E%3Chead%3E%3C%2Fhead%3E%3Cbody%3E%3C%2Fbody%3E%3C%2Fhtml%3E'),
	{
		features: {
			FetchExternalResources: ['img']
		},
		resources: 'usable'
	}).window;

fabric.document = virtualWindow.document
fabric.jsdomImplForWrapper = jsdomLivingGeneratedUtils.implForWrapper
fabric.nodeCanvas = jsDomUtils.Canvas
fabric.window = virtualWindow;


//quick image loader fix
import loader from 'jsdom/lib/jsdom/browser/resources/resource-loader.js'
loader.prototype._fetchURL = loader.prototype.fetch;
loader.prototype.fetch = function(urlString, options){
	if(fabric.isLikelyNode){
		if(!/^(file|data|http|https)\:\/\//.test(urlString)){
			urlString = "file://" + require("path").resolve(urlString);
		}
	}
	return loader.prototype._fetchURL(urlString, options)
};
