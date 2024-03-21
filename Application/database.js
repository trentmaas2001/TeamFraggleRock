const { MongoClient } = require("mongodb")
//const uri = "mongodb://127.0.0.1:27017"
//uri = "mongodb://DBManager:password@localhost:27017/?authSource=TestDB"

const connect = async (uri) => {
	try {
		console.log("# Connecting to database server...")
		const client = await MongoClient.connect(uri)
		console.log("# Connected")
		return client
	}
	catch(err) {
		console.error("# Database connection error")
		throw err
	}
}

module.exports = connect;