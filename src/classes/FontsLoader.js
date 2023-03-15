export default class FontsLoader {
    
    static parseFontsToEmbed(fontItem, loadFromScript='') {
    
        var embedString = '';
        
        if(fontItem.hasOwnProperty('url')) {
    
            var fontFamily = fontItem.name,
                fontFormat = fontItem.url.search('.woff') !== -1 ? 'woff' : 'TrueType',
                fontURL = loadFromScript ? loadFromScript+fontItem.url : fontItem.url;
    
            fontFamily += ':n4'
    
            embedString += '@font-face {font-family:"'+fontItem.name+'"; font-style: normal; font-weight: normal; src:url("'+fontURL+'") format("'+fontFormat+'");}\n';
    
            if(fontItem.variants) {
    
                for (const fv in fontItem.variants) {
    
                    var ffVars = {
                        'n7': 'font-style: normal; font-weight: bold;',
                        'i4': 'font-style: italic; font-weight: normal;',
                        'i7': 'font-style: italic; font-weight: bold;'
                    };
    
                    fontURL = loadFromScript+fontItem.variants[fv];
    
    
                    embedString += '@font-face {font-family:"'+fontItem.name+'"; '+ffVars[fv]+' src:url("'+fontURL+'") format("'+fontFormat+'");}\n';
    
                }
    
                fontFamily += ','+Object.keys(fontItem.variants).toString();
    
            }
    
        }
    
        return embedString;
    
    }
    
    static load(fpdInstance, callback) {
        
        const fonts = fpdInstance.mainOptions.fonts;
        if(fonts && fonts.length > 0 && typeof fonts[0] === 'object') {
        
            let googleFonts = [],
                customFonts = [],
                fontStateCount = 0,
                $customFontsStyle;
            
            const styleFontsElem = document.createElement('style');
            styleFontsElem.id = 'fpd-fonts';
            fpdInstance.container.before(styleFontsElem);
            
            fonts.forEach((fontItem) => {
        
                if(fontItem.hasOwnProperty('url')) {
        
                    if(fontItem.url == 'google') { //from google fonts
                        googleFonts.push(fontItem.name+':400,400i,700,700i');
                    }
                    else { //custom fonts
        
                        var fontFamily = fontItem.name;
        
                        fontFamily += ':n4'
        
                        if(fontItem.variants) {
                            fontFamily += ','+Object.keys(fontItem.variants).toString();
                        }
        
                        customFonts.push(fontFamily);
                        styleFontsElem.append(this.parseFontsToEmbed(fontItem, fpdInstance.mainOptions._loadFromScript));
        
                    }
        
                }
        
            });
        
            var _fontActiveState = function(state, familyName, fvd) {
        
                if(state == 'inactive') {
                    console.log(familyName+' font could not be loaded.');
                }
        
                if(fontStateCount == (googleFonts.length + customFonts.length)-1) {
                    callback();
                }
        
                fontStateCount++;
        
            };
        
            var WebFontOpts = {
                 fontactive: function(familyName, fvd) {
                    _fontActiveState('active', familyName, fvd);
                },
                fontinactive: function(familyName, fvd) {
                    _fontActiveState('inactive', familyName, fvd);
                },
                timeout: 3000
            };
        
            if(googleFonts.length > 0) {
                WebFontOpts.google = {families: googleFonts};
            }
        
            if(customFonts.length > 0) {
                WebFontOpts.custom = {families: customFonts};
            }
        
            if(typeof WebFont !== 'undefined' && (googleFonts.length > 0 || customFonts.length > 0)) {
                WebFont.load(WebFontOpts);
            }
            else {
                callback();
            }
        
        
        }
        else {
            callback();
        }
        
    }

}