require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db.js');
const app = express();
const PORT = 4000;
const http = require('http').Server(app);
const cors = require('cors');

const Category = require('./models/category');
const Game = require('./models/game');
const typeAnswer = require('./models/typeAnswer');

app.use(cors());
connectDB();

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000"
    }
});

// Toutes les rooms 
const rooms = {};

io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on('joinRoom', ({ roomId, name, avatar }) => {

        if (!name) {
            return;
        }

        socket.emit('storeOwnId', socket.id);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        rooms[roomId].push({ id: socket.id, name, avatar, score: 0 });

        socket.join(roomId);
        console.log(`${name} joined room: ${roomId}`);

        io.to(roomId).emit('roomUsers', rooms[roomId]);

        socket.on('askToStartGame', (id) => {
            io.to(id).emit('startGame');
        });

        socket.on('gameStarting', async (roomId) => {
            const nbOfGames = 3;

            try {
                const response = await fetch(`http://localhost:4000/getRandomGames/${nbOfGames}`);
                const data = await response.json();

                for (let indexOfQuestion = 0; indexOfQuestion < nbOfGames; indexOfQuestion++) {
                    const question = data.randomGames[indexOfQuestion];

                    io.to(roomId).emit('launchQuestion', {
                        scores: rooms[roomId],
                        question: question
                    });

                    await new Promise(resolve => setTimeout(resolve, question.category.time * 1000));

                    io.to(roomId).emit('transitionQuestion');

                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (error) {
                console.error(error);
            }

            io.to(roomId).emit('endGame', rooms[roomId]);

        });

        socket.on('sendAnswer', ({ playerId, roomId, speed }) => {
            rooms[roomId].find(player => player.id === playerId).score += speed
        })

        socket.on('message', (data) => {
            io.to(data.room).emit('message', data.message);
        });

        socket.on('disconnect', () => {
            console.log(`🚪 bye ${socket.id}`)
            socket.to(roomId).emit('userDisconnected', rooms[roomId]);
            if (rooms[roomId].length === 0) {
                delete rooms[roomId];
            } else {
                rooms[roomId] = rooms[roomId].filter(player => player.id !== socket.id);
            }
        });
    });
});

app.get('/getRandomGames/:nbOfGames', async (req, res) => {
    try {
        const randomGames = await Game.aggregate([
            { $sample: { size: parseInt(req.params.nbOfGames) } }
        ]);

        const populatedGames = await Game.populate(randomGames, { path: 'category' });

        res.json({
            randomGames: populatedGames,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
