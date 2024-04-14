const { ObjectId } = require("mongodb")
const Diff = require('diff')
//Database Name
const dbName = "ImproveDB"
//Collection Names
const logColl = "Logging"
const inWorkColl = "InWork"
const userColl = "Users"
const reviewColl = "Review"
const approvedColl = "Approved"
// database Object
let db

//Format Date String of current time for logging purposes
function getLogTime() {
	var logTime = new Date();
	var dd = String(logTime.getDate()).padStart(2, '0');
	var mm = String(logTime.getMonth() + 1).padStart(2, '0');
	var yyyy = logTime.getFullYear();
	var MM = String(logTime.getMinutes() + 1).padStart(2, '0');
	var hh = String(logTime.getHours() + 1).padStart(2, '0');
	logTime = yyyy + "/" + mm + "/" + dd + " " + hh + ":" + MM
	return logTime
}

/* Log update to existing document in Approved Collection
 * Builds a diff of the new content with the current content of Approved Collection
 * diff is stored in log as changesLog
 */
async function logUpdate(logDoc, addedDoc, approvedDoc) {
	diff = Diff.diffJson(approvedDoc, addedDoc, [{ignoreWhiteSpace: true}])
	added = []
	removed = []
	unchanged = []
	diffMap = {}
	i=1
	diff.forEach((part) => {
		if (part.added) {
			added.push({
				addedData: part.value
			})
		} else if (part.removed){
			removed.push({
				removedData: part.value
			})
		} else {
			unchanged.push({
				unchangedData: part.value
			})
		}
		i += 1
	});
	diffMap['added'] = added 
	diffMap['removed'] = removed
	diffMap['unchanged'] = unchanged
	logDoc['changesLog'] = diffMap
	await db.collection(logColl).insertOne(logDoc)
	return
}

module.exports = {

	/* Get database object from Mongo DB client */
	getDb: async (client) => {
		db = await client.db(dbName)
	},

	/* get All Docs from the collection specified by coll param */
	getAllDocs: async (coll) => {
		return await db.collection(coll).find().toArray()
	},
	
	/* insert a new doc into InWork Collection */
	addDoc: async (doc) => {
		return await db.collection(inWorkColl).insertOne(doc)
	},

	/* insert a new doc into Users Collection */
	addAuthDoc: async (doc) => {
		return await db.collection(userColl).insertOne(doc)
	},
	
	/* Delete Document from InWork Collection */ 
	deleteDoc: async (id) => {
		const filter = { _id: new ObjectId(id) }
		return await db.collection(inWorkColl).deleteOne(filter)
	},

	/* Replace content of Document with id correspondiong to id param with content of replacement */
	replaceDoc: async (id, replacement) => {
		const filter = { _id: new ObjectId(id) }
		return await db.collection(inWorkColl).replaceOne(filter, replacement)
	},

	/* Submit Document for Review
	 * Updates _status in corresponding inWork doc to Submitted for Review
	 * adds user, requested action, and time of submission to submitted content and inserts this information into the Review Collection
	 */
	submitDoc: async (id, user) => {
		let logTime = getLogTime()
		const filter = { _id: new ObjectId(id) }
		const updateDoc = {
			$set: {
			  _status: 'Submitted for Review'
			},
		  };
		const options = {
		  projection: { _status: 0 }
		  };
		await db.collection(inWorkColl).updateOne(filter, updateDoc)
		submittedDoc = await db.collection(inWorkColl).findOne(filter, options)
		submittedDoc["_submittedBy"] = user
		if (await db.collection(approvedColl).findOne(filter) == null) {
			submittedDoc["_action"] = "Adding Document to Database"
		} else {
			submittedDoc["_action"] = "Updating Document in Database"
		}
		submittedDoc["_date"] = logTime
		await db.collection(reviewColl).insertOne(submittedDoc)
	},

   	/* This will set the status of the corresponding InWork document to Approved
     * Then remove the review from the Review Collection
     * Then Add the document information into the Approved Collection
     * Then Log the action in the Logging Collection
	 * Log consists of admin accepting change and when the changes were accepted, and the content accepted
     */
	acceptDoc: async (id, user) => {
		let logTime = getLogTime()
		const filter = { _id: new ObjectId(id) }
		const updateDoc = {
			$set: {
			  _status: 'Approved'
			},
		  };
		const options = {
		  projection: { _status: 0 }
		};
		const logOptions = {
			projection: { _id: 0, _submittedBy: 1, _action: 1 }
		  };
		await db.collection(inWorkColl).updateOne(filter, updateDoc)
		logDoc = await db.collection(reviewColl).findOne(filter, logOptions)
		await db.collection(reviewColl).deleteOne(filter)
		submittedDoc = await db.collection(inWorkColl).findOne(filter, options)
		logDoc["_acceptedBy"] = user
		logDoc["_acceptedDate"] = logTime
		if (logDoc._action == "Adding Document to Database") {
			await db.collection(approvedColl).insertOne(submittedDoc)
			logDoc["_acceptedData"] = submittedDoc
			await db.collection(logColl).insertOne(logDoc)
		} else if (logDoc._action == "Updating Document in Database") {
			approvedDoc = await db.collection(approvedColl).findOne(filter) 
			await db.collection(approvedColl).replaceOne(filter, submittedDoc)
			logUpdate(logDoc, submittedDoc, approvedDoc)
		}
		return
	},

   	/* This will set the status of the corresponding InWork document to Rejected
     * Then remove the review from the Review Collection
     * Then Log the action in the Logging Collection
	 * Log consists of admin rejecting the change, when the changes were rejected, and the content rejected
     */
	rejectDoc: async (id, user) => {
		let logTime = getLogTime()
		const filter = { _id: new ObjectId(id) }
		const updateDoc = {
			$set: {
			  _status: 'Rejected'
			},
		  };
		const options = {
		  projection: { _status: 0 }
		};
		const logOptions = {
			projection: { _id: 0, _submittedBy: 1, _action: 1 }
		  };
		await db.collection(inWorkColl).updateOne(filter, updateDoc)
		logDoc = await db.collection(reviewColl).findOne(filter, logOptions)
		await db.collection(reviewColl).deleteOne(filter)
		submittedDoc = await db.collection(inWorkColl).findOne(filter, options)
		logDoc["_rejectedBy"] = user
		logDoc["_rejectedDate"] = logTime
		logDoc["_rejectedData"] = submittedDoc
		return await db.collection(logColl).insertOne(logDoc)
	},

	/* Get single document with id mathcing id param from collection indicated by coll param */
	getDoc: async (coll, id) => {
		const filter = { _id: new ObjectId(id) }
		return await db.collection(coll).findOne(filter)
	}
}