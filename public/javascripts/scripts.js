const SERVER_URL = "http://localhost:3000"

function validateEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

function fetchUsers(url = null) {
  var myHeaders = new Headers();
  myHeaders.append("Access-Control-Allow-Origin", "*")
  let URL = !url ? SERVER_URL : url
  fetch(URL + '/users', {
      mode: 'cors',
      headers: myHeaders
    })
    .then(res => {
      return res.json()
    })
    .then(resJson => {
      var users = resJson.users
      console.log(resJson)
      var tableContainer = document.createElement("DIV")
      tableContainer.id = "table-container"
      var {
        domTable,
        listTable
      } = buildHTMLTable(users)
      var mainContainer = document.getElementById("table-container")
      mainContainer.append(domTable)
      buildPagination(resJson.pages)
    })
}

function getNextTableData(page, nPerPage) {
  var myHeaders = new Headers();
  myHeaders.append("Access-Control-Allow-Origin", "*")
  let URL = SERVER_URL
  fetch(URL + `/users?page=${page}&nPerPage=${nPerPage}`, {
      mode: 'cors',
      headers: myHeaders
    })
    .then(res => {
      return res.json()
    })
    .then(resJson => {
      var users = resJson.users
      console.log(resJson)
      var {
        domTable,
        listTable
      } = buildHTMLTable(users)
      var mainContainer = document.getElementById("table-container")
      while (mainContainer.hasChildNodes()) {
        mainContainer.removeChild(mainContainer.lastChild)
      }
      mainContainer.append(domTable)
    })
}

function buildPaginationLI(index) {
  var link = document.createElement("A")
  link.classList.add("page-link")
  link.href = "#"
  link.innerHTML = index
  var listElement = document.createElement("LI")
  listElement.onclick = function () {
    getNextTableData(index, 20)
  }
  listElement.classList.add("page-item")
  listElement.append(link)
  return listElement
}

function buildPagination(pages) {
  var tablePagination = document.getElementById("table-pagination")
  var list = tablePagination.querySelector("UL")

  for (var i = 1; i <= pages; i++) {
    let ref = list.childNodes[i]
    list.insertBefore(buildPaginationLI(i), ref.nextSibling)
  }
  tablePagination.style.display = "block"
}

function fetchByEmail() {
  var input = document.getElementById('email')
  var email = input.value

  if (!validateEmail(email)) {
    console.log('Not a valid email')
    input.value = ""
    return
  }
  var url = `${URL}/users/${email}`
  var myHeaders = new Headers();
  myHeaders.append("Access-Control-Allow-Origin", "*")
  input.value = ""
  fetch(url, {
      mode: 'cors',
      headers: myHeaders
    })
    .then(res => {
      return res.json()
    })
    .then(stuff => {
      var {
        user
      } = stuff
      if (user) {
        var personObject = document.getElementById("person-card")
        var cardText = personObject.getElementsByClassName("card-text")[0]
        var attrs = cardText.getElementsByTagName("p")
        for (var i = 0; i < attrs.length; i++) {
          var span = attrs[i].getElementsByTagName("span")[0]
          var id = span.id
          switch (id) {
            case "card-firstname":
              span.innerHTML = user.first_name
              break
            case "card-lastname":
              span.innerHTML = user.last_name
              break
            case "card-email":
              span.innerHTML = user.email
              break
            case "card-quote":
              span.innerHTML = user.quote
              break
          }
        }
        personObject.style.display = "block"
      } else {
        console.log('user does not exist')
      }
    })
}

function closePerson() {
  var personObject = document.getElementById("person-card")
  personObject.style.display = 'none'
}

function fetchByBirthday() {

  var url = `${URL}/by-birthday`
  var myHeaders = new Headers();
  myHeaders.append("Access-Control-Allow-Origin", "*")
  var tablesContainer = document.getElementById('table-container')
  console.log(tablesContainer)
  fetch(url, {
      mode: 'cors',
      headers: myHeaders
    })
    .then(res => {
      return res.json()
    })
    .then(stuff => {
      console.log(stuff)
      if (stuff.ok) {
        var {
          response
        } = stuff
        for (var i = 0; i < response.length; i++) {
          var yearObject = response[i]
          var year = yearObject._id
          var people = yearObject.people
          var yearTableContainer = document.createElement("div")
          yearTableContainer.id = year + '-table'
          yearTableContainer.classList.add("table-container-item")
          buildHTMLTable(people, yearTableContainer)
          tablesContainer.append(yearTableContainer)
        }

      }
    })
}

