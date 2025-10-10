const express = require('express');
const app = express();
const port = 8080
const swaggerUi = require('swagger-ui-express')
const yamljs = require("yamljs")
const swaggerDocument = yamljs.load('./docs/swagger.yaml')

app.use(express.json())

const games = [
    {id: 1, name: "Witcher 3", price: 0},
    {id: 2, name:"Cyberpunk 2077", price: 8.23},
    {id: 3, name:"CSgo2", price: 52.52},
    {id: 4, name:"GTA5", price: 92.52},
    {id: 5, name:"Garry mod", price: 5.21},
    {id: 6, name:"Valorant", price: 82.21},
    {id: 7, name:"Forza Horizon 5", price: 21.21},
    {id: 8, name:"Roblox", price: 12.42},
    {id: 9, name:"Minecraft", price: 18.21}
]

app.get("/games", (req, res) => {
    res.send(games)
})

app.get("/games/:id", (req, res) => {
    if (typeof games[req.params.id - 1] === "undefined") {
        return res.status(404).send({error: "Game not found"})
    }

    res.send(games[req.params.id - 1])
})

app.post("/games", (req, res) => {
    if (!req.body.name || !req.body.price) {
        return res.status(400).send({error: "One or all params are missing"})
    }
    let game = {
        id: games.length + 1,
        price: req.body.price,
        name: req.body.name,
    }

    games.push(game)

    res.status(201)
        .location(`${getBaseUrl(req)}/games/${game.length}`)
        .send(game)

})
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

function getBaseUrl(req) {
    return req.connection && req.connection.encrypted
        ? 'https' : 'http' + `://${req.headers.host}`
}
app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
});