const { src, dest, series } = require('gulp');
const file = require('gulp-file');
const path = require('path');
const argv = require('yargs').argv;

function viewJs() {

    let moduleKey = argv.name;
    let moduleName = moduleKey.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()).replace(/\s/g, '');

    let content = `import html from '/src/ui/html/modules/${moduleKey}.html';

class ${moduleName}View extends HTMLElement {
    
    constructor() {
        
        super();
                
    }

    connectedCallback() {
        
        this.innerHTML = html;
        
    }

}

customElements.define( 'fpd-module-${moduleKey}', ${moduleName}View );`

    return file(moduleName+'.js', content, { src: true })
    .pipe(dest('./src/ui/view/modules/'));

}

function lessFile() {

    let moduleKey = argv.name;
    let moduleName = moduleKey.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()).replace(/\s/g, '');

    return file(moduleKey+'.less', '', { src: true })
    .pipe(dest('./src/ui/less/modules/'));

}

function htmlFile() {

    let moduleKey = argv.name;
    let moduleName = moduleKey.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()).replace(/\s/g, '');

    let content = `<div data-moduleicon="fpd-icon-${moduleKey}" data-defaulttext="${moduleName}" data-title="modules.${moduleKey.replace(/-/g, '_')}"></div>`

    return file(moduleKey+'.html', content, { src: true })
    .pipe(dest('./src/ui/html/modules/'));

}

function controllerJs() {

    let moduleKey = argv.name;
    let moduleName = moduleKey.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase()).replace(/\s/g, '');

    let content = `import '/src/ui/view/modules/${moduleName}';
    
export default class ${moduleName}Module extends EventTarget {
        
    constructor(fpdInstance, wrapper) {
        
        super();
        
        this.fpdInstance = fpdInstance;
        
        this.container = document.createElement("fpd-module-${moduleKey}");
        wrapper.append(this.container);

    }

}
    `

    return file(moduleName+'.js', content, { src: true })
    .pipe(dest('./src/ui/controller/modules/'));

}

exports.createModule = series(viewJs, lessFile, htmlFile, controllerJs)

// gulp createModule --name module-key