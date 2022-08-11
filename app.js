const express = require('express')
const mongoose = require('mongoose')
const admin = require('./routes/admin')
const login = require('./routes/login')
const eAdmin = require('./eAdmin')
const verifyJWT = require('./verifyJWT')
const PORT = process.env.PORT || 9999
const app = express()


// Models
require('./models/Postagem')
const Postagem = mongoose.model('postagens')

// Configs
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// Mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/blogapp', async () => {
    try {
        console.log("Conectado ao mongo")
    } catch (err) {
        console.log('Erro ao conectar no banco: ' + err)
    }
})

// ---------- Routes ----------

// Home page - Listando postagens recentes
app.get('/', async (req, res) => {
    try {
        const findPost = await Postagem.find().lean().populate().sort({ date: 'desc' })
        res.status(200).json({ status: 200, msg: 'Busca concluída!', posts: findPost })
    } catch (err) {
        console.log(err)
    }
})

// Lista de todas as postagens para qualquer usuário
app.get('/posts', async (req, res) => {
    try {
        const findPost = await Postagem.find().lean().populate('categorias').sort({ data: 'desc' })
        res.status(200).json({ posts: findPost })
    } catch (err) {
        console.log(err)
    }
})

// Buscar toda as informações da postagem
app.get('/postagem/:id', verifyJWT, async (req, res) => {
    const findPostbySlug = await Postagem.findOne({ _id: req.params.id })
    try {
        if (findPostbySlug) {
            res.status(200).json({ status: 200, msg: 'Posts encontrados:', postagem: findPostbySlug })
        } else {
            res.status(404).json({ status: 404, msg: 'Postagem inexistente.' })
        }
    } catch(err){
        console.log(err)
    }
})

app.use(login)
app.use('/admin', admin)


app.listen(PORT, () => {
    console.log("Servidor rodando.")
})
