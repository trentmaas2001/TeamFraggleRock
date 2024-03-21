const getURL = "http://localhost:3000/api/allnames/"
const searchParams = new URLSearchParams(window.location.search);
const docid = searchParams.get('docID');
const replaceURL = "http://localhost:3000/api/replaceone/"

let table
let displayDocument
let initial

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
          addRowInit(key)
        }
      }
  }

  function deleteFromTable(rowIndex) {
    table.deleteRow(rowIndex)
  }

  function saveData() {
    replacement = {}
    for (var i = 1, row; row = table.rows[i]; i++) {
        if (row.cells[1].getElementsByTagName('input')[0].value != '' && row.cells[2].getElementsByTagName('input')[0].value != '') {
          replacement[row.cells[1].getElementsByTagName('input')[0].value] = row.cells[2].getElementsByTagName('input')[0].value
        }
    }
    console.log(replacement)
    fetch(replaceURL + docid, {
      method: "POST",
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

  function addRowInit(key) {
    let row = table.insertRow(table.rows.length);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.innerHTML = "<button id='" + (table.rows.length - 1) + "' title='Delete' onclick='deleteFromTable(this.id)'>></button>"
    cell2.innerHTML = "<input type='text' value='" + key + "'></input>"
    cell3.innerHTML = "<input type='text' value='" + displayDocument[key] + "'></input>"
  }

  function addRow() {
    let row = table.insertRow(table.rows.length);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    cell1.innerHTML = "<button id='" + (table.rows.length - 1) + "' title='Delete' onclick='deleteFromTable(this.id)'>></button>"
    cell2.innerHTML = "<input type='text'></input>"
    cell3.innerHTML = "<input type='text'></input>"
  }

