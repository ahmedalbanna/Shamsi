import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database Mock (In-memory for demo)
  const db = {
    users: [
      {
        id: "user_1",
        name: "أحمد العباني",
        package: "باقة العيلة",
        totalInstallments: 24,
        paidInstallments: 5,
        remainingDays: 4,
        status: "active", // active, grace, suspended, owned
        consumption: "45%",
        lastActivationCode: "SH-9923-BX",
      }
    ],
    packages: [
      { id: "nour", name: "باقة النور", price: 150, description: "لمبات وشاحن جوال", apps: ["3 لمبات", "2 شواحن"] },
      { id: "family", name: "باقة العيلة", price: 450, description: "إنارة، مروحة، تلفزيون", apps: ["6 لمبات", "مروحة", "تلفزيون 32 بوصة"] },
      { id: "mashghal", name: "باقة المشغل", price: 900, description: "ثلاجة أو ماكينة خياطة", apps: ["نظام كامل", "ثلاجة صغيرة", "إنارة شاملة"] },
    ]
  };

  // API Routes
  app.get("/api/user-status", (req, res) => {
    res.json(db.users[0]);
  });

  app.get("/api/packages", (req, res) => {
    res.json(db.packages);
  });

  app.post("/api/pay", (req, res) => {
    const user = db.users[0];
    user.paidInstallments += 1;
    user.remainingDays += 7; // Add a week
    user.status = "active";
    user.lastActivationCode = `SH-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.random() * 26)}${String.fromCharCode(65 + Math.random() * 26)}`;
    res.json({ success: true, user, code: user.lastActivationCode });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
