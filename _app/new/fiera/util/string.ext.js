
export function getCharCode(char) {
    if (!char.charCodeAt(1)) {
        return char.charCodeAt(0)
    }
    return ((((char.charCodeAt(0) - 0xD800) * 0x400) + (char.charCodeAt(1) - 0xDC00) + 0x10000));
}


export function toDashed(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}