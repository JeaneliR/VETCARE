
import "dotenv/config";
import app from "./app";

// Puerto de ejecución del servidor
const PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 4000;

// Iniciar servidor VetCare
app.listen(PORT, () => {
  console.log(
    `VetCare API escuchando en http://localhost:${PORT}`
  );
});