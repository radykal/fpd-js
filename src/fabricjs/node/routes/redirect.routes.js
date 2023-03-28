const {Router} = require('express');
const router = Router();
const Template = require('../models/Template');

router.get('/:code', async (req,res) => {
	try {
		const template = await Template.findOne({url: req.params.code});

		return res.json({ message: '!!!' })
		if(template){
			template.views ++;
			await template.save();
			return res.redirect(template.data);
		}

		res.status(404).json({ message: 'template not dound' })

	} catch (e) {
		res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
	}
});

module.exports = router;
