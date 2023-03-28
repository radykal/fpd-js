
/**
 *
 * @param object
 * @param criteria - выполнять функцию со всеми объектами
 */
export default function recoursive(object, criteria) {
    let readed = [];
    if (!object) return;
    return (function sub_recoursive(object) {
        if (readed.indexOf(object) != -1) {
            return;
        }
        readed.push(object);

        if (object instanceof Array) {
            for (let prop = object.length; prop--;) {
                if (object[prop] && (object[prop].constructor === Object || object[prop].constructor === Array)) {
                    sub_recoursive(object[prop]);
                } else {
                    let result = criteria(prop, object[prop], object);
                    if(result === false)return;
                }
            }
        } else {
            for (let prop in object) {
                if (object[prop] && (object[prop].constructor === Object || object[prop].constructor === Array)) {
                    sub_recoursive(object[prop]);
                } else {
                    let result = criteria(prop, object[prop], object);
                    if(result === false)return;
                }
            }
        }
    })(object);
}
