const getURL = "http://localhost:3000/getDoc/"
const searchParams = new URLSearchParams(window.location.search);
const docid = searchParams.get('docID');
const replaceURL = "http://localhost:3000/api/replaceone/"
const rootURL = "http://localhost:3000/"

/* Document DOM Element */
let documentDiv

window.onload = () => {
    documentDiv = document.getElementById("document")
    loadData()
  }
  
  /*
   * Routine to get the log with the same id passed as a urlParam
   * Makes the get request using the fetch API.
   * The response from the fetch has the log to be displayed/edited
   */
  function loadData() {
    
    fetch(getURL + "Logging/" + docid)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        else {
          return res.text().then(text => { throw new Error(text) })
        }
      })
      .then(doc => {
        buildData(doc)
        return doc
      })
      .catch(error => {
        console.error("# Error:", error)
        const msg = "Error: " + error.message + ". " +
          "The web server or database may not have started. " +
          "See browser's console for more details."
      })
  }
  
  /* Builds out HTML of the document 
   * This method needs to check whether the action logged was adding a document, updating a document
   * or rejecting a change. If the action taken was updating the document some editing to the data string
   * must be done to make it readable to the user.
   */
  function buildData(doc) {
    documentDiv.innerHTML = buildDocument(doc)
    if (doc._acceptedData) {
      document.getElementById('json').textContent = JSON.stringify(doc._acceptedData, null, "    ")
    } else if (doc._rejectedData) {
      document.getElementById('json').textContent = JSON.stringify(doc._rejectedData, null, "    ")
    } else {
      text = JSON.stringify(doc.changesLog, null, "    ")
      text = text.replaceAll("\\n", "").replaceAll("\\", "")
      document.getElementById('json').textContent = text
    }
  }

  /* Build MetaData display HTML for document
   * Method must make a check to see if the action was a rejection or accepting a change
   */
  function buildDocument(doc) {
    returnText = "<b>Submitted By</b>: " + doc["_submittedBy"] + "<br>"
    returnText += "<b>Submitted Action</b>: " + doc["_action"] + "<br>"
    if (doc["_acceptedDate"]) {
      returnText += "<b>Accepted On</b>: " + doc["_acceptedDate"] + "<br>"
      returnText += "<b>Accepted By</b>: " + doc["_acceptedBy"] + "<br>"
    } else {
      returnText += "<b>Rejected On</b>: " + doc["_rejectedDate"] + "<br>"
      returnText += "<b>Rejected By</b>: " + doc["_rejectedBy"] + "<br>"
    }
    returnText += "<pre id='json'></pre>"
    return returnText
  }

