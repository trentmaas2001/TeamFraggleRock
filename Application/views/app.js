const rowSelectColor = "#F5F5F5"
const rowClearColor = "white"
const getURL = "http://localhost:3000/api/allnames/"
const postURL = "http://localhost:3000/api/addname/"
const deleteURL = "http://localhost:3000/api/deletename/"
const rootURL = "http://localhost:3000"

/* DOM Element that last called the modal used for deleting table rows */
let relatedButtonDataTable
/* DOM Element for table holding data */
let table
let url
let submitUrl

/* Functions */

window.onload = () => {
  table = document.getElementById("data-table")
  /* listener event for showing modal and storing the button DOM object used to reveal modal dialog */ 
  let deleteRowModal = document.getElementById('deleteRowModal')
  deleteRowModal.addEventListener('show.bs.modal', event => {
    relatedButtonDataTable = event.relatedTarget
  })
  loadData()
}

/*
 * Routine to get all the database rows and populate the HTML table.
 * Makes the get request using the fetch API.
 * The response from the fetch has the data retrieved from the database.
 */
function loadData() {

  fetch(getURL + "InWork")
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
  url = rootURL + "/document?docID=" + doc._id
  /* Insert Row */
  const row = table.insertRow(table.rows.length);
  submitUrl = rootURL + "/submit?docID=" + doc.id
  /* Insert Cells into Row */ 
  const cell1 = row.insertCell(0)
  const cell2 = row.insertCell(1)
  const cell3 = row.insertCell(2)
  /* Make call to build preview of document to display to user */
  previewText = buildPreviewText(doc)
  /* Build out Action Buttons for first column and set the HTML for the cell
   * Documents that are Submitted for Review should not have any Actions
   * Documents that are Approved or Rejected should not have the option to be Submitted for Review 
   */
  if (doc._status != "Submitted for Review") {
    buttonsCell = "<a href=" + url + "><button class='btn btn-success buttons'>Edit</button></a><button title='Delete' type='button' id='" + doc._id + "' class='buttons btn btn-success' data-bs-toggle='modal' data-bs-target='#deleteRowModal'>Delete</button>"
    if (doc._status != "Approved" && doc._status != "Rejected") {
      buttonsCell += '<button id="' + doc._id + '" type="button" class="btn btn-success" onclick="submitForReview(this)">Submit For Review</button>'
    }
    cell1.innerHTML = buttonsCell
  } else {
    cell1.innerHTML = "No Actions for this Document"
  }
  /* Set HTML of 2nd and 3rd Column cells */
  cell2.innerHTML = previewText
  cell3.innerHTML = doc._status
}

/* Make call to Delete document from InWork database and html table */
function deleteFromDB() {
  id = relatedButtonDataTable.getAttribute('id')
  fetch(deleteURL + id, { method: "DELETE" })
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {
        return res.text().then(text => { throw new Error(text) })
      }
    })
    .then(data => {
      deleteFromTable(data.deletedCount)
    })
    .catch(error => {
      console.error("# Error:", error)
      const msg = "Error: " + error.message + ". " +
        "There was an error while deleting the data. " + 
        "See browser's console for more details."
    })
}

/* Delete row from table that holds the relatedButtonDataTable DOM Element */
function deleteFromTable() {
  table.deleteRow(relatedButtonDataTable.parentElement.parentElement.rowIndex)
}

/* Make changes to Table row to indicate that the selected document has been submitted for review 
 * Make call to Update InWork document status and create a review document in the Review Collection
 */ 
function submitForReview(rowButton) {
  // Update table
  let row = rowButton.parentElement.parentElement
  let cells = row.cells
  cells[0].innerHTML = "No Actions for this Document"
  cells[2].innerHTML = "Submitted for Review"
  // Make request to update Database
  fetch(rootURL + "/submit/" + rowButton.getAttribute("id") + "/" + logUser, { method: "POST" })
  .then(res => {
    if (res.ok) {
      return res.json()
    }
    else {
      return res.text().then(text => { throw new Error(text) })
    }
  })
  .catch(error => {
    console.error("# Error:", error)
    const msg = "Error: " + error.message + ". " +
      "There was an error while submitting for review. " + 
      "See browser's console for more details."
  })
}

/* Builds out preview html for each row 
 * If the document holds more than 5 pairs More... text is added to indicate that the document contains more content than the preview
 * Array and LongText objects do not show their contents only the key name and Array size.
 * Does not show _id or _status
 */
function buildPreviewText(doc) {
  returnText = "{<br>"
  i=0
  for (const key in doc) {
    if (i>4) {
      returnText += "More...<br>"
      break
    } else {
      if (key != '_id' && key != '_status') {
        if (typeof doc[key] != "object") {
          returnText += ("&ensp;" + key + " : " + doc[key] + "<br>")
        } else if (doc[key] instanceof Array) {
          returnText += ("&ensp;" + key + ": Array(" + doc[key].length + ")<br>")
        } else {
          returnText += ("&ensp;" + key + ": LongText<br>")
        }
        i += 1
      }
    }
  }
  returnText += "}"
  return returnText
}