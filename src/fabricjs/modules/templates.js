

export default {
	name: "sticker",
	prototypes: {
		Template: {
			subTargetCheck: true,
			prototype: "group"
		},
		TemplatePath: {
			prototype: "path",
			evented: false,
			selectable: false
		},
		TemplateImage: {
			prototype: "image",
			evented: false,
			selectable: false
		},
		TemplateText: {
			prototype: "Textbox",
			easyEdit: true,
			tabbable: true,
			lockMovementX: true,
			lockMovementY: true,
			lockRotation: true
		},
		TemplatePhoto: {
			prototype: "image",
			eventListeners: {
				mousedblclick: "cropPhotoStart"
			},
			hasControls: false,
			lockMovementX: true,
			lockMovementY: true,
			lockRotation: true
		}
	}
}
