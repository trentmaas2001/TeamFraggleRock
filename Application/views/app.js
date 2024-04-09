const rowSelectColor = "#F5F5F5"
const rowClearColor = "white"
const getURL = "http://localhost:3000/api/allnames/"
const postURL = "http://localhost:3000/api/addname/"
const deleteURL = "http://localhost:3000/api/deletename/"
const rootURL = "http://localhost:3000"

let relatedButtonDataTable
let table
let url

/* Functions */

window.onload = () => {
  table = document.getElementById("data-table")
  let deleteRowModal = document.getElementById('deleteRowModal')
  deleteRowModal.addEventListener('show.bs.modal', event => {
    relatedButtonDataTable = event.relatedTarget
  })
  loadData()
}

/*
 * Routine to get all the database rows and populate the HTML table.
 * Makes the get request using the fetch API.
 * The response from the fetch has the data.
 */
function loadData() {

  fetch(getURL)
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

function buildTable(data) {
  data.forEach(doc => addToTable(doc))
}

function addToTable(doc) {
  url = rootURL + "/document?docID=" + doc._id
  const row = table.insertRow(table.rows.length);
  
  const cell1 = row.insertCell(0)
  const cell2 = row.insertCell(1)
  previewText = buildPreviewText(doc)
  cell1.innerHTML = "<a href=" + url + "><button class='btn btn-success buttons'>Edit</button></a><button title='Delete' type='button' id='" + doc._id + "' class='buttons btn btn-success' data-bs-toggle='modal' data-bs-target='#deleteRowModal'>Delete</button>"
  cell2.innerHTML = previewText
}

function deleteFromDB() {
  id = relatedButtonDataTable.getAttribute('id')
  fetch(deleteURL + id + "/" + logUser, { method: "DELETE" })
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

function deleteFromTable() {
  table.deleteRow(relatedButtonDataTable.parentElement.parentElement.rowIndex)
}

function buildPreviewText(doc) {
  returnText = "{<br>"
  i=0
  for (const key in doc) {
    if (i>4) {
      returnText += "More...<br>"
      break
    } else {
      if (key != '_id') {
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