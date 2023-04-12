const {Router} = require('express');
const Template = require('../models/Template');
const authGuard = require('../middleware/auth.middleware');
const router = Router();
const config = require('config');
const shortId = require('shortid');

router.post('/generate', authGuard, async (req, res) => {
	try {
		const {data} = req.body;
		const baseUrl = config.get("baseUrl");
		const code = shortId.generate();

		// const existing = await Template.findOne({})
		const url = baseUrl + "/t/" + code;
		const template = new Template({
			data: JSON.stringify(data),
			url,
			owner: req.user.userId
		});
		template.save();
		res.status(201).json({template})

	} catch (e) {
		res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
	}
});

router.get('/', authGuard, async (req, res) => {
	try {
		const templates = await Template.find({owner: req.user.userId });
		res.json(templates)
	} catch (e) {
		res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
	}
});

router.get('/:id', authGuard, async (req, res) => {
	try {
		const template = await Template.findById(req.params.id);
		res.json(template)
	} catch (e) {
		res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' })
	}
});

module.exports = router;
