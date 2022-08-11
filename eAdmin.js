const SECRET = 'passwell'
const jwt = require("jsonwebtoken")
const mongoose = require('mongoose')
require('./models/Usuario')
const Usuario = mongoose.model('usuarios')

function eAdmin(req, res, next) {
    const token = req.headers['x-access-token']
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ msg: "Acesso negado" }).end()
        } else {
            const userId = decoded.userId
            Usuario.findOne({ _id: userId }).then((eAdmin) => {
                if (eAdmin.eAdmin == 1) {
                    next()
                } else {
                    res.status(401).json({ status: 401, msg: 'Acesso negado' }).end()
                }
            }).catch((err) => {
                console.log('Erro: ' + err)
            })
        }
    })
}

module.exports = eAdmin