const rowSelectColor = "#F5F5F5"
const rowClearColor = "white"
const getURL = "http://localhost:3000/api/allnames/"
const postURL = "http://localhost:3000/api/addname/"
const deleteURL = "http://localhost:3000/api/deletename/"
const rootURL = "http://localhost:3000"

let selectedRowIx
let prevSelection
let table
let url

/* Functions */

window.onload = () => {
  table = document.getElementById("data-table")
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
    .then(n => {
      if (n > 0) {
        selectRow()
        scrollToSelection()
      }
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

  selectedRowIx = table.rows.length
  url = rootURL + "/document.html?docID=" + doc._id
  const row = table.insertRow(selectedRowIx);
  
  const cell1 = row.insertCell(0)
  const cell2 = row.insertCell(1)
  const cell3 = row.insertCell(2)
  cell1.innerHTML = "<a href=" + url + "><button>></button></a>"
  cell2.innerHTML = doc.title
  cell3.innerHTML = doc.genre
}

function selectRow(obj) {

  const row = (obj) ? obj.parentElement.parentElement : table.rows[table.rows.length - 1]
  selectedRowIx = row.rowIndex

  setSelection(row)
}

function setSelection(row) {
  row.style.backgroundColor = rowSelectColor

  if (prevSelection && prevSelection !== selectedRowIx) {
    table.rows[prevSelection].style.backgroundColor = rowClearColor
  }

  prevSelection = selectedRowIx
}

function scrollToSelection() {

  const ele = document.getElementById("table-wrapper")
  const bucketHt = ele.clientHeight
  const itemHt = ele.scrollHeight / table.rows.length
  const noItemsInBucket = parseInt(bucketHt / itemHt)
  const targetBucket = (selectedRowIx + 1) / noItemsInBucket
  const scrollPos = (bucketHt * (targetBucket - 1)) + (bucketHt / 2)
  ele.scrollTop = Math.round(scrollPos)
}

/*
 * Routine to add a new person data to the HTML table and the database.
 * Makes the post request using the fetch API.
 * The response from the fetch has the confirmation message about the
 * newly inserted document.
 */
function addData() {

  const name = document.getElementById("name").value
  const country = document.getElementById("country").value

  if (!name) {
    alert("Name is required!!")
    document.getElementById("name").focus()
    return
  }
  if (!country) {
    alert("Country is required!!")
    document.getElementById("country").focus()
    return
  }

  postToDB({ name: name, country: country })
}

function postToDB(doc) {

  fetch(postURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(doc)
    })
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      else {
        return res.text().then(text => { throw new Error(text) })
      }
    })
    .then(data => {
      const id = data.insertedId
      if (id) {
        doc._id = id
        addToTable(doc)
        table.rows[selectedRowIx].style.backgroundColor = rowSelectColor
        if (prevSelection) {
          table.rows[prevSelection].style.backgroundColor = rowClearColor
        }
        prevSelection = selectedRowIx
        scrollToSelection()
      }
    })
    .catch(error => {
      console.error("# Error:", error)
      const msg = "Error: " + error.message + ". " +
        "There was an error posting data to the database. " + 
        "See browser's console for more details."
    })
}

function deleteFromDB(id) {

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

function deleteFromTable(deletedCount) {

  if (deletedCount > 0) {
    table.deleteRow(selectedRowIx)
    initValues() 
  }
}

function initValues() {

    selectedRowIx = null
    prevSelection = null
    document.getElementById("name").value = ""
    document.getElementById("country").value = "" 
}

/*
 * Routine to clear the selected row in the HTML table as well
 * as the input fields.
 */
function clearData() {

  if (selectedRowIx) {
    table.rows[selectedRowIx].cells.item(2).firstChild.checked = false
    table.rows[selectedRowIx].style.backgroundColor = rowClearColor
  }

  initValues()
}

/*
 * Routine for selecting the first or the last row of the HTML table 
 * (depending upon the parameter "n" - the value 1 for selecting the first
 * row, otherwise the last one).
 */
function selectTopOrBottomRow(n) {

  if (table.rows.length < 2) {
    return
  }

  selectedRowIx = (n === 1) ? 1 : (table.rows.length - 1)

  const row = table.rows[selectedRowIx]
  setSelection(row)
  row.cells[2].children[0].checked = true
  scrollToSelection()
}