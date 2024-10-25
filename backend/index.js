const express = require('express');
const app = express();
const port = 3000; // or any other port you prefer

app.get('/', (req, res) => {
  res.send('Hello, welcome to my Express API!');
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});