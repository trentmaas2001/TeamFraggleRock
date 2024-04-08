const getURL = "http://localhost:3000/api/allnames/"
const searchParams = new URLSearchParams(window.location.search);
const docid = searchParams.get('docID');
const replaceURL = "http://localhost:3000/api/replaceone/"

let table
let displayDocument
let initial
let tmceInstances = 0
let relatedButtonDataTable
let relatedButtonArrayTable

window.onload = () => {
    table = document.getElementById("data-table")
    console.log(docid);
    let deleteRowModal = document.getElementById('deleteRowModal')
    let deleteArrayItemModal = document.getElementById('deleteArrayItemModal')
    deleteRowModal.addEventListener('show.bs.modal', event => {
      relatedButtonDataTable = event.relatedTarget
    })
    deleteArrayItemModal.addEventListener('show.bs.modal', event => {
      relatedButtonArrayTable = event.relatedTarget
    })
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

  function deleteFromDocTable() {
    table.deleteRow(relatedButtonDataTable.parentElement.parentElement.rowIndex)
  }

  function saveData() {
    
    replacement = {}
    for (var i = 1, row; row = table.rows[i]; i++) {
      if (row.classList.contains('text')) {
        if (row.cells[1].getElementsByTagName('input')[0].value != '' && row.cells[2].getElementsByTagName('input')[0].value != '') {
          replacement[row.cells[1].getElementsByTagName('input')[0].value] = row.cells[2].getElementsByTagName('input')[0].value
        }
      } else if (row.classList.contains('array')){
        if (row.cells[1].getElementsByTagName('input')[0].value != '' && row.cells[2].getElementsByTagName('table')[0].rows.length > 1) {
          let tempArray = []
          for (var j = 0, listRow; listRow = row.cells[2].getElementsByTagName('table')[0].rows[j], j < row.cells[2].getElementsByTagName('table')[0].rows.length - 1; j++) {
            tempArray.push(listRow.cells[0].getElementsByTagName('input')[0].value)
          }
          replacement[row.cells[1].getElementsByTagName('input')[0].value] = tempArray
        }
      } else {
        tinymceId = row.cells[2].getElementsByTagName('textarea')[0].getAttribute('id')
        if (row.cells[1].getElementsByTagName('input')[0].value != '' && tinymce.get(tinymceId).getContent()) {
          tinymceOutput = {}
          tinymceOutput["data"] = tinymce.get(tinymceId).getContent();
          replacement[row.cells[1].getElementsByTagName('input')[0].value] = tinymceOutput
        }
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
    let actionButtons = "<button title='Delete' type='button' class='buttons' data-bs-toggle='modal' data-bs-target='#deleteRowModal'>Delete</button>"
    actionButtons += "<button class='list buttons' title='Convert to List' onclick='convertToList(this)'>List</button>"
    actionButtons += "<button class='text buttons' title='Convert to Text' onclick='convertToText(this)'>Text</button>"
    actionButtons += "<button class='longtext buttons' title='Convert to Long Text' onclick='convertToLongText(this)'>Long Text</button>"
    cell1.innerHTML = actionButtons
    cell2.innerHTML = "<input type='text' value='" + key + "'></input>"
    if (typeof displayDocument[key] != "object") {
      hideButton = cell1.getElementsByClassName('text')[0]
      hideButton.setAttribute('hidden', 'hidden')
      cell3.innerHTML = "<input type='text' value='" + displayDocument[key] + "'></input>"
      row.setAttribute('class', 'text')
    } else if (displayDocument[key] instanceof Array) {
      hideButton = cell1.getElementsByClassName('list')[0]
      hideButton.setAttribute('hidden', 'hidden')
      let arrayTable = document.createElement('table');
      for (let i = 0; i < displayDocument[key].length; ++i) {
        let itemRow = arrayTable.insertRow(arrayTable.rows.length)
        let item = itemRow.insertCell(0);
        let delButton = itemRow.insertCell(1);
        item.innerHTML = "<input type='text' value='" + displayDocument[key][i] + "'></input>"
        delButton.innerHTML = "<button type='button' class='btn btn-secondary' data-bs-toggle='modal' data-bs-target='#deleteArrayItemModal'>X</button>"
      }
      itemRow = arrayTable.insertRow(arrayTable.rows.length)
      buttonCell = itemRow.insertCell(0)
      buttonCell.innerHTML = "<button class='buttons' onclick='appendToArrayTable(this)'>Append Item To List</button>"
      cell3.innerHTML = '<table>' + arrayTable.innerHTML + '</table>'
      row.setAttribute('class', 'array')
    } else {
      hideButton = cell1.getElementsByClassName('longtext')[0]
      hideButton.setAttribute('hidden', 'hidden')
      instanceString = "instance" + tmceInstances
      tmceInstances += 1
      cell3.innerHTML = "<form><textarea name='" + instanceString + "' id='" + instanceString + "'></textarea>"
      tinymce.init({
        selector: "#" + instanceString,
        promotion: false,
        resize: false,
        width: 600,
        max_chars : 500,
        setup: (editor) => {
          editor.on('init', () => {
            editor.setContent(displayDocument[key].data);
          });
        },
      });
    }
  }

  function addRow() {
    let row = table.insertRow(table.rows.length);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let actionButtons = "<button title='Delete' type='button' class='buttons' data-bs-toggle='modal' data-bs-target='#deleteRowModal'>Delete</button>"
    actionButtons += "<button class='list buttons' title='Convert to List' onclick='convertToList(this)'>Text</button>"
    actionButtons += "<button class='text buttons' hidden='hidden' title='Convert to Text' onclick='convertToText(this)'>List</button>"
    actionButtons += "<button class='longtext buttons' title='Convert to Long Text' onclick='convertToLongText(this)'>Long Text</button>"
    cell1.innerHTML = actionButtons
    cell2.innerHTML = "<input type='text'></input>"
    cell3.innerHTML = "<input type='text'></input>"
  }

  function deleteFromArrayTable() {
    let arrayTable = relatedButtonArrayTable.parentElement.parentElement.parentElement
    arrayTable.deleteRow(relatedButtonArrayTable.parentElement.parentElement.rowIndex)
  }

  function appendToArrayTable(button) {
    let arrayTable = button.parentElement.parentElement.parentElement
    let newRow = arrayTable.insertRow(arrayTable.rows.length - 1)
    let item = newRow.insertCell(0);
    let delButton = newRow.insertCell(1);
    item.innerHTML = "<input type='text'></input>"
    delButton.innerHTML = "<button type='button' class='btn btn-secondary' data-bs-toggle='modal' data-bs-target='#deleteArrayItemModal'>X</button>"
  }

  function convertToList(button) {
    row = button.parentElement.parentElement
    if (row.classList.contains('text')) {
      row.classList.remove('text')
      row.cells[0].getElementsByClassName('text')[0].removeAttribute('hidden')
    } else {
      row.classList.remove('longtext')
      row.cells[0].getElementsByClassName('longtext')[0].removeAttribute('hidden')
    }
    row.classList.add('array')
    row.cells[0].getElementsByClassName('list')[0].setAttribute('hidden', 'hidden')
    cell = row.cells[2]
    let arrayTable = document.createElement('table');
    let itemRow = arrayTable.insertRow(0)
    let item = itemRow.insertCell(0);
    let delButton = itemRow.insertCell(1);
    item.innerHTML = "<input type='text'></input>"
    delButton.innerHTML = "<button type='button' class='btn btn-secondary' data-bs-toggle='modal' data-bs-target='#deleteArrayItemModal'>X</button>"
    itemRow = arrayTable.insertRow(1)
    buttonCell = itemRow.insertCell(0)
    buttonCell.innerHTML = "<button class='buttons' onclick='appendToArrayTable(this)'>Append Item To List</button>"
    cell.innerHTML = '<table>' + arrayTable.innerHTML + '</table>'
  }

  function convertToText(button) {
    row = button.parentElement.parentElement
    if (row.classList.contains('array')) {
      row.classList.remove('array')
      row.cells[0].getElementsByClassName('list')[0].removeAttribute('hidden')
    } else {
      row.classList.remove('longtext')
      row.cells[0].getElementsByClassName('longtext')[0].removeAttribute('hidden')
    }
    row.classList.add('text')
    row.cells[0].getElementsByClassName('text')[0].setAttribute('hidden', 'hidden')
    cell = row.cells[2]
    cell.innerHTML = "<input type='text'></input>"
  }

  function convertToLongText(button) {
    row = button.parentElement.parentElement
    if (row.classList.contains('text')) {
      row.classList.remove('text')
      row.cells[0].getElementsByClassName('text')[0].removeAttribute('hidden')
    } else {
      row.classList.remove('array')
      row.cells[0].getElementsByClassName('list')[0].removeAttribute('hidden')
    }
    row.classList.add('longtext')
    row.cells[0].getElementsByClassName('longtext')[0].setAttribute('hidden', 'hidden')
    cell = row.cells[2]
    instanceString = "instance" + tmceInstances
    tmceInstances += 1
    cell.innerHTML = "<form><textarea name='" + instanceString + "' id='" + instanceString + "'></textarea>"
    tinymce.init({
      selector: "#" + instanceString,
      promotion: false,
      resize: false,
      width: 600,
      max_chars : 500
    });
  }

