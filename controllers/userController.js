const registerUser = require('../models/register')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const user = require('../models/user');
require('dotenv').config()
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

JWT_SECRET = process.env.JWT_SECRET

// GET HOME
const homePage = (req, res) => {
    let username = req.cookies.username
    let firstname = req.cookies.firstname
    let lastname = req.cookies.lastname
    let email = req.cookies.email

    res.render('app')
}

// GET LOGIN
const loginPage = (req, res) => {
    res.status(200)
   res.render('login', {body: ''})
    
}

// GET REGISTER
const registerPage = (req, res) => {
    res.status(200)
    res.render('register', { body: '' })
}

// GET ERROR
const errorPage = (req, res) => {
    res.render('error', message)
}

// POST REGISTER
const addUser = async (req, res) => {
    let username = req.body.username.trim()
    let password = req.body.password.trim()
    let email = req.body.email.trim()
    let firstname = req.body.firstname.trim()
    let lastname = req.body.lastname.trim()

    let passwordVerify = password

    let userFind = await User.findOne({ username: username })
    if (userFind) {
        res.redirect('error', { message: `This Username already exist!` })
    }
    if (!passwordVerify) {
        res.redirect('error', { message: `Invalid Username or Password.` })
    }
    if (passwordVerify.length < 5) {
        res.redirect('error', { message: `Password too small. Should be atleast 6 characters.` })
    }

    password = await bcrypt.hashSync(req.body.password.trim(), 10)
    
    try {
        const response = await registerUser.create({
            username,
            password,
            firstname,
            lastname,
            email
        })
        console.log(`User created successfuly. ${response}`)
        res.redirect('/')
    } catch (error) {
        throw error
    }
}


//  LOGIN
const login = async (req, res) => {
    // GETING THE INPUTS
    let username = req.body.username.trim()
    let password = req.body.password.trim()

    // FINDING THE USER
    let userFind = await User.find({ username })

    if (!userFind) {
        res.redirect('error', { message: `Invalid Username or Password.`})
    }

    if (userFind) {
        // GETTING THE DATA INFO
        let userFinder = await User.findOne({username: username})
        
        console.log(userFinder)

        if (!userFinder){
            res.render('/error', { message: `Invalid Username or Password.`})
        }
        
        savedUsername = userFinder.username
        savedPassword = userFinder.password


        if (await bcrypt.compareSync(password, savedPassword)) {
            const token = jwt.sign({ username: savedUsername }, JWT_SECRET)
            res.cookie('token', token, { maxAge: 900000, httpOnly: true })
            res.cookie('username', userFinder.username, { maxAge: 900000, httpOnly: true })
            res.cookie('firstname', userFinder.username, { maxAge: 900000, httpOnly: true })
            res.cookie('lastname', userFinder.username, { maxAge: 900000, httpOnly: true })
            res.cookie('email', userFinder.username, { maxAge: 900000, httpOnly: true })
            
            res.status(200)
            res.redirect('/')
        } else {
            res.status(400)
            res.render('error', { message: `Invalid Username of Password.` })
        }
    } else {
        res.render('error', { message: `Invalid Username of Password.` })
    }
}

module.exports = { homePage, loginPage, login, registerPage, addUser, errorPage }