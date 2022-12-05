const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = (req, res, next) => {
	if(req.method === "OPTIONS") {
		return next()
	}
	try{
		const token = req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"
		if(!token){
			res.status(401).json({message: "not authorized"})
		}
		const decoded = jwt.verify(token,config.get("jwtSecret"));
		req.user = decoded;
		next();
	}catch(e){
		res.status(401).json({message: "wrong token"})
	}
};
