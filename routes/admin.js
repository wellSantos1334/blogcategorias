const verifyJWT = require('../verifyJWT')
const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const eAdmin = require('../eAdmin')

// Models
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')

router.get('/', (req, res) => {
    res.status(200).json({ status: '200', message: "Admin acessou" })
})

// Buscar categorias
router.get('/categorias', eAdmin, verifyJWT, (req, res) => {

    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.json({ categorias: categorias })
    }).catch((err) => {
        res.status(400).json({ status: '400', message: "Erro ao buscar no banco de dados." })
    })
})

// Criar uma categoria nova
router.post('/categorias/nova', eAdmin, verifyJWT, (req, res) => {

    if (typeof req.body.nome == undefined || req.body.nome == null || req.body.nome.length < 4) {
        res.status(400).json({ status: 400, message: "Nome inválido." })
    }

    if (typeof req.body.slug == undefined || req.body.slug == null || req.body.slug.length < 2) {
        res.status(400).json({ status: 400, message: "Slug inválido." })
    } else {
        const NovaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(NovaCategoria).save().then(() => {
            res.status(200).json({ status: 200, message: "Criado com sucesso." })
        }).catch((err) => {
            res.status(400).json({ status: 400, message: "Erro ao salvar no banco de dados" })
        })
    }
})

// Editar categoria
router.get('/categorias/edit/:id', eAdmin, verifyJWT, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.json({ categoria: categoria, status: 200, message: "Usuário encontrado com sucesso." })
    }).catch((err) => {
        res.status(404).json({ status: 404, message: "Usuário não encontrado." })
    })
})

router.post('/categorias/edit', eAdmin, verifyJWT, (req, res) => {

    if (typeof req.body.nome == undefined || typeof req.body.slug == undefined) {
        res.status(400).json({ status: 400, message: "Nome inválido." })
    }
    if (req.body.nome == null || req.body.slug == null) {
        res.status(400).json({ status: 400, message: "Nome inválido." })
    }
    if (req.body.nome.length < 4 || req.body.slug.length < 2) {
        res.status(400).json({ status: 400, message: "Nome inválido." })
    }
    else {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                res.json({ categoria: categoria, status: 200, message: "Categoria alterada com sucesso." })
            })

        }).catch((err) => {
            res.status(400).json({ status: 400, message: "Erro ao editar categoria." })
        })
    }
})

// Deletar categorias

router.post('/categoria/deletar', eAdmin, verifyJWT, (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        res.status(200).json({ status: 200, message: "Categoria deletada com sucesso." })
    }).catch((err) => {
        res.status(400).json({ status: 400, message: "Categoria não encontrada!" })
    })
})

// Criando postagens
router.get('/postagens', eAdmin, verifyJWT, (req, res) => {
    Categoria.find().then((categorias) => {
        res.json({ categorias: categorias })
    }).catch((err) => {
        res.json({ erro: 'Erro: ' + err })
    })
})

router.post('/postagens/nova', eAdmin, verifyJWT, (req, res) => {
    if (typeof req.body.titulo == undefined || typeof req.body.slug == undefined || typeof req.body.descricao == undefined || typeof req.body.conteudo == undefined || typeof req.body.categorias == undefined) {
        res.status(400).json({ status: 400, message: "Dados inválidos." })
    }
    if (req.body.titulo == null || req.body.slug == null || req.body.descricao == null || req.body.conteudo == null || req.body.categorias == null) {
        res.status(400).json({ status: 400, message: "Dados inválidos." })
    }
    if (req.body.titulo.length < 4 || req.body.slug.length < 2 || req.body.descricao.length < 5 || req.body.conteudo.length < 10) {
        res.status(400).json({ status: 400, message: "Dados inválidos." })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categorias: req.body.categorias
        }

        new Postagem(novaPostagem).save().then(() => {
            res.status(200).json({ status: 200, message: "Postagem criada com sucesso." })
        }).catch((err) => {
            res.status(400).json({ error: 'Houve um erro ao criar Postagem. ' + err })
        })
    }
})

// Listar postagens
router.get('/postagens/list', eAdmin, verifyJWT, (req, res) => {
    Postagem.find().lean().populate('categorias').sort({ data: 'desc' }).then((postagens) => {
        res.status(200).json({ postagens: postagens })
    }).catch((err) => {
        res.json({ error: "Erro na busca. " + err })
    })
})

// Editar Postagens
router.get('/postagens/edit/:id', eAdmin, verifyJWT, (req, res) => {
    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        res.status(200).json({ status: 200, message: 'Postagem encontrada com sucesso.', postagem: postagem })
    }).catch((err) => {
        res.json({ error: "Erro na busca. " + err })
    })
})

router.post('/postagens/edit', eAdmin, verifyJWT, (req, res) => {
    Categoria.find({ _id: req.body.categorias }).then(() => {

        if (typeof req.body.titulo == undefined || typeof req.body.slug == undefined || typeof req.body.descricao == undefined || typeof req.body.conteudo == undefined || typeof req.body.categorias == undefined) {
            res.status(400).json({ status: 400, message: "Dados inválidos." })
        }
        if (req.body.titulo == null || req.body.slug == null || req.body.descricao == null || req.body.conteudo == null || req.body.categorias == null) {
            res.status(400).json({ status: 400, message: "Dados inválidos." })
        }
        if (req.body.titulo.length < 4 || req.body.slug.length < 2 || req.body.descricao.length < 5 || req.body.conteudo.length < 10) {
            res.status(400).json({ status: 400, message: "Dados inválidos." })
        }
        else {
            Postagem.findOne({ _id: req.body.id }).then((postagem) => {

                postagem.titulo = req.body.titulo
                postagem.slug = req.body.slug
                postagem.descricao = req.body.descricao
                postagem.conteudo = req.body.conteudo
                postagem.categorias = req.body.categorias

                postagem.save().then(() => {
                    res.json({ postagem: postagem, status: 200, message: "Postagem alterada com sucesso." })
                })
            }).catch((err) => {
                res.status(400).json({ status: 400, message: "Erro ao alterar a postagem." })
            })
        }
    }).catch((err) => {
        res.status(400).json({ error: 'Categoria não existe. ' + err })
    })

})

// Deletar postagem

router.post('/postagens/deletar', eAdmin, verifyJWT, (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        res.status(200).json({ status: 200, message: "Postagem deletada com sucesso." })
    }).catch((err) => {
        res.status(400).json({ status: 400, message: "Postagem não encontrada!" })
    })
})

module.exports = router
