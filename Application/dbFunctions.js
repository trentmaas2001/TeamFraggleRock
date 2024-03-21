const { ObjectId } = require("mongodb")
const Diff = require('diff')
const dbName = "TestDB"
const coll = "Product_Data"
const logdbName = "logging"
const logColl = "Actions"
let db
let log


module.exports = {

	getDb: async (client) => {
		db = await client.db(dbName)
		log = await client.db(logdbName)
	},

	getAllDocs: async () => {
		return await db.collection(coll).find().toArray()
	},
	
	addDoc: async (doc) => {
		return await db.collection(coll).insertOne(doc)
	},
	
	deleteDoc: async (id) => {
		const filter = { _id: new ObjectId(id) }
		return await db.collection(coll).deleteOne(filter)
	},

	replaceDoc: async (id, replacement, init) => {
		const filter = { _id: new ObjectId(id) }
		var logTime = new Date();
		var dd = String(logTime.getDate()).padStart(2, '0');
		var mm = String(logTime.getMonth() + 1).padStart(2, '0');
		var yyyy = logTime.getFullYear();
		var MM = String(logTime.getMinutes() + 1).padStart(2, '0');
		var hh = String(logTime.getHours() + 1).padStart(2, '0');
		logTime = yyyy + "/" + mm + "/" + dd + ":" + hh + ":" + MM
		init.forEach(doc => {
			if (doc._id == id) { 
                diff = Diff.diffJson(doc, replacement)
			}
		});
		diffString = ""
		diff.forEach((part) => {
			if (part.added) {
				diffString += "+" + part.value + "+"
			} else if (part.removed){
				diffString += "-" + part.value + "-"
			} else {
				diffString += part.value
			}
		});
		doc = {}
		doc['user'] = 'DBManager'
		doc['date'] = logTime
		doc['diff'] = diffString
		await log.collection(logColl).insertOne(doc)
		return await db.collection(coll).replaceOne(filter, replacement)
	}
}