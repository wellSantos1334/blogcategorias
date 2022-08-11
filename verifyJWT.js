const SECRET = 'passwell'
const jwt = require("jsonwebtoken")


function verifyJWT(req, res, next) {
    const token = req.headers['x-access-token']

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({msg: "Acesso negado"}).end()
        } else {
            req.userId = decoded.userId
        }
        next()
    })
}

module.exports = verifyJWT