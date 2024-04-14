const { MongoClient } = require("mongodb")

// Makes conection to the database using the connection string in uri argument
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