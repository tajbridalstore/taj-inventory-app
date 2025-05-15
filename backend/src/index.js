const dotenv = require("dotenv");
const app = require("./app");
const connectDB  = require("./db/db")


// .env file configuration 
dotenv.config({path:"./.env"});

// mongodb database connect
connectDB();


const PORT  = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello World!');
});
// server listen
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

