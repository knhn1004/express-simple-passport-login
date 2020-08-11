if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const app = express()
require('./passport-config')(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)
app.use(flash())
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// middlewares
const checkAuth = require('./middlewares/checkAuth')
const checkNotAuth = require('./middlewares/checkNotAuth')

const users = []

app.listen(3000)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', checkAuth, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuth, (req, res) => {
  res.render('login.ejs')
})

app.get('/register', checkNotAuth, (req, res) => {
  res.render('register.ejs')
})

app.post(
  '/login',
  checkNotAuth,
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })
)

app.post('/register', async (req, res) => {
  const { name, email, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    users.push({
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    })
    res.redirect('/login')
  } catch (e) {
    console.error(e)
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})
