const express = require("express");
const cors = require("cors");
const pool = require("./db");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ""
  const parts = auth.split(" ")
  const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : null

  if (!token) return res.status(401).json({ ok: false, error: "No token" })

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ ok: false, error: "Token inválido" })
    req.user = decoded
    next()
  })
}

app.post("/api/auth/login", async (req, res) => {
  try {
    const body = req.body || {}
    const username = toNull(body.username || body.usuario)
    const password = toNull(body.password)

    if (!username || !password) {
      return res.status(400).json({ ok: false, error: "Credenciales inválidas" })
    }

    const result = await pool.query(
      "SELECT id, username, password FROM usuarios WHERE username = $1",
      [username]
    )
    const user = result.rows[0]
    if (!user) {
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" })
    }

    // En esta BD la contraseña parece almacenarse en texto (por tu ejemplo).
    // Si en el futuro la guardas con hash, cambiamos a bcrypt.
    if (String(user.password) !== String(password)) {
      return res.status(401).json({ ok: false, error: "Credenciales inválidas" })
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "8h" }
    )
    return res.json({ ok: true, token })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: "Error de login" })
  }
})

app.get("/api/auth/me", requireAuth, async (req, res) => {
  return res.json({ ok: true, user: req.user })
})

app.get("/api/puertos", requireAuth, async (req, res) => {
  try {
    // Opcional: filtros para no traer todo si se requiere
    const { area, numero_switch } = req.query;
    const params = [];
    const where = [];
    if (area) {
      params.push(area);
      where.push(`c.area = $${params.length}`);
    }
    if (numero_switch) {
      params.push(Number(numero_switch));
      where.push(`c.numero_switch = $${params.length}`);
    }

    const sql =
      "SELECT " +
      "c.id, " +
      "c.area, " +
      "c.nombre, " +
      "c.estado, " +
      "c.puerto_panel, " +
      "c.numero_panel, " +
      "c.conector, " +
      "c.ip AS ip, " +
      "isw.ip_switch AS ip_switch, " +
      "c.numero_switch, " +
      "c.puerto_switch, " +
      "c.equipo_conectado, " +
      "c.notas " +
      "FROM conexiones_red c " +
      "LEFT JOIN ips_switch isw " +
      "ON isw.area = c.area AND isw.numero_switch = c.numero_switch" +
      (where.length ? ` WHERE ${where.join(" AND ")}` : "");

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error del servidor");
  }
});

function toNull(v) {
  if (v === undefined) return null
  if (v === null) return null
  if (typeof v === "string") {
    const s = v.trim()
    if (!s) return null
    return s
  }
  return v
}

function parseNumero(v) {
  const x = toNull(v)
  if (x == null) return null
  if (typeof x === "number") return x
  const m = String(x).match(/(\d+)/)
  return m ? Number(m[1]) : null
}

function parsePuerto(v) {
  // puerto_switch / puerto_panel suelen venir como "P9"
  return toNull(v)
}

function estadoToDb(estado) {
  const e = toNull(estado)
  if (!e) return "Libre"
  const s = String(e).trim().toLowerCase()
  if (s.startsWith("ocu")) return "Ocupado"
  if (s.startsWith("dañ") || s.startsWith("dan")) return "Dañado"
  if (s.startsWith("lib")) return "Libre"
  return "Libre"
}

