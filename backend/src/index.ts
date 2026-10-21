
import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT
  ? Number(process.env.PORT)
  : 4000;

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `VetCare API escuchando en http://localhost:${PORT}`
  );
});
