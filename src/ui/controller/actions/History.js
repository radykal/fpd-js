var _toggleUndoRedoBtn = function(undos, redos) {

    if(undos.length === 0) {
          instance.$actionsWrapper.find('[data-action="undo"]').addClass('fpd-disabled');
      }
      else {
          instance.$actionsWrapper.find('[data-action="undo"]').removeClass('fpd-disabled');
      }

      if(redos.length === 0) {
          instance.$actionsWrapper.find('[data-action="redo"]').addClass('fpd-disabled');
      }
      else {
          instance.$actionsWrapper.find('[data-action="redo"]').removeClass('fpd-disabled');
      }

};