const getURL = "http://localhost:3000/api/allnames/"
const searchParams = new URLSearchParams(window.location.search);
const docid = searchParams.get('docID');

let table
let displayDocument

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
          cell1.innerHTML = key
          cell2.innerHTML = displayDocument[key]
        }
      }
  }