function addColumnHeader(list, table) {

  // Declare an empty array for saving and returning table head keys
  var columnSet = []
  // Create the Table Header and Insert The Row
  var header = table.createTHead()
  // Add a class for the Table Header Block
  header.classList.add("table-header")
  // Add the Table Header Row
  var headerRow = header.insertRow(0)
  // Add a class for the Table Header Row
  headerRow.classList.add("table-header-row")
  var firstCell = headerRow.insertCell(0)
  columnSet.push("#")
  firstCell.innerHTML = "#"
  firstCell.classList.add("table-header-cell")
  var headerIndex = 1

  for (var i = 0; i < list.length; i++) {
    var rowHash = list[i]
    for (var key in rowHash) {
      if (columnSet.indexOf(key) == -1) {
        columnSet.push(key)
        var cell = headerRow.insertCell(headerIndex)
        headerIndex++
        cell.classList.add("table-header-cell")
        cell.innerHTML = key
      }
    }
  }
  return columnSet
}

function buildHTMLTable(list) {
  console.log('Building tables', list)
  var newTable = []
  var table = document.createElement("TABLE")
  table.classList.add("table", "table-dark")
  var headerRow = addColumnHeader(list, table)
  console.log(headerRow)
  newTable.push(headerRow)

  var tBody = document.createElement("TBODY")
  tBody.classList.add("table-body")

  for (var i = 0; i < list.length; i++) {
    var rowArray = []
    var cellValue
    var row = tBody.insertRow(i)
    row.classList.add("table-body-row")
    for (var colIndex = 0; colIndex < headerRow.length; colIndex++) {
      if (colIndex == 0) {
        cellValue = i + 1
        rowArray.push(cellValue)
        var newCell = row.insertCell(colIndex)
        newCell.classList.add("table-row-cell")
        newCell.innerHTML = cellValue
      } else {
        cellValue = list[i][headerRow[colIndex]]
        cellValue = cellValue ? cellValue : ""
        rowArray.push(cellValue)
        var newCell = row.insertCell(colIndex)
        newCell.classList.add("table-row-cell")
        newCell.innerHTML = cellValue
      }
    }
    newTable.push(rowArray)
  }

  table.append(tBody)
  return {
    domTable: table,
    listTable: newTable
  }
}


// function buildHTMLTable(list, sel = null) {
//   var newTable = []
//   var columns = addColumnHeaders2(list, sel)
//   newTable.push(columns)

//   for (var i = 0; i < list.length; i++) {
//     var rowArray = []
//     var row = sel ? document.createElement("TR") : null
//     for (var colIndex = 0; colIndex < columns.length; colIndex++) {
//       var cellValue = list[i][columns[colIndex]]
//       cellValue = cellValue ? cellValue : ""
//       rowArray.push(cellValue)
//       if (row) {
//         var newRowItem = document.createElement("TD")
//         newRowItem.innerHTML = cellValue
//         row.append(newRowItem)
//         var sel$ = document.querySelector(sel)
//         sel$.append(row)
//       }
//     }
//     newTable.push(rowArray)
//   }
//   return newTable
// }


// function addColumnHeaders(list, sel = null) {
//   var columnSet = []
//   var headers = sel ? document.createElement("TR") : null

//   for (var i = 0; i < list.length; i++) {
//     var rowHash = list[i]
//     for (var key in rowHash) {
//       if (columnSet.indexOf(key) == -1) {
//         columnSet.push(key)
//         if (headers) {
//           var newItem = document.createElement("TH")
//           newItem.innerHTML = key
//           headers.append(newItem)
//         }
//       }
//     }
//   }
//   if (sel) {
//     var mySel = document.querySelector(sel)
//     mySel.append(headers)
//   }
//   return columnSet
// }