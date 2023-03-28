import {FPDUtil} from '../Util.js'
export default function FPDImagesModule (fpdInstance, $module) {

	'use strict';

	$ = jQuery;

	var lazyClass = fpdInstance.mainOptions.lazyLoad ? 'fpd-hidden' : '',
		$imageInput = $module.find('.fpd-input-image'),
		$uploadScrollArea = $module.find('[data-context="upload"] .fpd-scroll-area'),
		$uploadGrid = $uploadScrollArea.find('.fpd-grid'),
		uploadCounter = 0,
		firstUploadDone = false,
		allUploadZones = [],
		totalUploadFiles = 0,
		$fbAlbumDropdown = $module.find('.fpd-facebook-albums'),
		$fbScrollArea = $module.find('[data-context="facebook"] .fpd-scroll-area'),
		$fbGrid = $fbScrollArea.find('.fpd-grid'),
		$instaScrollArea = $module.find('[data-context="instagram"] .fpd-scroll-area'),
		$instaGrid = $instaScrollArea.find('.fpd-grid'),
		facebookAppId = fpdInstance.mainOptions.facebookAppId,
		instagramClientId = fpdInstance.mainOptions.instagramClientId,
		instagramRedirectUri = fpdInstance.mainOptions.instagramRedirectUri,
		instaAccessToken = null,
		instaLoadingStack = false,
		instaNextStack = null,
		localStorageAvailable = FPDUtil.localStorageAvailable(),
		ajaxSettings = fpdInstance.mainOptions.customImageAjaxSettings,
		saveOnServer = ajaxSettings.data && ajaxSettings.data.saveOnServer ? 1 : 0,
		uploadsDir = (ajaxSettings.data && ajaxSettings.data.uploadsDir) ? ajaxSettings.data.uploadsDir : '',
		uploadsDirURL = (ajaxSettings.data && ajaxSettings.data.uploadsDirURL) ? ajaxSettings.data.uploadsDirURL : '',
		allowedFileTypes = fpdInstance.mainOptions.allowedImageTypes,
		pixabayApiKey = fpdInstance.mainOptions.pixabayApiKey,
		$pixabayScrollArea = $module.find('[data-context="pixabay"] .fpd-scroll-area'),
		$pixabayGrid = $pixabayScrollArea.find('.fpd-grid'),
		pixabayLoadingStack = false,
		pixabayCurrentQuery = '',
		pixabayPage = 1,
		dpApiKey = fpdInstance.mainOptions.depositphotosApiKey,
		$dpScrollArea = $module.find('[data-context="depositphotos"] .fpd-scroll-area'),
		$dpGrid = $dpScrollArea.find('.fpd-grid'),
		dpLoadingStack = false,
		dpCurrentType = '',
		dpCurrentQuery = '',
		dpCurrentCat = null,
		dpOffset = 0,
		$body = $('body'),
		$window = $(window);

	var _initialize = function() {

		//set price in upload drop zone
		fpdInstance.$container
		.on('viewSelect secondaryModuleCalled', function(evt) {

			if(!fpdInstance.currentViewInstance) { return; }

			var currentViewOptions = fpdInstance.currentViewInstance.options,
				price = null;

			if(fpdInstance.currentViewInstance.currentUploadZone) { //get upload zone price

				var uploadZone = fpdInstance.currentViewInstance.getUploadZone(fpdInstance.currentViewInstance.currentUploadZone);
				if(uploadZone && uploadZone.price) {
					price = uploadZone.price;
				}

			}

			if(price == null && currentViewOptions.customImageParameters && currentViewOptions.customImageParameters.price) {
				price = fpdInstance.formatPrice(currentViewOptions.customImageParameters.price);

			}

			$module.find('.fpd-upload-zone .fpd-price').html(price ? price : '');

		})
		.on('productCreate', function() {
			firstUploadDone = false;
		})


		//ALL

		//click on image item
		$module.on('click', '.fpd-grid .fpd-item:not(.fpd-category):not(.fpd-loading)', function(evt) {

			if(!fpdInstance._loadingCustomImage) {
				fpdInstance._addGridItemToStage($(this));
			}

		});


		//IMAGE UPLOAD
		if(allowedFileTypes.indexOf('jpeg') !== -1 && allowedFileTypes.indexOf('jpg') === -1) {
			allowedFileTypes.push('jpg');
		}

		var acceptTypes = [];
		allowedFileTypes.forEach(function(imageTpye) {

			if(imageTpye == 'pdf') {
				acceptTypes.push('application/pdf')
			}
			else {

				if(imageTpye == 'svg') {
					imageTpye += '+xml';
				}
				acceptTypes.push('image/'+imageTpye);

			}

		});
		$imageInput.attr('accept', acceptTypes.join());

		var $uploadZone = $module.find('.fpd-upload-zone');

		$uploadZone.click(function(evt) {

			evt.preventDefault();
			$imageInput.click();

		})
		.on('dragover dragleave', function(evt) {

			evt.stopPropagation();
			evt.preventDefault();

			$(this).toggleClass('fpd-hover', evt.type === 'dragover');

		});

		var _parseFiles = function(evt) {

			evt.stopPropagation();
			evt.preventDefault();

			var files = evt.target.files || evt.dataTransfer.files;

			if(fpdInstance.mainOptions.uploadAgreementModal) {

				var $confirm = FPDUtil.showModal(fpdInstance.getTranslation('modules', 'images_agreement'), false, 'confirm', fpdInstance.$modalContainer);
				$confirm.find('.fpd-confirm').text(fpdInstance.getTranslation('modules', 'images_confirm_button')).click(function() {

					$confirm.find('.fpd-modal-close').click();

					//timeout to wait for modal closing
					setTimeout(function() {
						_addFiles(files);
					}, 300);

				});

			}
			else {
				_addFiles(files);
			}


		};

		var _addFiles = function(files) {

			uploadCounter = 0;
			totalUploadFiles = files.length;

			for(var i=0; i < fpdInstance.currentViews.length; ++i) {

				fpdInstance.getElements(i).forEach(function(elem) {

					if(elem.uploadZone) {
						allUploadZones.push({uz: elem.title, viewIndex: i});
					}

				});

			}

			if(window.FileReader) {

				var addFirstToStage = true;
				fpdInstance._loadingCustomImage = true;

				for(var i=0; i < files.length; ++i) {

					var extension = files[i].name.split('.').pop().toLowerCase();

					if(allowedFileTypes.indexOf(extension) > -1) {
						_addUploadedImage(files[i], addFirstToStage);
						addFirstToStage = false;
					}

				}

			}

			$uploadZone.removeClass('fpd-hover');
			$imageInput.val('');

		};

		if($uploadZone.get(0)) {
			$uploadZone.get(0).addEventListener('drop', _parseFiles, false);
		}

		$module.find('.fpd-upload-form').on('change', _parseFiles);

		//window.localStorage.removeItem('fpd_uploaded_images');
		if(localStorageAvailable && window.localStorage.getItem('fpd_uploaded_images')) {

			var storageImages = JSON.parse(window.localStorage.getItem('fpd_uploaded_images'));

			storageImages.forEach(function(storageImage) {

				_addThumbnail(storageImage.url, storageImage.title)

				var image = new Image();
				image.src = storageImage.url;
				image.onerror = function() {

					var removeIndex = null;
					storageImages.forEach(function(storedImg, key) {
						if(storedImg.url == image.src) { removeIndex = key; }
					})

					if(removeIndex != null) {
						storageImages.splice(removeIndex, 1);
						window.localStorage.setItem('fpd_uploaded_images', JSON.stringify(storageImages));
					}

				}

			});

		}

		$module.find('.fpd-module-tabs-content [data-context="upload"]')
		.on('click', '.fpd-icon-remove', function(evt) {

			evt.stopPropagation();

			var $thumbnail = $(this).parents('.fpd-item:first'),
				index = $uploadGrid.children('.fpd-item').index($thumbnail);

			if(!$thumbnail.hasClass('fpd-loading')) {

				var storageImages = JSON.parse(window.localStorage.getItem('fpd_uploaded_images'));
				storageImages.splice(index, 1);
				window.localStorage.setItem('fpd_uploaded_images', JSON.stringify(storageImages));

			}

			if($thumbnail.data('xhr')) {
				$thumbnail.data('xhr').abort();
			}

			$thumbnail.remove();
			$('.fpd-thumbnail-preview').remove();

		});


		//FACEBOOK
		if(facebookAppId && facebookAppId.length > 5) {

			$module.find('.fpd-module-tabs [data-context="facebook"]').removeClass('fpd-hidden');
			_initFacebook();

		}

		//INSTAGRAM
		if(instagramClientId && instagramClientId.length > 5) {

			$module.find('.fpd-module-tabs [data-context="instagram"]')
			.removeClass('fpd-hidden')
			.on('click', function() {

				if($instaGrid.children('.fpd-item').length > 0) {
					return;
				}

				_authInstagram();

			});

			$instaScrollArea.on('_sbOnTotalScroll', function() {

				if(instaNextStack !== null && !instaLoadingStack) {
					_loadInstaImages(instaNextStack, false);
				}

			});

		}


		//PIXABAY
		if(pixabayApiKey && pixabayApiKey.length > 5) {

			$module.find('.fpd-module-tabs [data-context="pixabay"]').removeClass('fpd-hidden')
			.on('click', function() {

				if($pixabayGrid.children('.fpd-item').length > 0) {
					return;
				}

				_loadPixabayImages();

			});

			$module.on('keypress', '.fpd-module-tabs-content [data-context="pixabay"] input[type="text"]', function(evt) {

				if(evt.which == 13) {

					pixabayPage = 1;
					_loadPixabayImages(this.value);

				}

			});

			$pixabayScrollArea.on('_sbOnTotalScroll', function() {

				if(!pixabayLoadingStack) {

					pixabayPage++;
					_loadPixabayImages(undefined, false);

				}

			});

		}


		//DEPSOITPHOTOS
		if(dpApiKey && dpApiKey.length > 5) {

			$module.find('.fpd-module-tabs [data-context="depositphotos"]').removeClass('fpd-hidden')
			.on('click', function() {

				if($dpGrid.children('.fpd-item').length > 0) {
					return;
				}

				_loadDPImages('list-cats', null);

			});

			$module
			.on('keypress', '.fpd-module-tabs-content [data-context="depositphotos"] input[type="text"]', function(evt) {

				if(evt.which == 13) {

					dpOffset = 0;
					_loadDPImages('search', this.value);

				}

			})
			.on('click', '.fpd-module-tabs-content [data-context="depositphotos"] .fpd-category', function() {

				var $this = $(this),
					catTitle = $this.text();

				$module.find('.fpd-module-tabs-content [data-context="depositphotos"] .fpd-input-search input').attr('placeholder', fpdInstance.getTranslation('modules', 'depositphotos_search_category') + catTitle);

				dpCurrentCat = $this.data('category');
				_loadDPImages('search-cats', dpCurrentCat);

			})
			.on('click', '.fpd-module-tabs-content [data-context="depositphotos"] .fpd-back', function() {

				dpOffset = 0;
				dpCurrentCat = null;
				$module.find('.fpd-module-tabs-content [data-context="depositphotos"] .fpd-input-search input')
				.val('').attr('placeholder', fpdInstance.getTranslation('modules', 'depositphotos_search'));

				_loadDPImages('list-cats', null);

			});

			$dpScrollArea.on('_sbOnTotalScroll', function() {

				if(!dpLoadingStack && $dpScrollArea.prev('.fpd-cats-shown').length == 0) {

					dpOffset++;
					_loadDPImages(dpCurrentType, dpCurrentQuery, false);

				}

			});

		}

		//hide tabs when only one is active
		if($module.find('.fpd-module-tabs > :not(.fpd-hidden)').length < 2 ) {
			$module.addClass('fpd-hide-tabs');
		}

		$module.children('.fpd-module-tabs').children('div:not(.fpd-hidden):first').click();

	};

	var _addUploadedImage = function(file, addToStage) {

		//check maximum allowed size
		var maxSizeBytes = fpdInstance.mainOptions.customImageParameters.maxSize * 1024 * 1024;

		if(file.size > maxSizeBytes) {
			FPDUtil.showMessage(fpdInstance.getTranslation('misc', 'maximum_size_info').replace('%filename', file.name).replace('%mb', fpdInstance.mainOptions.customImageParameters.maxSize));
			fpdInstance._loadingCustomImage = false;
			return;
		}

		//load image with FileReader
		var reader = new FileReader();

    	reader.onload = function (evt) {

	    	//-- PDF UPLOAD

	    	if(file.type === 'application/pdf') {

		    	var $uploadSnackBar = FPDUtil.showMessage(fpdInstance.getTranslation('modules', 'images_pdf_upload_info'), false);

				var formdata = new FormData();
				formdata.append('uploadsDir', uploadsDir);
				formdata.append('uploadsDirURL', uploadsDirURL);
				formdata.append('pdf', file);

				var uploadAjaxSettings  = $.extend({}, ajaxSettings);
				uploadAjaxSettings.data = formdata;
				uploadAjaxSettings.processData = false;
				uploadAjaxSettings.contentType = false;

		        uploadAjaxSettings.success = function(data) {

					if(data && data.error === undefined) {

						totalUploadFiles--;
						data.pdf_images.forEach(function(pdfImageData, i) {

							var $lastItem = _addThumbnail(pdfImageData.image_url, pdfImageData.filename);

							addToStage = i == 0;

							_addToStage($lastItem, addToStage);
							_storeUploadedImage(pdfImageData.image_url, pdfImageData.filename);
							uploadCounter++;

						})

						$uploadSnackBar.remove();

						totalUploadFiles++;

					}
					else {
						$uploadSnackBar.remove();
						FPDUtil.showModal(data.error);
					}

				};

				var xhr = $.ajax(uploadAjaxSettings)
				.fail(function(evt) {

					if(evt.statusText !== 'abort') {

						fpdInstance._loadingCustomImage = false;
						$uploadSnackBar.remove();
						FPDUtil.showModal(evt.statusText);

					}

				});

		    	return;
	    	}

	    	//-- IMAGE UPLOAD

			//check image resolution of jpeg
	    	if(file.type === 'image/jpeg' && fpdInstance.mainOptions.customImageParameters.minDPI) {

		    	var jpeg = new JpegMeta.JpegFile(atob(this.result.replace(/^.*?,/,'')), file.name),
		    		realRes = null;

		    	if(jpeg.tiff && jpeg.tiff.XResolution && jpeg.tiff.XResolution.value) {

			    	var xResDen = jpeg.tiff.XResolution.value.den,
			    		xResNum = jpeg.tiff.XResolution.value.num;

			    	realRes = xResNum / xResDen;

			    }
			    else if(jpeg.jfif && jpeg.jfif.Xdensity && jpeg.jfif.Xdensity.value) {
				    realRes = jpeg.jfif.Xdensity.value;
			    }

		    	if(realRes !== null) {

					FPDUtil.log(file.name+' Real Resolution: '+ realRes, 'info');

					if(realRes < fpdInstance.mainOptions.customImageParameters.minDPI) {
						FPDUtil.showModal(fpdInstance.getTranslation('misc', 'minimum_dpi_info').replace('%dpi', fpdInstance.mainOptions.customImageParameters.minDPI), false, '', fpdInstance.$modalContainer);
						fpdInstance._loadingCustomImage = false;
						return false;
					}

		    	}
		    	else {
			    	FPDUtil.log(file.name + ': Resolution is not accessible.', 'info');
		    	}

	    	}

	    	var image = this.result,
				$lastItem = _addThumbnail(image, file.name);

			if(saveOnServer) {

				$lastItem
				.addClass('fpd-loading')
				.append('<div class="fpd-loading-bar"><div class="fpd-loading-progress"></div></div>');

			}

			//check image dimensions
			var checkDimImage = new Image();
			checkDimImage.onload = function() {

				var imageH = this.height,
					imageW = this.width,
					currentCustomImageParameters = fpdInstance.currentViewInstance.options.customImageParameters;

				if(FPDUtil.checkImageDimensions(fpdInstance, imageW, imageH)) {

					if(saveOnServer) {

						var formdata = new FormData();
						formdata.append('uploadsDir', uploadsDir);
						formdata.append('uploadsDirURL', uploadsDirURL);
						formdata.append('images[]', file);

						var uploadAjaxSettings  = $.extend({}, ajaxSettings);
						uploadAjaxSettings.data = formdata;
						uploadAjaxSettings.processData = false;
						uploadAjaxSettings.contentType = false;

						//upload progress
						uploadAjaxSettings.xhr = function() {

				            var xhr = $.ajaxSettings.xhr();

				            if(xhr.upload) {

				                xhr.upload.addEventListener('progress', function(evt) {

									if(evt.lengthComputable) {

								        var max = evt.total,
								        	current = evt.loaded,
								        	percentage = parseInt((current * 100)/max);

										$lastItem.find('.fpd-loading-progress').css('width', percentage+'%');

								    }

								}, false);
				            }

				            return xhr;

				        };

				        uploadAjaxSettings.success = function(data) {

							//loading thumbnail was removed
					        if($lastItem.parents('body').length == 0) {
						        return;
					        }

							if(data && data.error === undefined) {

								_storeUploadedImage(data.image_src, data.filename);

								$lastItem
								.data('source', data.image_src) //update source to local server image
								.removeClass('fpd-loading')
								.children('.fpd-loading-bar').remove();

								_addToStage($lastItem, addToStage);
								uploadCounter++;

							}
							else { //upload error, e.g. max_upload_size

								fpdInstance._loadingCustomImage = false;
								$lastItem.remove();
								FPDUtil.showModal(data.error);

							}

						};

				        var xhr = $.ajax(uploadAjaxSettings)
				        .fail(function(evt) {

							fpdInstance._loadingCustomImage = false;

							if(evt.statusText !== 'abort') {

								$lastItem.remove();
								FPDUtil.showModal(evt.statusText);

							}

						});

						$lastItem.data('xhr', xhr);

					}
					else { //do not save on server

						_storeUploadedImage(image, file.name);
						_addToStage($lastItem, addToStage);

						uploadCounter++;

					}

				}
				else { //remove thumbnail when dimensions are not in the range
					$lastItem.remove();
					fpdInstance.currentViewInstance.currentUploadZone = null;
				}

			};

			checkDimImage.src = image;

		}

		//add file to start loading
		reader.readAsDataURL(file);

	};

	var _addToStage = function($item, addToStage) {

		if(!firstUploadDone && fpdInstance.mainOptions.autoFillUploadZones) {

			var targetUploadzone = allUploadZones[uploadCounter] ? allUploadZones[uploadCounter] : null;

			if(targetUploadzone) {

				fpdInstance._addGridItemToStage(
					$item,
					{_addToUZ: targetUploadzone.uz},
					targetUploadzone.viewIndex
				);

			}

		}
		else if(addToStage) {
			fpdInstance._addGridItemToStage($item);
		}

		if(uploadCounter == totalUploadFiles-1) {
			firstUploadDone = true;
		}

	}

	var _addThumbnail = function(imgUrl, title) {

		var $thumbnail = $uploadGrid.append('<div class="fpd-item" data-title="'+title+'"><picture data-img="'+imgUrl+'"></picture><span class="fpd-price"></span><span class="fpd-icon-remove"></span></div>')
		.children('.fpd-item:last').data('source', imgUrl);

		FPDUtil.setItemPrice($thumbnail, fpdInstance);
		FPDUtil.loadGridImage($thumbnail.children('picture'), imgUrl);
		FPDUtil.createScrollbar($uploadScrollArea);

		_imageQualityRatings($thumbnail, imgUrl);

		return $thumbnail;

	};

	var _imageQualityRatings = function($thumbnail, imgUrl) {

		if(fpdInstance.mainOptions.imageQualityRatings && typeof fpdInstance.mainOptions.imageQualityRatings == 'object') {

			var low = fpdInstance.mainOptions.imageQualityRatings.low ? fpdInstance.mainOptions.imageQualityRatings.low : null,
				mid = fpdInstance.mainOptions.imageQualityRatings.mid ? fpdInstance.mainOptions.imageQualityRatings.mid : null,
				high = fpdInstance.mainOptions.imageQualityRatings.high ? fpdInstance.mainOptions.imageQualityRatings.high : null,
				icon = 'fpd-icon-star',
				iconOutline = 'fpd-icon-star-outline';

			var image = new Image();
			image.onload = function() {

				var $ratingsWrapper = $thumbnail.append('<div class="fpd-image-quality-ratings"></div>').children('.fpd-image-quality-ratings'),
					qualityLabel;

				if(low && low.length == 2) {
					var lowIcon = this.width < Number(low[0]) || this.height < Number(low[1]) ? iconOutline : icon;
					$ratingsWrapper.append('<span class="'+lowIcon+'"></span>');

					if(lowIcon == icon) {
						qualityLabel = fpdInstance.getTranslation('misc', 'image_quality_rating_low');
					}

				}

				if(mid && mid.length == 2) {
					var midIcon = this.width < Number(mid[0]) || this.height < Number(mid[1]) ? iconOutline : icon;
					$ratingsWrapper.append('<span class="'+midIcon+'"></span>');

					if(midIcon == icon) {
						qualityLabel = fpdInstance.getTranslation('misc', 'image_quality_rating_mid');
					}

				}

				if(high && high.length == 2) {
					var highIcon = this.width < Number(high[0]) || this.height < Number(high[1]) ? iconOutline : icon;
					$ratingsWrapper.append('<span class="'+highIcon+'"></span>');

					if(highIcon == icon) {
						qualityLabel = fpdInstance.getTranslation('misc', 'image_quality_rating_high');
					}


				}

				if(qualityLabel) {
					$ratingsWrapper.data('quality-label', qualityLabel)
				}

			}

			image.src = imgUrl;

		}

	};

	var _storeUploadedImage = function(url, title) {

		if(localStorageAvailable) {

			var savedLocalFiles = window.localStorage.getItem('fpd_uploaded_images') ? JSON.parse(window.localStorage.getItem('fpd_uploaded_images')) : [],
				imgObj = {
					url: url,
					title: title
				};

			savedLocalFiles.push(imgObj);
			window.localStorage.setItem('fpd_uploaded_images', JSON.stringify(savedLocalFiles))

		}

	};

	var _initFacebook = function() {

		var $albumItems = $fbAlbumDropdown.find('.fpd-dropdown-list .fpd-item');

		$fbAlbumDropdown.children('input').keyup(function() {

			$albumItems.hide();

			if(this.value.length === 0) {
				$albumItems.show();
			}
			else {
				$albumItems.filter(':containsCaseInsensitive("'+this.value+'")').show();
			}

		});

		$fbAlbumDropdown.on('click', '.fpd-dropdown-list .fpd-item', function() {

			var $this = $(this);

			$this.parent().prevAll('.fpd-dropdown-current:first').val($this.text());
			$this.siblings('.fpd-item').show();

			_selectAlbum($this.data('value'));

		});

		var _selectAlbum = function(albumID) {

			$fbGrid.empty();
			$fbAlbumDropdown.addClass('fpd-on-loading');

			FB.api('/'+albumID+'?fields=count', function(response) {

				var albumCount = response.count;

				FB.api('/'+albumID+'?fields=photos.limit('+albumCount+').fields(source,images)', function(response) {

					$fbAlbumDropdown.removeClass('fpd-on-loading');

					if(!response.error) {

						var photos = response.photos.data;

						for(var i=0; i < photos.length; ++i) {

							var photo = photos[i],
								photoLargest = photo.images[0] ? photo.images[0].source : photo.source,
								photoThumbnail = photo.images[photo.images.length-1] ? photo.images[photo.images.length-1].source : photo.source,
								$lastItem = $('<div/>', {
									'class': 'fpd-item '+lazyClass,
									'data-title': photo.id,
									'data-source': photoLargest,
									'html': '<picture data-img="'+photoThumbnail+'"></picture><span class="fpd-price"></span>'
								}).appendTo($fbGrid);

							FPDUtil.setItemPrice($lastItem, fpdInstance);

							if(lazyClass === '') {
								FPDUtil.loadGridImage($lastItem.children('picture'), photoThumbnail);
							}

						}

						FPDUtil.createScrollbar($fbScrollArea);
						FPDUtil.refreshLazyLoad($fbGrid, false);

					}

					fpdInstance.toggleSpinner(false);

				});

			});

		};

		var _fbLoggedIn = function(response) {

			if (response.status === 'connected') {
				// the user is logged in and has authenticated your app

				$module.addClass('fpd-facebook-logged-in');

				FB.api('/me/albums?fields=name,count,id', function(response) {

					var albums = response.data;
					//add all albums to select
					for(var i=0; i < albums.length; ++i) {

						var album = albums[i];
						if(album.count > 0) {
							$fbAlbumDropdown.find('.fpd-dropdown-list').append('<span class="fpd-item" data-value="'+album.id+'">'+album.name+'</span>');
						}

					}

					$albumItems = $fbAlbumDropdown.find('.fpd-dropdown-list .fpd-item');

					$fbAlbumDropdown.removeClass('fpd-on-loading');

				});

			}

		};

		if(location.protocol !== 'https:') {
			FPDUtil.log('Facebook Apps can only run in https', 'info');
			return;
		}

		$.ajaxSetup({ cache: true });
		$.getScript('//connect.facebook.com/en_US/sdk.js', function(){

			//init facebook
			FB.init({
				appId: facebookAppId,
				autoLogAppEvents: true,
				xfbml: true,
				version: 'v12.0'
			});

			FB.getLoginStatus(function(response) {
				_fbLoggedIn(response);
			});

			FB.Event.subscribe('auth.statusChange', function(response) {
				_fbLoggedIn(response);
			});

		});

	};

	//authenticate instagram
	var _authInstagram = function() {

		var popupLeft = (window.screen.width - 700) / 2,
			popupTop = (window.screen.height - 500) / 2,
			authUrl = 'https://api.instagram.com/oauth/authorize',
			authUrlQuery = {
				app_id: instagramClientId,
				redirect_uri: instagramRedirectUri,
				scope: 'user_profile,user_media',
				response_type: 'code'
			};

		var popup = window.open(authUrl+'?'+$.param(authUrlQuery), '', 'width=700,height=500,left='+popupLeft+',top='+popupTop+'');

		var interval = setInterval(function() {

			if(popup.closed) {
				clearInterval(interval);
			}

			try {

				if(popup.location && popup.location.href) {

					var url = new URL(popup.location.href),
						code = url.searchParams.get('code');

					if(code) {

						code = code.replace('#_', '');
						_instaGetAccessToken(code);
						popup.close();

					}

				}

			}
			catch(evt) {
			}


		}, 100);

	};

	//get access token
	var _instaGetAccessToken = function(code) {

		fpdInstance.toggleSpinner(true);

		$.getJSON(
			fpdInstance.mainOptions.instagramTokenUri,
			{
				code: code,
				client_app_id: instagramClientId,
				redirect_uri: instagramRedirectUri
			},
			function(data) {

				if(data) {

					if(data.access_token) {

						instaAccessToken = data.access_token;
						_loadInstaImages();

					}
					else if(data.error_message) {
						FPDUtil.log(data);
						alert(data.error_message);
						fpdInstance.toggleSpinner(false);
					}

				}
				else {
					fpdInstance.toggleSpinner(false);
				}


			}
		)

	};

	//load photos from instagram using an endpoint
	var _loadInstaImages = function(endpoint, emptyGrid) {

		endpoint = endpoint === undefined ? 'https://graph.instagram.com/me/media' : endpoint;
		emptyGrid = emptyGrid === undefined ? true : emptyGrid;

		instaLoadingStack = true;

		fpdInstance.toggleSpinner(true);

		if(emptyGrid) {
			$instaGrid.empty();
		}

		$.getJSON(
			endpoint,
			{
				fields: 'id,caption,media_url,media_type',
				access_token: instaAccessToken
			},
			function (mediaData) {

				fpdInstance.toggleSpinner(false);

				if(mediaData.data) {

		        	instaNextStack = (mediaData.paging && mediaData.paging.next) ? mediaData.paging.next : null;

		        	$.each(mediaData.data, function(i, item) {

		        		if(item.media_type !== 'VIDEO') {

			        		var image = item.media_url,
								$lastItem = $('<div/>', {
									'class': 'fpd-item '+lazyClass,
									'data-title': item.id,
									'data-source': image,
									'data-thumbnail': item.thumbnail_url ? item.thumbnail_url : item.media_url,
									'html': '<picture data-img="'+(item.thumbnail_url ? item.thumbnail_url : item.media_url)+'"></picture><span class="fpd-price"></span>'
								}).appendTo($instaGrid);

			        		FPDUtil.setItemPrice($lastItem, fpdInstance);

			        		if(lazyClass === '') {
								FPDUtil.loadGridImage($lastItem.children('picture'), image);
							}

		        		}

		            });

					if(emptyGrid) {
						FPDUtil.createScrollbar($instaScrollArea);
						FPDUtil.refreshLazyLoad($instaGrid, false);
					}

	        	}

	        	instaLoadingStack = false;

			}
		)

	};

	var _loadPixabayImages = function(query, emptyGrid) {

		if(pixabayCurrentQuery === query) {
			return false;
		}

		pixabayLoadingStack = true;

		pixabayCurrentQuery = query === undefined ? pixabayCurrentQuery : query;
		emptyGrid = emptyGrid === undefined ? true : emptyGrid;

		var perPage = 40,
			highResParam = fpdInstance.mainOptions.pixabayHighResImages ? '&response_group=high_resolution' : '',
			url = 'https://pixabay.com/api/?safesearch=true&key='+pixabayApiKey+'&page='+pixabayPage+'&per_page='+perPage+'&min_width='+fpdInstance.mainOptions.customImageParameters.minW+'&min_height='+fpdInstance.mainOptions.customImageParameters.minH+highResParam+'&q='+encodeURIComponent(pixabayCurrentQuery)+'&lang='+fpdInstance.mainOptions.pixabayLang;

		if(emptyGrid) {
			$pixabayGrid.empty();
		}

		$pixabayScrollArea.prevAll('.fpd-loader-wrapper:first').removeClass('fpd-hidden');

		$.getJSON(url, function(data) {

			$pixabayScrollArea.prevAll('.fpd-loader-wrapper:first').addClass('fpd-hidden');

			if (data.hits.length > 0) {

				data.hits.forEach(function(item) {

					var source = item.imageURL ? item.imageURL : item.webformatURL,
						$lastItem = $('<div/>', {
								'class': 'fpd-item '+lazyClass,
								'data-title': (item.id ? item.id : item.id_hash),
								'data-source': source,
								'data-thumbnail': item.webformatURL,
								'html': '<picture data-img="'+item.webformatURL+'"></picture><span class="fpd-price"></span>'
							}).appendTo($pixabayGrid);

					FPDUtil.setItemPrice($lastItem, fpdInstance);

					if(lazyClass === '') {
						FPDUtil.loadGridImage($lastItem.children('picture'), item.previewURL);
					}

					if(emptyGrid) {
						FPDUtil.createScrollbar($pixabayScrollArea);
						FPDUtil.refreshLazyLoad($pixabayGrid, false);
					}

				});

			}

			pixabayLoadingStack = false;

		})
		.fail(function(data, textStatus, jqXHR) {
			$pixabayScrollArea.prevAll('.fpd-loader-wrapper:first').addClass('fpd-hidden');
			FPDUtil.log(textStatus);
		});

	};

	var _loadDPImages = function(type, query, emptyGrid) {

		type = type === undefined ? 'search' : type;
		emptyGrid = emptyGrid === undefined ? true : emptyGrid;

		dpCurrentType = type;
		dpCurrentQuery = query;

		dpLoadingStack = true;

		var apiUrl = location.protocol+'//api.depositphotos.com?dp_apikey='+dpApiKey,
			perPage = 40;

		if(type == 'search') {
			apiUrl += '&dp_command=search&dp_search_limit=40&dp_search_offset='+dpOffset+'&dp_search_query='+encodeURIComponent(query);
			if(dpCurrentCat) {
				apiUrl += '&dp_search_categories='+encodeURIComponent(dpCurrentCat);
			}
		}
		else if(type == 'search-cats') {
			apiUrl += '&dp_command=search&dp_search_limit=40&dp_search_offset='+dpOffset+'&dp_search_query='+encodeURIComponent(query);
		}
		else if(type == 'list-cats') {
			apiUrl += '&dp_command=getCategoriesList&dp_lang='+fpdInstance.mainOptions.depositphotosLang;
		}

		if(emptyGrid) {
			$dpGrid.empty();
		}

		$dpScrollArea.prev('.fpd-head').toggleClass('fpd-cats-shown', type == 'list-cats')
		.prev('.fpd-loader-wrapper').removeClass('fpd-hidden');

		$.getJSON(apiUrl, function(data) {

			$dpScrollArea.prevAll('.fpd-loader-wrapper:first').addClass('fpd-hidden');

			var result;
			if(type == 'list-cats') {
				result = $.map(data.result, function(value, index) {
				    return [[index,value]];
				});
			}
			else {
				result = data.result;
			}

			if(result && result.length > 0) {

				result.forEach(function(item) {

					if(type == 'list-cats') {

						$('<div/>', {
							'class': 'fpd-category fpd-item',
							'data-category': item[1],
							'html': '<span>'+item[1]+'</span>'
						}).appendTo($dpGrid);

					}
					else if($dpScrollArea.prev('.fpd-cats-shown').length == 0) {

						var $lastItem = $('<div/>', {
								'class': 'fpd-item '+lazyClass,
								'data-title': item.title,
								'data-source': item.url_big,
								'data-price': fpdInstance.mainOptions.depositphotosPrice,
								'data-thumbnail': item.thumb_huge,
								'html': '<picture data-img="'+item.thumb_huge+'"></picture><span class="fpd-price"></span>'
							}).appendTo($dpGrid);

						$lastItem.data('options', {depositphotos: {id: item.id, itemURL: item.itemurl}, price: fpdInstance.mainOptions.depositphotosPrice});

						FPDUtil.setItemPrice($lastItem, fpdInstance);

						if(lazyClass === '') {
							FPDUtil.loadGridImage($lastItem.children('picture'), item.thumb_huge);
						}

					}

					if(emptyGrid) {
						FPDUtil.createScrollbar($dpScrollArea);
						FPDUtil.refreshLazyLoad($dpGrid, false);
					}

				})

			}

			dpLoadingStack = false;

		})
		.fail(function(data, textStatus, jqXHR) {
			FPDUtil.log(textStatus);
		});

	};

	_initialize();

};