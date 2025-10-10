const app = require("express")();
const port = 8080
const swaggerUi = require('swagger-ui-express')
const yamljs = require("yamljs")
const swaggerDocument = yamljs.load('./docs/swagger.yaml')

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

    games.push({
        id: games.length + 1,
        price: req.params.id,
        name: req.body.name
    })

    res.end()
})
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
});