const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/puertos", async (req, res) => {
  try {
    // Opcional: filtros para no traer todo si se requiere
    const { area, numero_switch } = req.query;
    const params = [];
    const where = [];
    if (area) {
      params.push(area);
      where.push(`area = $${params.length}`);
    }
    if (numero_switch) {
      params.push(Number(numero_switch));
      where.push(`numero_switch = $${params.length}`);
    }

    const sql =
      "SELECT area, nombre, estado, puerto_panel, numero_panel, conector, ip, numero_switch, puerto_switch, equipo_conectado, notas FROM conexiones_red" +
      (where.length ? ` WHERE ${where.join(" AND ")}` : "");

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});