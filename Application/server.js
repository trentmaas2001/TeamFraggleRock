/* Initilize Dependecies and modules */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const database = require('./database')
const dbFunctions = require('./dbFunctions')
const { ObjectId } = require("mongodb")

/* Initize Passport for verification */
const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

/* users to be authenticated against */
let users

const port = 3000

/* set view-engine to use ejs instead of default html, other module initilization */
app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.static("views"))
app.use(express.json())
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

/* connection object to databse */
let conn

/* Requests to / will redirect the user to the app.ejs view if their role is user or the reviews page if they are an admin */
app.get('/', checkAuthenticated, (req, res) => {
  if (req.user.role == "user") {
	res.render('app.ejs', { name: req.user.name })
  } else {
	res.render('reviews.ejs', { name: req.user.name })
  }
})

/* Render Login Page */
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

/* Request to log into application using passport*/
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

/* request to insert Document into InWork Colection */
app.get('/newDoc', checkAuthenticated, (req, res) => {
  res.render('newDoc.ejs', { name: req.user.name })
})

/* request to render document view/editor */
app.get('/document', checkAuthenticated, (req, res) => {
  res.render('document.ejs', { name: req.user.name })
})

/* request to render review page */
app.get('/review', checkAuthenticated, (req, res) => {
  res.render('review.ejs', { name: req.user.name })
})

/* request to render all page containing all logs */
app.get('/logs', checkAuthenticated, (req, res) => {
  res.render('logs.ejs')
})

/* request to render log page */
app.get('/log', checkAuthenticated, (req, res) => {
  res.render('log.ejs')
})

/* request to render page for registering new user/admin */
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

/* builds out user information using information from req.body
 * user information is then pushed to current list of users and inserted into Users Collection on database
 * to keep user information in case the server needs to go down
 */
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
	newUser = {
		id: Date.now().toString(),
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
		password: hashedPassword
	  }
    users.push(newUser)
	dbFunctions.addAuthDoc(newUser)
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

// request to Submit Document for Review
app.post('/submit/:id/:user', checkAuthenticated, async (req, res) => {
	const id = req.params.id
	const user = req.params.user
	dbFunctions.submitDoc(id, user)
})

// request to Accept changes made to database
app.post('/accept/:id/:user', checkAuthenticated, async (req, res) => {
	const id = req.params.id
	const user = req.params.user
	dbFunctions.acceptDoc(id, user)
	res.redirect('/')
})

// request to Reject changes made to database
app.delete('/reject/:id/:user', checkAuthenticated, async (req, res) => {
	const id = req.params.id
	const user = req.params.user
	dbFunctions.rejectDoc(id, user)
	res.redirect('/')
})

// request to logout from application
app.delete('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

// check if user is authenticated if they are not redirect them to login page
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

// check if user is not authenticated if they are make get request for /
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

// Get all documents from collection indicated by coll urlParam
app.get("/api/allnames/:coll", async (req, res) => {
	let coll = req.params.coll
	try {
		const docs = await dbFunctions.getAllDocs(coll)
		init = docs
		res.json(docs) 
	}
	catch (err) {
		console.error("# Get Error", err)
		res.status(500).send({ error: err.name + ", " + err.message })
	}
})

// Get single doc from Collection specified by coll urlParam with id matching id urlParam
app.get("/getDoc/:coll/:id", async (req, res) => {
	let coll = req.params.coll
	let id = req.params.id
	try {
		const doc = await dbFunctions.getDoc(coll, id)
		res.json(doc) 
	}
	catch (err) {
		console.error("# Get Error", err)
		res.status(500).send({ error: err.name + ", " + err.message })
	}
})

// Request to add a document to InWork Collection
app.post('/api/addDoc/', async (req, res) => {
	let data = req.body; 
	try {
		data = await dbFunctions.addDoc(data)
		res.json(data)
	}
	catch (err) {
		console.error("# Post Error", err)
		res.status(500).send({ error: err.name + ", " + err.message })
	}
});

// Request to delete a document from InWork Collection with id matching id urlParam
app.delete("/api/deletename/:id/", async (req, res) => {
	const id = req.params.id
	let respObj = {}
	
	if (id && ObjectId.isValid(id)) {
		try {
			respObj = await dbFunctions.deleteDoc(id)
		}
		catch (err) {
			console.error("# Delete Error", err)
			res.status(500).send({ error: err.name + ", " + err.message })
			return
		}		
	}
	else {
		respObj = { message: "Data not deleted; the id to delete is not valid!" }
	}
	
	res.json(respObj)
})

// Request to replace contents of a document to InWork Collection with id matching ir urlParam
app.post("/api/replaceone/:id/", async (req, res) => {
	const id = req.params.id
	const replacement = req.body
	try {
    respObj = await dbFunctions.replaceDoc(id, replacement);
	} catch (err) {
		console.error("# Replace Error", err)
		res.status(500).send({ error: err.name + ", " + err.message })
		return
	}
})

let server

/* server startup */
(async () => {
	try {
		/* Start server listing on port 3000 */
		server = app.listen(port, () => {
			console.log("# App server listening on port " + port)
		})
		/* Connect to Database */
    	connString = 'mongodb://localhost:27017'
    	conn = await database(connString)
		await dbFunctions.getDb(conn)
		/* Get list of users to authenticate against */
		users = await dbFunctions.getAllDocs("Users")
	}
	catch(err) {
		console.error("# Error:", err)
		console.error("# Exiting the application.")
		await closing()
		process.exit(1)
	}
})()

/* Close server in case of error */
async function closing() {
	console.log("# Closing resources...")
	if (conn) {
		await conn.close()
		console.log("# Database connection closed.")
	}
	if (server) {
		server.close(() => console.log("# Web server stopped."))
	}
}