const searchParams = new URLSearchParams(window.location.search);
const docid = searchParams.get('docID');
const insertURL = "http://localhost:3000/api/addDoc"
const replaceURL = "http://localhost:3000/api/replaceone/"

let table
let displayDocument
let initial
let tmceInstances = 0
let relatedButtonDataTable
let relatedButtonArrayTable
let isAdded = false
let newID

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
    addRow()
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
    fetch(insertURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(replacement)
        })
        .then(res => {
        if (res.ok) {
              return res.json()
            }
            else {
              return res.text().then(text => { throw new Error(text) })
            }
          })
          .then(returnJson => {
            newID = returnJson.insertedId
            open(('http://localhost:3000/document.html?docID=' + newID), '_self')
          })
          .catch(error => {
            console.error("# Error:", error)
            const msg = "Error: " + error.message + ". " +
              "There was an error posting data to the database. " + 
              "See browser's console for more details."
            document.getElementById("status").innerHTML = msg
          })
  }


  function addRow() {
    let row = table.insertRow(table.rows.length);
    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    row.setAttribute('class', 'text')
    let actionButtons = "<button title='Delete' type='button' class='buttons' data-bs-toggle='modal' data-bs-target='#deleteRowModal'>Delete</button>"
    actionButtons += "<button class='list buttons' title='Convert to List' onclick='convertToList(this)'>List</button>"
    actionButtons += "<button class='text buttons' hidden='hidden' title='Convert to Text' onclick='convertToText(this)'>Text</button>"
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

