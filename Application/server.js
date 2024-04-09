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

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const port = 3000

const users = [{
}]

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

let conn

let init

app.get('/', checkAuthenticated, (req, res) => {
  res.render('app.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/newDoc', checkAuthenticated, (req, res) => {
  res.render('newDoc.ejs', { name: req.user.name })
})

app.get('/document', checkAuthenticated, (req, res) => {
  res.render('document.ejs', { name: req.user.name })
})

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.get("/api/allnames", async (req, res) => {
	try {
		const docs = await dbFunctions.getAllDocs()
		init = docs
		res.json(docs) 
	}
	catch (err) {
		console.error("# Get Error", err)
		res.status(500).send({ error: err.name + ", " + err.message })
	}
})

app.post('/api/addDoc/:user', async (req, res) => {
  const user = req.params.user
	let data = req.body; 
	try {
		data = await dbFunctions.addDoc(data, user)
		res.json(data)
	}
	catch (err) {
		console.error("# Post Error", err)
		res.status(500).send({ error: err.name + ", " + err.message })
	}
});

app.delete("/api/deletename/:id/:user", async (req, res) => {

	const id = req.params.id
  const user = req.params.user
	let respObj = {}
	
	if (id && ObjectId.isValid(id)) {
		try {
			respObj = await dbFunctions.deleteDoc(id, user)
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

app.post("/api/replaceone/:id/:user", async (req, res) => {
	const id = req.params.id
  const user = req.params.user
	const replacement = req.body
	try {
    respObj = await dbFunctions.replaceDoc(id, replacement, user, init);
	} catch (err) {
		console.error("# Replace Error", err)
		res.status(500).send({ error: err.name + ", " + err.message })
		return
	}
})

let server

(async () => {
	try {
		server = app.listen(port, () => {
			console.log("# App server listening on port " + port)
		})
    connString = 'mongodb://localhost:27017'
    conn = await database(connString)
		await dbFunctions.getDb(conn)
	}
	catch(err) {
		console.error("# Error:", err)
		console.error("# Exiting the application.")
		await closing()
		process.exit(1)
	}
})()

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