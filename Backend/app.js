const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require('cors');

app.use(cors());
app.use(express.json());
dotenv.config();

app.get('/', (req, res) => {
    res.send('Expense Management API is running');
    console.log('Root endpoint hit');
});



module.exports = app;