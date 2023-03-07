var FPDNamesNumbersModule = {

	setup: function(fpdInstance, $module) {

		var $lastSelectedRow = null;

		$module.off().find('.fpd-list').empty();

		var _setPlaceholderText = function(number, name) {

			if(fpdInstance.currentViewInstance.numberPlaceholder && typeof number == 'string') {
				fpdInstance.currentViewInstance.setElementParameters({text: number}, fpdInstance.currentViewInstance.numberPlaceholder);
			}

			if(fpdInstance.currentViewInstance.textPlaceholder && typeof name == 'string') {
                
                name = name.replace(FPDDisallowChars, '');
                
				//remove emojis
				if(fpdInstance.mainOptions.disableTextEmojis) {
					name = name.replace(FPDEmojisRegex, '');
					name = name.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
				}

				fpdInstance.currentViewInstance.setElementParameters({text: name}, fpdInstance.currentViewInstance.textPlaceholder);
			}

			fpdInstance.currentViewInstance.stage.renderAll();

		};

		var _addRow = function(number, name, selectVal) {

			number = typeof number === 'undefined' ? '' : number;
			name = typeof name === 'undefined' ? '' : name;

			var rowHtml = '<div class="fpd-row">';

			if(fpdInstance.currentViewInstance.numberPlaceholder) {

				var minMaxHtml = '';
				if(Array.isArray(fpdInstance.currentViewInstance.numberPlaceholder.numberPlaceholder)) {
					minMaxHtml = 'min="'+fpdInstance.currentViewInstance.numberPlaceholder.numberPlaceholder[0]+'" max="'+fpdInstance.currentViewInstance.numberPlaceholder.numberPlaceholder[1]+'" ';
				}

				rowHtml += '<div class="fpd-number-col"><input type="number" placeholder="'+fpdInstance.currentViewInstance.numberPlaceholder.originParams.text+'" class="fpd-number" value="'+number+'" '+minMaxHtml+' /></div>';
			}

			if(fpdInstance.currentViewInstance.textPlaceholder) {
				rowHtml += '<div class="fpd-name-col"><div><input type="text" placeholder="'+fpdInstance.currentViewInstance.textPlaceholder.originParams.text+'" value="'+name+'" /></div></div>';
			}

			if((fpdInstance.mainOptions.namesNumbersDropdown && fpdInstance.mainOptions.namesNumbersDropdown.length > 0) || selectVal) {

				var selectValArr = [selectVal],
					dropdownProps = fpdInstance.mainOptions.namesNumbersDropdown.length > 0 ? fpdInstance.mainOptions.namesNumbersDropdown : selectValArr,
					optionsHtml = '';

				for(var i=0; i<dropdownProps.length; ++i) {
					selected = selectVal === dropdownProps[i] ? 'selected="selected"' : '';
					optionsHtml += '<option value="'+dropdownProps[i]+'" '+selected+'>'+dropdownProps[i]+'</option>';
				}

				rowHtml += '<div class="fpd-select-col"><label><select>'+optionsHtml+'</select></label></div>';

			}

			rowHtml += '<div class="fpd-remove-col"><span><span class="fpd-icon-remove"></span></span></div></div></div>';

			$module.find('.fpd-list').append(rowHtml);

			FPDUtil.createScrollbar($module.find('.fpd-scroll-area'));

			return $module.find('.fpd-list .fpd-row:last');

		};

		if(fpdInstance.currentViewInstance.textPlaceholder || fpdInstance.currentViewInstance.numberPlaceholder) {

			$module.children('.fpd-names-numbers-panel').toggleClass('fpd-disabled', false);

			if(fpdInstance.currentViewInstance.names_numbers && Array.isArray(fpdInstance.currentViewInstance.names_numbers)) {

				for(var i=0; i<fpdInstance.currentViewInstance.names_numbers.length; ++i) {

					var nnRow = fpdInstance.currentViewInstance.names_numbers[i];
					_addRow(nnRow.number, nnRow.name, nnRow.select);

				}

			}
			else {
				_addRow();
			}

		}
		else {
			$module.children('.fpd-names-numbers-panel').toggleClass('fpd-disabled', true);
		}

		$module.on('click', '.fpd-remove-col', function() {

			var $thisRow = $(this).parents('.fpd-row:first');

			if($thisRow.siblings('.fpd-row').length > 0) {
				$thisRow.remove();

				//if the selected row is deleted, update placeholders to first inputs
				if($lastSelectedRow && $lastSelectedRow.get(0) === $thisRow.get(0)) {
					$module.find('.fpd-row:first input:first').mouseup();
				}

				fpdInstance.currentViewInstance.names_numbers = FPDNamesNumbersModule.getViewNamesNumbers($module);
				fpdInstance.currentViewInstance.changePrice(fpdInstance.currentViewInstance.options.namesNumbersEntryPrice, '-');
			}

		});

		$module.on('mouseup keyup', '.fpd-row input', function() {

			var $this = $(this);

			if($lastSelectedRow && $lastSelectedRow.get(0) !== $this.parents('.fpd-row:first').get(0)) { //set placeholders to new selected row inputs

				var $row = $this.parents('.fpd-row:first');
				_setPlaceholderText($row.find('.fpd-number').val(), $row.find('.fpd-name-col input').val())

			}
			else {

				var targetMaxLength = $this.hasClass('fpd-number') ? fpdInstance.currentViewInstance.numberPlaceholder.maxLength : fpdInstance.currentViewInstance.textPlaceholder.maxLength;

				if(targetMaxLength != 0 && this.value.length > targetMaxLength) {
					this.value = this.value.substr(0, targetMaxLength);
				}

				if($this.hasClass('fpd-number')) {

					//check if min/max limits are set and apply
					if($this.attr('min') !== undefined && this.value !== '') {

						if( this.value > Number($this.attr('max')) ) {
							this.value = Number($this.attr('max'));
						}

						if( this.value < Number($this.attr('min')) ) {
							this.value = Number($this.attr('min'));
						}

					}



					_setPlaceholderText(this.value);

				}
				else {
					_setPlaceholderText(false, this.value);
				}

			}

			$lastSelectedRow = $this.parents('.fpd-row:first');

		});

		$module.on('click', '.fpd-btn', function() {

			var $row = _addRow();
			$module.find('.fpd-list .fpd-row:last input:first').focus();

			_setPlaceholderText($row.find('.fpd-number').attr('placeholder'), $row.find('.fpd-name-col input').attr('placeholder'));

			fpdInstance.currentViewInstance.names_numbers = FPDNamesNumbersModule.getViewNamesNumbers($module);
			fpdInstance.currentViewInstance.changePrice(fpdInstance.currentViewInstance.options.namesNumbersEntryPrice, '+');

			$lastSelectedRow = $row;

		});

		$module.on('change', 'input, select', function() {

			fpdInstance.currentViewInstance.names_numbers = FPDNamesNumbersModule.getViewNamesNumbers($module);

		});

	},

	getViewNamesNumbers : function($module) {

		var nnArr = [];

		$module.find('.fpd-list .fpd-row').each(function(i, row) {

			var $row = $(row),
				rowObj = {};

			if($row.children('.fpd-number-col').length > 0) {
				rowObj.number = $row.find('.fpd-number').val();
			}

			if($row.children('.fpd-name-col').length > 0) {
				rowObj.name = $row.find('.fpd-name-col input').val();
			}

			if($row.children('.fpd-select-col').length > 0) {
				rowObj.select = $row.find('.fpd-select-col select').val();
			}

			nnArr.push(rowObj);

		});

		return nnArr;

	},

};