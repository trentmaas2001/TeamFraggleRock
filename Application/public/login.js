const port = 3000

let conn

const loginURL = "http://localhost:3000/api/login/"

async function dbConnection() {
	username = document.getElementById('user').value
	password = "/" + document.getElementById('password').value
	console.log("login")
	fetch(loginURL + username + password, {
	    method: "POST",
	    headers: {
	    },
	})
	.catch(error => {
	    console.error("# Error:", error)
	    const msg = "Error: " + error.message + ". " +
		    "There was an error logging in. " + 
		    "See browser's console for more details."
	    document.getElementById("status").innerHTML = msg
	})
	window.open("http://localhost:3000/app.html", "_self")
}
