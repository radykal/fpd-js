
import mongoose from "mongoose"
fabric.express.setters.db = async function (config ) {
	try{
		await mongoose.connect(config.url,{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true
		})
	} catch(e) {
		console.log('server error',e.message);
		process.exit(1)
	}
	this.app.use('/t', require("./routes/redirect.routes"));
	this.app.use('/api/auth', require("./routes/auth.routes"));
	this.app.use('/api/templates', require("./routes/templates.routes"));
}
