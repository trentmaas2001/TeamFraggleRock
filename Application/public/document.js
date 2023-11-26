const getURL = "http://localhost:3000/api/allnames/"
const searchParams = new URLSearchParams(window.location.search);
const docid = searchParams.get('docID');
const replaceURL = "http://localhost:3000/api/replaceone/"

let table
let displayDocument
let selectedRowIx

window.onload = () => {
    table = document.getElementById("data-table")
    console.log(docid);
    loadData()
  }
  
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
        buildData(docs)
        return docs.length
      })
      .catch(error => {
        console.error("# Error:", error)
        const msg = "Error: " + error.message + ". " +
          "The web server or database may not have started. " +
          "See browser's console for more details."
      })
  }
  
  function buildData(data) {
    data.forEach(doc => {
      if (doc._id == docid) { 
        displayDocument = doc;
      }
    });
    for (const key in displayDocument) {
        if (key != '_id') {
          selectedRowIx = table.rows.length;
          let row = table.insertRow(selectedRowIx);
          let cell1 = row.insertCell(0);
          let cell2 = row.insertCell(1);
          let cell3 = row.insertCell(2);
          cell1.innerHTML = key
          cell2.innerHTML = "<input type='text' value='" + displayDocument[key] + "'></input>"
          cell3.innerHTML = "<input type='radio' name='select' onclick='selectRow(this)' checked>"
          cell3.className = "tradio"
        }
      }
  }

  function selectRow(obj) {

    const row = (obj) ? obj.parentElement.parentElement : table.rows[table.rows.length - 1]
    selectedRowIx = row.rowIndex
  }

  function deleteFromTable() {
    table.deleteRow(selectedRowIx)
    selectedRowIx = -1
  }

  function saveData() {
    replacement = {}
    for (var i = 1, row; row = table.rows[i]; i++) {
        replacement[row.cells[0].innerHTML] = row.cells[1].getElementsByTagName('input')[0].value
    }
    console.log(replacement)
    fetch(replaceURL + docid, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(replacement)
    })
    .catch(error => {
      console.error("# Error:", error)
      const msg = "Error: " + error.message + ". " +
        "There was an error posting data to the database. " + 
        "See browser's console for more details."
      document.getElementById("status").innerHTML = msg
    })
  }