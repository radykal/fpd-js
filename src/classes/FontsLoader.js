export default class FontsLoader {
    
    static load(fpdInstance, callback) {
        
        const fonts = fpdInstance.mainOptions.fonts;
        if(fonts && fonts.length > 0 && typeof fonts[0] === 'object') {
        
            var googleFonts = [],
                customFonts = [],
                fontStateCount = 0,
                $customFontsStyle;
        
            if(instance.$container.prevAll('#fpd-custom-fonts').length == 0) {
        
                $customFontsStyle = $('<style type="text/css" id="fpd-custom-fonts"></style>');
                fpdInstance.$container.before($customFontsStyle);
        
            }
            else {
                $customFontsStyle = fpdInstance.$container.prevAll('#fpd-custom-fonts:first').empty();
            }
        
            fonts.forEach(function(fontItem) {
        
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
        
                        $customFontsStyle.append(FPDUtil.parseFontsToEmbed(fontItem, fpdInstance.mainOptions._loadFromScript));
        
                    }
        
                }
        
            });
        
            var _fontActiveState = function(state, familyName, fvd) {
        
                if(state == 'inactive') {
                    FPDUtil.log(familyName+' font could not be loaded.', 'warn');
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