const rowSelectColor = "#F5F5F5"
const rowClearColor = "white"
const getURL = "http://localhost:3000/api/allnames/"
const rootURL = "http://localhost:3000"

let relatedButtonDataTable
let table
let url
let submitUrl

/* Functions */

window.onload = () => {
  table = document.getElementById("data-table")
  loadData()
}

/*
 * Routine to get all the database rows and populate the HTML table.
 * Makes the get request using the fetch API.
 * The response from the fetch has the data retrieved from the database.
 */
function loadData() {

  fetch(getURL + "Logging")
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {
        return res.text().then(text => { throw new Error(text) })
      }
    })
    .then(docs => {
      buildTable(docs)
      return docs.length
    })
    .catch(error => {
      console.error("# Error:", error)
      const msg = "Error: " + error.message + ". " +
        "The web server or database may not have started. " +
        "See browser's console for more details."
    })
} 

/* Make call to add row to table for each document returned from the database */
function buildTable(data) {
  data.forEach(doc => addToTable(doc))
}

/* Builds out table row html using the data gathered from the database */
function addToTable(doc) {
  url = rootURL + "/log?docID=" + doc._id
  /* Insert Row and Cells and set html for each cell*/
  const row = table.insertRow(table.rows.length);
  const cell1 = row.insertCell(0)
  const cell2 = row.insertCell(1)
  previewText = buildPreviewText(doc)
  buttonsCell = "<a href=" + url + "><button class='btn btn-success buttons'>View</button></a>"
  cell1.innerHTML = buttonsCell
  cell2.innerHTML = previewText
}

/* Builds out preview html for each row 
 * Meta Data is shown for the preview does not show content accepted/rejected to/from database
 */
function buildPreviewText(doc) {
  returnText = "<b>Submitted By</b>: " + doc["_submittedBy"] + "<br>"
  returnText += "<b>Submitted Action</b>: " + doc["_action"] + "<br>"
  if (doc["_acceptedDate"]) {
    returnText += "<b>Accepted On</b>: " + doc["_acceptedDate"] + "<br>"
    returnText += "<b>Accepted By</b>: " + doc["_acceptedBy"] + "<br>"
  } else {
    returnText += "<b>Rejected On</b>: " + doc["_rejectedDate"] + "<br>"
    returnText += "<b>Rejected By</b>: " + doc["_rejectedBy"] + "<br>"
  }
  return returnText
}