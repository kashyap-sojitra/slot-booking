require("dotenv").config();
const app = require("./app.js");
const config = require("./config/config.js");

const port = process.env.PORT || 3000;
process.env.TZ = config.timezone;

(async () => {
  try {
    const server = require("http").createServer(app);
    server.listen(port);
    console.log(`Server Listening on port ${port} ......`);
  } catch (error) {
    console.error("error while connecting database", error);
    process.exit(1);
  }
})();
