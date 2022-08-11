const express = require('express')
const verifyJWT = require('../verifyJWT')
const router = express.Router()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const SECRET = 'passwell'
const bcrypt = require('bcryptjs')
// const jwtBlackList = require('express-jwt-blacklist')(jwt)

const blacklist = []

// models
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')

router.get('/login', (req, res) => {
    res.status(200).json({ msg: 'Página de login' })
})

router.post('/login', async (req, res) => {
    const user = await Usuario.findOne({ login: req.body.login })
    if (user === null) {
        res.status(400).json({
            status: 400,
            msg: "Usuário não está cadastrado."
        })
    } else if (!(await bcrypt.compare(req.body.senha, user.senha))) {
        res.status(401).json({
            status: 401,
            msg: "Senha incorreta!",
        })
    } else {
        const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: 600 })
        res.status(200).json({
            status: 200,
            msg: 'Usuário logado com sucesso!',
            token: token
        })
    }
})

router.get('/logado', verifyJWT, (req, res) => {
    res.json({ msg: "Usuario logado" })
})

router.get('/logout', verifyJWT, (req, res) => {
    res.end()
})

// Criar um novo usuário
router.post('/register', async (req, res) => {
    try {
        if (typeof req.body.login == undefined || typeof req.body.senha == undefined) {
            res.status(400).json({ status: 400, message: "Dados inválidos." })
        }
        if (req.body.login == null || req.body.senha == null) {
            res.status(400).json({ status: 400, message: "Dados inválidos." })
        }
        if (req.body.login.length < 4 || req.body.senha.length < 8) {
            res.status(400).json({ status: 400, message: "Dados inválidos." })
        } else {
            const checkExistUser = await Usuario.findOne({ login: req.body.login })
            if (checkExistUser) {
                res.json({ msg: 'Já existe um usuário com esse login.' })
            } else {
                const salt = bcrypt.genSaltSync(10)
                const hash = bcrypt.hashSync(req.body.senha, salt)

                const novoUsuario = {
                    login: req.body.login,
                    senha: hash
                }

                new Usuario(novoUsuario).save().then(() => {
                    res.status(200).json({ status: 200, msg: 'Usuário criado com sucesso.' })
                }).catch((err) => {
                    res.status(400).json({ status: 400, msg: 'Houve um erro ao criar o usuário, tente novamente.' })
                })
            }
        }
    } catch (err) {
        console.log(err)
    }
})

module.exports = router;