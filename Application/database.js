const { MongoClient } = require("mongodb")
connString = 'mongodb://localhost:27017'

// Makes conection to the database using the connection string in uri argument
const connect = async () => {
	try {
		console.log("# Connecting to database server...")
		const client = await MongoClient.connect(connString)
		console.log("# Connected")
		return client
	}
	catch(err) {
		console.error("# Database connection error")
		throw err
	}
}

module.exports = connect;