app.post("/api/conexiones_red/upsert", requireAuth, async (req, res) => {
  try {
    const body = req.body || {}
    const idRaw = toNull(body.id)
    const id = idRaw == null ? null : Number(idRaw)
    const areaRaw = toNull(body.area)
    const area = areaRaw ? String(areaRaw).trim().toUpperCase() : null
    const estado = estadoToDb(body.estado)

    const numero_switch = parseNumero(body.numero_switch)
    const puerto_switch = parsePuerto(body.puerto_switch)
    const numero_panel = parseNumero(body.numero_panel)
    const puerto_panel = parsePuerto(body.puerto_panel)

    const hasSwitchKeys = area && numero_switch != null && puerto_switch != null
    const hasPanelKeys = area && numero_panel != null && puerto_panel != null
    const conector = toNull(body.conector)
    const hasConectorKeys = area && conector != null

    if (id == null && !hasSwitchKeys && !hasPanelKeys && !hasConectorKeys) {
      return res
        .status(400)
        .json({ ok: false, error: "Faltan llaves para upsert (switch/panel/conector)" })
    }

    const ip = toNull(body.ip)
    const equipo_conectado = toNull(body.equipo_conectado)
    const notas = toNull(body.notas)
    const nombre = toNull(body.nombre)

    const values = [
      area,
      nombre,
      estado,
      puerto_panel,
      numero_panel,
      conector,
      ip,
      numero_switch,
      puerto_switch,
      equipo_conectado,
      notas,
    ]

    // Si vienen ambos (switch y panel), priorizamos panel para no tocar filas del switch
    // cuando se está editando un Patch Panel.
    let whereSql = ""
    if (hasPanelKeys) {
      whereSql = `area = $1 AND numero_panel = $5 AND puerto_panel = $4`
    } else if (hasSwitchKeys) {
      whereSql = `area = $1 AND numero_switch = $8 AND puerto_switch = $9`
    } else {
      // fallback por conector (útil para Fibra cuando BD no tiene switch/panel)
      whereSql = `area = $1 AND conector = $6`
    }

    const updateSql = `
      UPDATE conexiones_red
      SET
        area = $1,
        nombre = $2,
        estado = $3,
        puerto_panel = $4,
        numero_panel = $5,
        conector = $6,
        ip = $7,
        numero_switch = $8,
        puerto_switch = $9,
        equipo_conectado = $10,
        notas = $11
      WHERE ${whereSql}
      RETURNING area
    `

    // Si ya viene el id, actualizamos SIEMPRE esa fila.
    if (id != null) {
      const updateByIdSql = `
        UPDATE conexiones_red
        SET
          area = $1,
          nombre = $2,
          estado = $3,
          puerto_panel = $4,
          numero_panel = $5,
          conector = $6,
          ip = $7,
          numero_switch = $8,
          puerto_switch = $9,
          equipo_conectado = $10,
          notas = $11
        WHERE id = $12
      `
      const updateByIdResult = await pool.query(updateByIdSql, [...values, id])
      if (updateByIdResult.rowCount && updateByIdResult.rowCount > 0) {
        return res.json({ ok: true })
      }
      return res.status(404).json({ ok: false, error: "Fila no encontrada" })
    }

    const updateResult = await pool.query(updateSql, values)
    if (updateResult.rowCount && updateResult.rowCount > 0) {
      return res.json({ ok: true })
    }

    const insertSql = `
      INSERT INTO conexiones_red(
        area, nombre, estado, puerto_panel, numero_panel, conector, ip,
        numero_switch, puerto_switch, equipo_conectado, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING area
    `

    await pool.query(insertSql, values)
    return res.json({ ok: true })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: "Error en upsert" })
  }
})

