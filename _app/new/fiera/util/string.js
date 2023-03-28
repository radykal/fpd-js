/**
 * Camelizes a string
 * @memberOf fabric.util.string
 * @param {String} string String to camelize
 * @param {String} capitalizeFirstLetter capitalize First Letter
 * @return {String} Camelized version of a string
 */
export function camelize(string, capitalizeFirstLetter) {
  let str =  string.replace(/-+(.)?/g, function(match, character) {
    return character ? character.toUpperCase() : '';
  });
  if(capitalizeFirstLetter){
    return capitalize(str,true);
  }
  return str;
}

export function capitalize(string, firstLetterOnly) {
  return string.charAt(0).toUpperCase() +
    (firstLetterOnly ? string.slice(1) : string.slice(1).toLowerCase());
}

export function toDashed(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function uncapitalize(string){
  return string.charAt(0).toLowerCase() + (string.slice(1));
}