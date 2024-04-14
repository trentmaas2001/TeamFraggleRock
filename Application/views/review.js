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
   * Routine to get the review with the same id passed as a urlParam
   * Makes the get request using the fetch API.
   * The response from the fetch has the review to be displayed/edited
   */
  function loadData() {
  
    fetch(getURL + "Review/" + docid)
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

  /* Function called by JSON.stringify() to not return _id, _submiitedBy, _action, or _date keys in document display */
  function replacer(key, value) {
    // Filtering out properties
    if (key === "_id" || key === "_submittedBy" || key === "_action" || key === "_date") {
      return undefined;
    }
    return value;
  }
  
  /* Build contents of Review Document Display */
  function buildData(data) {
    documentDiv.innerHTML = buildDocument(data)
    document.getElementById('json').textContent = JSON.stringify(data, replacer, "    ")
  }

  /* Builds Metadata information built by the application and not the user */
  function buildDocument(doc) {
    returnText = "<b>Date Submitted</b>: " + doc["_date"] + "<br>"
    returnText += "<b>Requested Action</b>: " + doc["_action"] + "<br>"
    returnText += "<b>Submitted By</b>: " + doc["_submittedBy"] + "<br>"
    returnText += "<pre id='json'></pre>"
    return returnText
  }

  /* Makes fetch to accept changes requested for this document
   * This will set the status of the corresponding InWork document to Approved
   * Then remove the review from the Review Collection
   * Then Add the document information into the Approved Collection
   * Then Log the action in the Logging Collection
   */
  function acceptChanges() {
    fetch(rootURL + "accept/" + docid + "/" + logUser, { method: "POST" })
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {
        return res.text().then(text => { throw new Error(text) })
      }
    })
    .then(open(('/'), '_self'))
    .catch(error => {
      console.error("# Error:", error)
      const msg = "Error: " + error.message + ". " +
        "There was an error while accepting changes. " + 
        "See browser's console for more details."
    })
  }

  /* Makes fetch to reject the changes requested for this document
   * This will set the status of the corresponding InWork document to Rejected
   * Then remove the review from the Review Collection
   * Then Log the action in the Logging Collection
   */
  function rejectChanges() {
    fetch(rootURL + "reject/" + docid + "/" + logUser, { method: "DELETE" })
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {
        return res.text().then(text => { throw new Error(text) })
      }
    })
    .then(open(('/'), '_self'))
    .catch(error => {
      console.error("# Error:", error)
      const msg = "Error: " + error.message + ". " +
        "There was an error while rejecting changes. " + 
        "See browser's console for more details."
    })    
  }