app.post("/api/conexiones_red/delete", requireAuth, async (req, res) => {
  try {
    const body = req.body || {}
    const idRaw = toNull(body.id)
    const id = idRaw == null ? null : Number(idRaw)
    const areaRaw = toNull(body.area)
    const area = areaRaw ? String(areaRaw).trim().toUpperCase() : null
    const numero_switch = parseNumero(body.numero_switch)
    const puerto_switch = parsePuerto(body.puerto_switch)
    const numero_panel = parseNumero(body.numero_panel)
    const puerto_panel = parsePuerto(body.puerto_panel)
    const conector = toNull(body.conector)

    const hasSwitchKeys = area && numero_switch != null && puerto_switch != null
    const hasPanelKeys = area && numero_panel != null && puerto_panel != null
    const hasConectorKeys = area && conector != null

    if (id == null && !hasSwitchKeys && !hasPanelKeys && !hasConectorKeys) {
      return res
        .status(400)
        .json({ ok: false, error: "Faltan llaves para eliminar (switch/panel/conector)" })
    }

    const estadoLibre = "Libre"

    // Si ya viene el id, borramos SIEMPRE esa fila.
    if (id != null) {
      const resultById = await pool.query(
        `
          UPDATE conexiones_red
          SET
            estado = $1,
            conector = NULL,
            ip = NULL,
            numero_switch = NULL,
            puerto_switch = NULL,
            numero_panel = NULL,
            puerto_panel = NULL,
            equipo_conectado = NULL,
            notas = NULL,
            nombre = NULL
          WHERE id = $2
        `,
        [estadoLibre, id]
      )
      return res.json({ ok: true, updated: resultById.rowCount || 0 })
    }

    let result
    // Priorizar panel cuando existan claves de panel (evita borrar una fila del switch al editar Patch Panel).
    if (hasPanelKeys) {
      result = await pool.query(
        `
          UPDATE conexiones_red
          SET
            estado = $4,
            conector = NULL,
            ip = NULL,
            numero_switch = NULL,
            puerto_switch = NULL,
            numero_panel = NULL,
            puerto_panel = NULL,
            equipo_conectado = NULL,
            notas = NULL,
            nombre = NULL
          WHERE area = $1 AND numero_panel = $2 AND puerto_panel = $3
          RETURNING area
        `,
        [area, numero_panel, puerto_panel, estadoLibre]
      )
    } else if (hasSwitchKeys) {
      result = await pool.query(
        `
          UPDATE conexiones_red
          SET
            estado = $4,
            conector = NULL,
            ip = NULL,
            numero_switch = NULL,
            puerto_switch = NULL,
            numero_panel = NULL,
            puerto_panel = NULL,
            equipo_conectado = NULL,
            notas = NULL,
            nombre = NULL
          WHERE area = $1 AND numero_switch = $2 AND puerto_switch = $3
          RETURNING area
        `,
        [area, numero_switch, puerto_switch, estadoLibre]
      )
    } else {
      // fallback por conector (útil para Fibra)
      result = await pool.query(
        `
          UPDATE conexiones_red
          SET
            estado = $3,
            conector = NULL,
            ip = NULL,
            numero_switch = NULL,
            puerto_switch = NULL,
            numero_panel = NULL,
            puerto_panel = NULL,
            equipo_conectado = NULL,
            notas = NULL,
            nombre = NULL
          WHERE area = $1 AND conector = $2
          RETURNING area
        `,
        [area, conector, estadoLibre]
      )
    }

    return res.json({ ok: true, updated: result.rowCount || 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: "Error en delete" })
  }
})

app.post("/api/conexiones_red/update_ip", requireAuth, async (req, res) => {
  try {
    const body = req.body || {}
    const areaRaw = toNull(body.area)
    const area = areaRaw ? String(areaRaw).trim().toUpperCase() : null
    const numero_switch = parseNumero(body.numero_switch)
    const ip = toNull(body.ip)

    if (!area || numero_switch == null) {
      return res.status(400).json({ ok: false, error: "Faltan llaves para update_ip" })
    }

    // Guardar SOLO en tu tabla ips_switch: (id, area, numero_switch, ip_switch)
    // Usamos area + numero_switch como clave lógica.
    const updIps = await pool.query(
      `
        UPDATE ips_switch
        SET ip_switch = $1
        WHERE area = $2 AND numero_switch = $3
      `,
      [ip, area, numero_switch]
    )

    if (!updIps.rowCount) {
      await pool.query(
        `
          INSERT INTO ips_switch(area, numero_switch, ip_switch)
          VALUES ($1, $2, $3)
        `,
        [area, numero_switch, ip]
      )
    }

    return res.json({ ok: true, updated: updIps.rowCount || 1 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: "Error en update_ip" })
  }
})

// Borra la IP del switch (elimina la fila ips_switch).
app.post("/api/conexiones_red/delete_ip_switch", requireAuth, async (req, res) => {
  try {
    const body = req.body || {}
    const areaRaw = toNull(body.area)
    const area = areaRaw ? String(areaRaw).trim().toUpperCase() : null
    const numero_switch = parseNumero(body.numero_switch)

    if (!area || numero_switch == null) {
      return res.status(400).json({ ok: false, error: "Faltan llaves para delete_ip_switch" })
    }

    const result = await pool.query(
      `
        DELETE FROM ips_switch
        WHERE area = $1 AND numero_switch = $2
      `,
      [area, numero_switch]
    )

    return res.json({ ok: true, deleted: result.rowCount || 0 })
  } catch (error) {
    console.error(error)
    res.status(500).json({ ok: false, error: "Error en delete_ip_switch" })
  }
})

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});