import WebFont from 'webfontloader';

const parseFontsToEmbed = (fontItem) => {

    let embedString = '';
    
    if(fontItem.hasOwnProperty('url')) {

        let fontFamily = fontItem.name,
            fontFormat = fontItem.url.search('.woff') !== -1 ? 'woff' : 'TrueType',
            fontURL = FancyProductDesigner.proxyFileServer + fontItem.url;

        fontFamily += ':n4'
        embedString += '@font-face {font-family:"'+fontItem.name+'"; font-style: normal; font-weight: normal; src:url("'+fontURL+'") format("'+fontFormat+'");}\n';

        if(fontItem.variants) {

            for (const fv in fontItem.variants) {

                let ffVars = {
                    'n7': 'font-style: normal; font-weight: bold;',
                    'i4': 'font-style: italic; font-weight: normal;',
                    'i7': 'font-style: italic; font-weight: bold;'
                };

                fontURL = FancyProductDesigner.proxyFileServer + fontItem.variants[fv];
                embedString += '@font-face {font-family:"'+fontItem.name+'"; '+ffVars[fv]+' src:url("'+fontURL+'") format("'+fontFormat+'");}\n';

            }

            fontFamily += ','+Object.keys(fontItem.variants).toString();

        }

    }

    return embedString;

}

export { parseFontsToEmbed }

const loadFonts = (fpdInstance, callback) => {    
    
    let fonts = fpdInstance.mainOptions.fonts;
            
    if(fonts && fonts.length > 0 && typeof fonts[0] === 'object') {
        
        //sort fonts alphabetically
        fonts.sort((a, b) => {
            
            let nameA = a.name.toUpperCase(), // ignore upper and lowercase
                nameB = b.name.toUpperCase(); // ignore upper and lowercase
                
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
        
            //same
            return 0;
        });
            
        let googleFonts = [],
            customFonts = [],
            fontStateCount = 0;
        
        const styleFontsElem = document.createElement('style');
        styleFontsElem.id = 'fpd-fonts';
        fpdInstance.container.before(styleFontsElem);
        
        fonts.forEach((fontItem) => {
    
            if(fontItem.hasOwnProperty('url')) {
    
                if(fontItem.url == 'google') { //from google fonts
                    googleFonts.push(fontItem.name+':400,400i,700,700i');
                }
                else { //custom fonts
    
                    let fontFamily = fontItem.name;
    
                    fontFamily += ':n4'
    
                    if(fontItem.variants) {
                        fontFamily += ','+Object.keys(fontItem.variants).toString();
                    }
    
                    customFonts.push(fontFamily);
                    styleFontsElem.append(parseFontsToEmbed(fontItem));
    
                }
    
            }
    
        });
    
        var _fontActiveState = function(state, familyName, fvd) {            
    
            if(state == 'inactive') {
                console.log(familyName+' font could not be loaded.');
            }
    
            if(fontStateCount == (googleFonts.length + customFonts.length)-1) {
                callback(fonts);
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
    
        if((googleFonts.length > 0 || customFonts.length > 0)) {
            WebFont.load(WebFontOpts);
        }
        else {
            callback(fonts);
        }
    
    
    }
    else {
        callback(fonts);
    }
    
}

export { loadFonts }