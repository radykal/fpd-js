
// Source: https://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr
RegExp.escape = function (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
String.prototype.regexIndexOf = function (regex, startpos) {
  var indexOf = this.substring(startpos || 0).search(regex);
  return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
String.prototype.regexLastIndexOf = function (regex, startpos) {
  regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
  if (typeof (startpos) == "undefined") {
    startpos = this.length;
  } else if (startpos < 0) {
    startpos = 0;
  }
  var stringToWorkWith = this.substring(0, startpos + 1);
  var lastIndexOf = -1;
  var nextStop = 0;
  while ((result = regex.exec(stringToWorkWith)) != null) {
    lastIndexOf = result.index;
    regex.lastIndex = ++nextStop;
  }
  return lastIndexOf;
}
String.prototype.regexFindNext = function (regex, startIndex) {
  // add global flag to regex so that lastIndex of regex.exec works
  regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
  regex.lastIndex = startIndex || 0;
  var result = regex.exec(this);
  if (result === null) {
    var pos = -1;
  } else {
    var pos = result.index;
    var matchLength = result[0].length;
  }
  return {
    pos: pos,
    matchLength: matchLength
  };
}
String.prototype.regexFindPrevious = function (regex, startIndex) {
  // add global flag to regex so that lastIndex of regex.exec works
  regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
  if (typeof (startIndex) == "undefined") {
    startIndex = this.length;
  } else if (startIndex < 0) {
    startIndex = 0;
  }
  var stringToWorkWith = this.substring(0, startIndex + 1);
  var lastIndexOf = -1;
  var nextStop = 0;
  var matchLength;
  var result;
  while ((result = regex.exec(stringToWorkWith)) != null) {
    lastIndexOf = result.index;
    matchLength = result[0].length;
    regex.lastIndex = ++nextStop;
  }
  return {
    pos: lastIndexOf,
    matchLength: matchLength
  };
}
String.prototype.replaceFrom = function (search, replace, startIndex) {
  if (startIndex >= 0) {
    return this.substring(0, startIndex) + this.substring(startIndex).replace(search, replace);
  } else {
    return this.replace(search, replace);
  }
}



//Search and replace methods
fabric.util.object.extend(fabric.IText.prototype, {
  search: {
    isCaseSensitive: false,
    isWholeWord: false,
    isRegex: false,
  },
  findMode: false, // find next search result when ENTER is pressed
  findAndReplaceMode: false, // find and replace next search result when ENTER is pressed
  findNext() {
    this.find(true);
  },
  findPrevious() {
    console.log('TCL: SmartTextarea -> findNext -> this', this);
    this.find(false);
  },
  find(lookForNext = true) {
    console.log('TCL: this.find -> find');
    const textarea = this.textarea;
    // collect variables
    var txt = textarea.value;
    var searchRegex = this.termSearch.value;

    searchRegex = this.processRegexPattern(searchRegex);
    console.log('TCL: this.find -> strSearchTerm', searchRegex);

    // find next index of searchterm, starting from current cursor position
    var cursorPosEnd = this.constructor.getCursorPosEnd(textarea);
    console.log('TCL: this.find -> cursorPos', cursorPosEnd);
    if (lookForNext) { // next match
      const result = txt.regexFindNext(searchRegex, cursorPosEnd);
      var termPos = result.pos;
      var searchTermLength = result.matchLength;
    } else { // previous match
      var cursorPosStart = this.constructor.getCursorPosStart(textarea) - 1;
      if (cursorPosStart < 0) {
        var termPos = -1;
      } else {
        const result = txt.regexFindPrevious(searchRegex, cursorPosStart);
        var termPos = result.pos;
        var searchTermLength = result.matchLength;
      }
    }

    // if found, select it
    if (termPos != -1) {
      this.constructor.setSelectionRange(textarea, termPos, termPos + searchTermLength);
    } else {
      // not found from cursor pos
      if (lookForNext) {
        // so start from beginning
        const result = txt.regexFindNext(searchRegex, 0);
        termPos = result.pos;
        searchTermLength = result.matchLength;
      } else {
        // so start from end
        const result = txt.regexFindPrevious(searchRegex, txt.length);
        var termPos = result.pos;
        var searchTermLength = result.matchLength;
      }
      if (termPos != -1) {
        this.constructor.setSelectionRange(textarea, termPos, termPos + searchTermLength);
        if (searchTermLength === undefined) {
          this.find(lookForNext);
        }
      } else {
        this._showTermNotFoundTooltip();
      }
    }
  },
  findAndReplace() {
    const textarea = this.textarea;
    // collect variables
    var origTxt = textarea.value; // needed for text replacement
    var txt = textarea.value;
    var searchRegex = this.termSearch.value;
    var replaceRegex = this.termReplace.value;

    searchRegex = this.processRegexPattern(searchRegex);

    // find next index of searchterm, starting from current cursor position
    var cursorPos = this.constructor.getCursorPosEnd(textarea);
    const result = txt.regexFindNext(searchRegex, cursorPos);
    var termPos = result.pos;
    var searchTermLength = result.matchLength;
    console.log('TCL: this.findAndReplace -> searchTermLength', searchTermLength);
    console.log('TCL: this.findAndReplace -> termPos', termPos);
    var newText = '';

    var replaceTerm = () => {
      newText = origTxt.replaceFrom(searchRegex, replaceRegex, termPos);
      console.log('TCL: this.findAndReplace -> strReplaceWith', replaceRegex);
      console.log('TCL: this.findAndReplace -> strSearchTerm', searchRegex);
      let replaceTermLength = searchTermLength + (newText.length - origTxt.length);
      console.log('TCL: replaceTerm -> replaceTermLength', replaceTermLength);
      textarea.value = newText;
      this.constructor.setSelectionRange(textarea, termPos, termPos + replaceTermLength);
      this.history.save();
    }

    // if found, replace it, then select it
    if (termPos != -1) {
      replaceTerm();
    } else {
      // not found from cursor pos, so start from beginning
      const result = txt.regexFindNext(searchRegex, 0);
      termPos = result.pos;
      searchTermLength = result.matchLength;
      if (termPos != -1) {
        replaceTerm();
      } else {
        this._showTermNotFoundTooltip();
      }
    }
  },
  replaceAll() {
    const textarea = this.textarea;
    // collect variables
    var txt = textarea.value;
    var strSearchTerm = this.termSearch.value;

    strSearchTerm = this.processRegexPattern(strSearchTerm);

    // find all occurances of search string
    var matches = [];
    var pos = txt.regexIndexOf(strSearchTerm);
    while (pos > -1) {
      matches.push(pos);
      pos = txt.regexIndexOf(strSearchTerm, pos + 1);
    }

    for (var match in matches) {
      this.findAndReplace();
    }
  },
  processRegexPattern(regexStr) {
    let regex = regexStr;
    // escape special characters if search term is NOT a regular expression
    if (this.isRegex === false) {
      regex = RegExp.escape(regexStr);
    }
    // match whole word or not
    if (this.isWholeWord) {
      regex = `\\b${regex}\\b`;
    }
    // make text lowercase if search is supposed to be case insensitive
    if (this.isCaseSensitive === false) {
      regex = new RegExp(regex, "i");
    } else {
      regex = new RegExp(regex);
    }
    return regex;
  }
});