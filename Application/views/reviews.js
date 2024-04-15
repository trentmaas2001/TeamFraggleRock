const rowSelectColor = "#F5F5F5"
const rowClearColor = "white"
const getURL = "http://localhost:3000/api/allnames/"
const postURL = "http://localhost:3000/api/addname/"
const deleteURL = "http://localhost:3000/api/deletename/"
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

  fetch(getURL + "Review")
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
  url = rootURL + "/review?docID=" + doc._id
  /* Insert Row and Cells and set html for each cell*/
  const row = table.insertRow(table.rows.length);
  const cell1 = row.insertCell(0)
  const cell2 = row.insertCell(1)
  const cell3 = row.insertCell(2)
  previewText = buildPreviewText(doc)
  buttonsCell = "<a href=" + url + "><button class='btn btn-success buttons'>Review</button></a>"
  cell1.innerHTML = buttonsCell
  cell2.innerHTML = previewText
  cell3.innerHTML = doc._action
}

/* Builds out preview html for each row 
 * If the document holds more than 3 pairs More... text is added to indicate that the document contains more content than the preview
 * Array and HTML objects do not show their contents only the key name and Array size.
 * Does not show _id, _action, _date, or _submittedBy this content is instead shown above the preview labelled
 */
function buildPreviewText(doc) {
  returnText = "<b>Date Submitted</b>: " + doc["_date"] + "<br>"
  returnText += "<b>Submitted By</b>: " + doc["_submittedBy"] + "<br>"
  returnText += "{<br>"
  i=0
  for (const key in doc) {
    if (i>2) {
      returnText += "More...<br>"
      break
    } else {
      if (key != '_id' && key != '_submittedBy' && key != '_action' && key != '_date') {
        if (typeof doc[key] != "object") {
          returnText += ("&ensp;" + key + " : " + doc[key] + "<br>")
        } else if (doc[key] instanceof Array) {
          returnText += ("&ensp;" + key + ": Array(" + doc[key].length + ")<br>")
        } else {
          returnText += ("&ensp;" + key + ": HTML<br>")
        }
        i += 1
      }
    }
  }
  returnText += "}"
  return returnText
}