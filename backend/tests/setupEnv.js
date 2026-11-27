// Jest "setupFiles": corre ANTES de que se importe cualquier archivo de
// prueba (y por lo tanto antes de que src/app.ts haga `import "dotenv/config"`).
// dotenv no sobreescribe variables ya presentes en process.env, así que
// cargamos .env.test aquí para que sea lo que gane, sin tocar tu .env real
// de desarrollo.
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.test") });
