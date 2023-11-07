# Fancy Product Designer - JS

## Documentation
* [JSDoc](https://jsdoc.fancyproductdesigner.com/)
* [Knowledge Base](https://support.fancyproductdesigner.com/support/solutions/5000115464)

## Demos
* [Sidebar Layout](https://jsdemos.fancyproductdesigner.com/sidebar.html)
* [Off-Canvas Layout](https://jsdemos.fancyproductdesigner.com/off-canvas.html)
* [Topbar Layout](https://jsdemos.fancyproductdesigner.com/topbar.html)
* [Modal (Lightbox)](https://jsdemos.fancyproductdesigner.com/modal.html)
* [Layouts module with dynamic views: User can add/remove views](https://jsdemos.fancyproductdesigner.com/dynamic-views.html)

File Upload is not enabled in the demos. If you want to enable file upload in the Images module, please [see our other git for server librares](https://github.com/radykal/fpd-js-server).

## Folder Structure
* *data*: All data files which are relevant for setup like languages files and example products and designs.
* *dist*: Ready-to-use bundles that you can use in your project.
* *examples*: Some examples to understand the setup of the product designer.
* *src*: All source files including HTML, JS, LESS files.

## Creating a custom build
### Install and start dev server

```
npm init
```

Start dev server.

```
npm run start
```

Now this will run webpack dev server and opens the examples folder in your localhost. 

Open one of the html file and edit the source of it by changing the file imports:

```
//Remove that...
<script src='./dist/js/FancyProductDesigner.min.js'></script>

//...and import theses
<link href="./dist/css/vendor.css" rel="stylesheet" type="text/css">
<script src='./dev/FancyProductDesigner.js'></script>
```

From now on you can edit the source files and you should see any changes immediately. 

### Creating a production bundle
As soon as you are ready with your customization, you just need to run:
```
npm run gulp
```
This will create the necessary bundled files in the dist folder.

## License FAQ
In order to undertand what you are allowed to do and what not, we give you short answers that might be relevant. Please consider to read our LICENSE as well.

* Is this developer version free? Yes!
* Can I use this for personal and commercial projects? Yes as long as you are not creating a premium plugin/addon/extension etc. and sell it.
* Can I use this for my customer? Yes, you can create an own application using this project for your customer.
* Can I create an extension/plugin/addon with this project and redistribute the code? **No!!!!!** If you want to do that, you need our permission first. This will also require a partnership contract, for more details you can contact us here: https://support.fancyproductdesigner.com/support/tickets/new


