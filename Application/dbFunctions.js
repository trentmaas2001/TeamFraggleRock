const { ObjectId } = require("mongodb")
const Diff = require('diff')
const dbName = "TestDB"
const coll = "Product_Data"
const logdbName = "logging"
const logColl = "Actions"
let db

function getLogTime() {
	var logTime = new Date();
	var dd = String(logTime.getDate()).padStart(2, '0');
	var mm = String(logTime.getMonth() + 1).padStart(2, '0');
	var yyyy = logTime.getFullYear();
	var MM = String(logTime.getMinutes() + 1).padStart(2, '0');
	var hh = String(logTime.getHours() + 1).padStart(2, '0');
	logTime = yyyy + "/" + mm + "/" + dd + ":" + hh + ":" + MM
	return logTime
}

module.exports = {

	getDb: async (client) => {
		db = await client.db(dbName)
		log = await client.db(logdbName)
	},

	getAllDocs: async () => {
		return await db.collection(coll).find().toArray()
	},
	
	addDoc: async (doc) => {
		logTime = getLogTime()
		logDoc = {}
		logDoc['user'] = 'DBManager'
		logDoc['date'] = logTime
		logDoc['diff'] = doc
		await log.collection(logColl).insertOne(logDoc)
		return await db.collection(coll).insertOne(doc)
	},
	
	deleteDoc: async (id) => {
		const filter = { _id: new ObjectId(id) }
		logTime = getLogTime()
		doc = {}
		doc['user'] = 'DBManager'
		doc['date'] = logTime
		doc['removedDocument'] = db.collection(coll).findOne(filter)
		await log.collection(logColl).insertOne(doc)
		return await db.collection(coll).deleteOne(filter)
	},

	replaceDoc: async (id, replacement, init) => {
		const filter = { _id: new ObjectId(id) }
		let logTime = getLogTime()
		init.forEach(doc => {
			if (doc._id == id) { 
                diff = Diff.diffJson(doc, replacement)
			}
		});
		added = []
		removed = []
		unchanged = []
		diffMap = {}
		i=1
		diff.forEach((part) => {
			if (part.added) {
				added.push({
					line: i,
					addedData: part.value
				})
			} else if (part.removed){
				removed.push({
					line: i,
					removedData: part.value
				})
			} else {
				unchanged.push({
					line: i,
					unchangedData: part.value
				})
			}
			i += 1
		});
		diffMap['added'] = added 
		diffMap['removed'] = removed
		diffMap['unchanged'] = unchanged
		logDoc = {}
		logDoc['user'] = 'DBManager'
		logDoc['date'] = logTime
		logDoc['changesLog'] = diffMap
		await log.collection(logColl).insertOne(logDoc)
		return await db.collection(coll).replaceOne(filter, replacement)
	}
}