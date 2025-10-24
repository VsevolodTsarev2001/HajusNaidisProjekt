const express = require('express');
const app = express();
const { Types } = require('mongoose');
const cors = require('cors');
const port = 8080;
const swaggerUi = require('swagger-ui-express');
const yamljs = require('yamljs');
const swaggerDocument = yamljs.load('./docs/swagger.yaml');

const mongoose = require('mongoose');
const Game = require('./models/game');

const uri = "mongodb+srv://User:12345@cluster0.ucikqrb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use((req, res, next) => {
    console.log('CT:', req.headers['content-type']);
    console.log('BODY:', req.body);
    next();
});

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// GET all
app.get('/games', async (req, res) => {
    try {
        const games = await Game.find().sort({ id: 1 });
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET by id
app.get('/games/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const num = Number(idParam);
        const or = [];

        if (!Number.isNaN(num)) or.push({ id: num }, { id: String(num) });
        or.push({ id: idParam });
        if (Types.ObjectId.isValid(idParam)) or.push({ _id: idParam });

        const game = await Game.findOne({ $or: or });
        if (!game) return res.status(404).json({ message: 'Game not found' });
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// CREATE
app.post('/games', async (req, res) => {
    try {
        const lastGame = await Game.findOne().sort({ id: -1 });
        const newId = lastGame ? lastGame.id + 1 : 1;

        const game = new Game({
            id: newId,
            name: req.body.name,
            price: req.body.price,
            type: req.body.type
        });

        const newGame = await game.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// UPDATE
app.put('/games/:id', async (req, res) => {
    try {
        const idParam = req.params.id;
        const num = Number(idParam);
        const or = [];

        if (!Number.isNaN(num)) or.push({ id: num }, { id: String(num) });
        or.push({ id: idParam });
        if (Types.ObjectId.isValid(idParam)) or.push({ _id: idParam });

        const update = {};
        if ('name' in req.body) update.name = req.body.name;
        if ('price' in req.body) update.price = Number(req.body.price);
        if ('type' in req.body) update.type = req.body.type;

        const updated = await Game.findOneAndUpdate(
            { $or: or },
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'Game not found' });
        res.json(updated);
    } catch (e) {
        console.error('PUT error:', e);
        res.status(400).json({ message: e.message || 'Bad request' });
    }
});

// DELETE
app.delete('/games/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = await Game.deleteOne({ id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`);
});
