import "dotenv/config";

import app from "./src/app.js";

import { env } from "./src/config/env.js";

app.listen(env.PORT, () => {
  console.log("");
  console.log(`🚀 Servidor iniciado en puerto ${env.PORT}`);
  console.log("");
});
