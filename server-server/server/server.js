const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const dotenv = require("dotenv");
const connectionDB = require("./database/dbConnection");
const helmet = require("helmet");
const userRoute = require("./routes/userRoute");
const bookRoute = require("./routes/bookRoute");

const app = express();

/** middlewares */
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
// app.disable("x-powered-by");
// app.use(helmet());

dotenv.config({ path: "./server/config.env" });

const PORT = process.env.PORT || 9000;

connectionDB();

app.use("/api/v1/user", userRoute);
app.use("/api/v1/book", bookRoute);


const dirname = path.resolve();
app.use("/api/public", express.static(path.join(dirname, "/public")));

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// connectionDB()
//   .then(() => {
//     try {
//       app.listen(PORT, () => {
//         console.log(`Server is running on http://localhost:${PORT}`);
//       });
//     } catch (error) {
//       console.log("Cannot connect to the server");
//     }
//   })
//   .catch((error) => {
//     console.log("Invalid database connection...!");
//   });
