import "../../../ui/view/modules/Designs.js";

import { deepMerge, addEvents, getItemPrice, createImgThumbnail } from "../../../helpers/utils.js";

export default class DesignsModule extends EventTarget {
	#searchInLabel = "";
	#categoriesUsed = false;
	#categoryLevelIndexes = [];
	#currentCategories = null;
	#dynamicDesignsId = null;

	constructor(fpdInstance, wrapper, dynamicDesignsId = null) {
		super();

		this.#searchInLabel = fpdInstance.translator
			.getTranslation("modules", "designs_search_in", "Search in")
			.toUpperCase();
		this.fpdInstance = fpdInstance;
		this.#dynamicDesignsId = dynamicDesignsId;

		this.container = document.createElement("fpd-module-designs");
		wrapper.append(this.container);

		if (dynamicDesignsId) {
			this.container.dataset.dynamicDesignsId = dynamicDesignsId;
		}

		this.headElem = this.container.querySelector(".fpd-head");
		this.gridElem = this.container.querySelector(".fpd-grid");

		this.headElem.querySelector(".fpd-input-search input").addEventListener("keyup", (evt) => {
			const inputElem = evt.currentTarget;
			const gridItems = this.gridElem.querySelectorAll(".fpd-item");

			if (inputElem.value == "") {
				//no input, display all

				for (let item of gridItems) {
					item.classList.remove("fpd-hidden");
				}
			} else {
				const searchQuery = inputElem.value.toLowerCase().trim();

				for (let item of gridItems) {
					item.classList.add("fpd-hidden");

					if (item.dataset.search.includes(searchQuery)) {
						item.classList.remove("fpd-hidden");
					}
				}
			}
		});

		addEvents(this.headElem.querySelector(".fpd-back"), "click", (evt) => {
			if (this.gridElem.querySelectorAll(".fpd-category").length > 0) {
				this.#categoryLevelIndexes.pop(); //remove last level index
			}

			//loop through design categories to receive parent category
			let displayCategories = this.fpdInstance.designs,
				parentCategory;

			this.#categoryLevelIndexes.forEach((levelIndex) => {
				parentCategory = displayCategories[levelIndex];
				displayCategories = parentCategory.category;
			});

			this.#currentCategories = displayCategories;

			if (displayCategories) {
				//display first level categories
				this.#displayCategories(this.#currentCategories, parentCategory);
			}

			//only toggle categories for top level
			if (parentCategory === undefined) {
				this.toggleCategories();
			}
		});

		//when adding a product after products are set with productsSetup()
		let designsSet = false;
		addEvents(fpdInstance, ["designsSet"], (evt) => {
			if (designsSet) return;
			designsSet = true;

			const designs = fpdInstance.designs;

			if (!Array.isArray(designs) || designs.length === 0) {
				return;
			}

			if (designs[0].hasOwnProperty("source")) {
				//check if first object is a design image

				this.container.classList.add("fpd-single-cat");
				this.#displayDesigns(designs);
			} else {
				if (designs.length > 1 || designs[0].category) {
					//display categories
					this.#categoriesUsed = true;
					this.toggleCategories();
				} else if (designs.length === 1 && designs[0].designs) {
					//display designs in category, if only one category exists
					this.container.classList.add("fpd-single-cat");
					this.#displayDesigns(designs[0].designs);
				}
			}
		});

		addEvents(fpdInstance, "viewSelect", () => {
			this.toggleCategories();
		});
	}

	#displayCategories(categories, parentCategory) {
		this.gridElem.innerHTML = "";
		this.headElem.querySelector(".fpd-input-search input").value = "";
		this.container.classList.remove("fpd-designs-active");
		this.container.classList.add("fpd-categories-active");

		categories.forEach((category, i) => {
			this.#addDesignCategory(category);
		});

		//set category title
		if (parentCategory) {
			this.headElem
				.querySelector(".fpd-input-search input")
				.setAttribute("placeholder", this.#searchInLabel + " " + parentCategory.title.toUpperCase());
			this.container.classList.add("fpd-head-visible");
		}
	}

	#addDesignCategory(category) {
		const gridItem = document.createElement("div");
		gridItem.className = "fpd-category fpd-item";
		gridItem.dataset.title = category.title;
		gridItem.dataset.search = category.title.toLowerCase();

		if (category.thumbnail) {
			const picElem = document.createElement("picture");
			picElem.dataset.img = category.thumbnail;
			gridItem.append(picElem);
			this.fpdInstance.lazyBackgroundObserver.observe(picElem);

			const titleElem = document.createElement("span");
			titleElem.innerText = category.title;
			gridItem.append(titleElem);
		} else {
			gridItem.innerHTML = "<span>" + category.title + "</span>";
		}

		gridItem.addEventListener("click", (evt) => {
			let targetItem = evt.currentTarget,
				index = Array.from(this.gridElem.querySelectorAll(".fpd-item")).indexOf(targetItem),
				selectedCategory = this.#currentCategories[index];

			if (selectedCategory.category) {
				this.#categoryLevelIndexes.push(index);
				this.#currentCategories = selectedCategory.category;
				this.#displayCategories(this.#currentCategories, selectedCategory);
			} else {
				this.#displayDesigns(selectedCategory.designs, selectedCategory.parameters);
			}

			this.headElem
				.querySelector(".fpd-input-search input")
				.setAttribute("placeholder", this.#searchInLabel + " " + targetItem.dataset.search.toUpperCase());
		});

		this.gridElem.append(gridItem);
	}

	#displayDesigns(designObjects, categoryParameters = {}) {
		this.gridElem.innerHTML = "";
		this.headElem.querySelector(".fpd-input-search input").value = "";
		this.container.classList.remove("fpd-categories-active");
		this.container.classList.add("fpd-designs-active", "fpd-head-visible");

		designObjects.forEach((designObject) => {
			designObject.parameters = deepMerge(categoryParameters, designObject.parameters);
			this.#addGridDesign(designObject);
		});
	}

	//adds a new design to the designs grid
	#addGridDesign(design) {
		design.thumbnail = design.thumbnail === undefined ? design.source : design.thumbnail;

		const priceStr = getItemPrice(this.fpdInstance, this.container, design.parameters.price);
		const thumbnailItem = createImgThumbnail({
			url: design.source,
			thumbnailUrl: design.thumbnail,
			title: design.title,
			price: priceStr,
			disablePrice: !Boolean(priceStr),
		});

		thumbnailItem.dataset.search = design.title.toLowerCase();
		thumbnailItem.parameters = design.parameters;
		thumbnailItem.addEventListener("click", (evt) => {
			const item = evt.currentTarget;
			this.fpdInstance.addCanvasDesign(item.dataset.source, item.dataset.title, item.parameters);
		});

		this.gridElem.append(thumbnailItem);

		this.fpdInstance.lazyBackgroundObserver.observe(thumbnailItem.querySelector("picture"));
	}

	toggleCategories() {
		if (!this.#categoriesUsed) {
			return;
		}

		this.#categoryLevelIndexes = [];

		//reset to default view(head hidden, top-level cats are displaying)
		this.container.classList.remove("fpd-head-visible", "fpd-single-cat");

		this.#currentCategories = this.fpdInstance.designs;

		this.#displayCategories(this.#currentCategories);

		let catTitles = [];

		//display dynamic designs
		if (typeof this.#dynamicDesignsId == "string") {
			catTitles = this.fpdInstance.mainOptions.dynamicDesigns[this.#dynamicDesignsId].categories;
		} else if (this.fpdInstance.currentViewInstance) {
			const element = this.fpdInstance.currentElement;

			//element (upload zone) has design categories
			if (element && element.uploadZone && element.designCategories) {
				catTitles = this.fpdInstance.currentElement.designCategories;
			}
			//enabled for the view
			else {
				catTitles = this.fpdInstance.currentViewInstance.options.designCategories;
			}
		}

		catTitles = catTitles.map((ct) => ct.toLowerCase());

		//check for particular design categories
		var allCatElems = this.container.querySelectorAll(".fpd-category");
		if (catTitles.length > 0) {
			let visibleCats = [];
			for (let item of allCatElems) {
				if (catTitles.includes(item.dataset.title.toLowerCase())) {
					item.classList.remove("fpd-hidden");
					visibleCats.push(item);
				} else {
					item.classList.add("fpd-hidden");
				}
			}

			//when only one category is enabled, open it
			if (visibleCats.length === 1) {
				this.container.classList.add("fpd-single-cat");
				visibleCats[0].click();
			}
		} else {
			for (let item of allCatElems) {
				item.classList.remove("fpd-hidden");
			}
		}
	}
}

window.FPDDesignsModule = DesignsModule;
