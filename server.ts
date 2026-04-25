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
        name: "أحمد منصور", // Changed to match example if needed
        email: "ahmed@example.com",
        phone: "770123456",
        packageId: "family",
        packageName: "باقة العيلة",
        totalInstallments: 24,
        paidInstallments: 5,
        remainingDays: 6,
        status: "active", // active, grace, suspended, owned
        consumption: "280W",
        batteryLevel: 88,
        voltage: "13.4V",
        lastActivationCode: "SH-9923-BX",
        referralCode: "AHMED-123",
        creditBalance: 1500, // in YER
        systemDetails: {
          panels: "2x 150W",
          battery: "1x 150Ah Gel",
          inverter: "1000W Pure Sine",
          installedDate: "2023-01-15"
        },
        paymentHistory: [
          { id: "ph1", date: "2023-09-01", amount: 4500, method: "محفظة حوِّل" },
          { id: "ph2", date: "2023-09-08", amount: 4500, method: "رصيد الجوال" },
          { id: "ph3", date: "2023-09-15", amount: 4500, method: "كارت شحن" },
        ],
        maintenanceLogs: [
          { id: "ml1", date: "2023-05-10", type: "تنظيف ألواح", status: "مكتمل", technician: "فهمي محمد" },
          { id: "ml2", date: "2023-07-22", type: "فحص الأسلاك", status: "مكتمل", technician: "عادل سعيد" }
        ],
        consumptionData: [
          { time: '08:00', value: 120 },
          { time: '10:00', value: 250 },
          { time: '12:00', value: 380 },
          { time: '14:00', value: 390 },
          { time: '16:00', value: 280 },
          { time: '18:00', value: 150 },
          { time: '20:00', value: 80 }
        ]
      }
    ],
    packages: [
      { 
        id: "nour", 
        name: "باقة النور", 
        price: 150, 
        basePrice: 150,
        installment: 2000, 
        description: "لمبات وشاحن جوال", 
        apps: ["3 لمبات", "2 شواحن"],
        customizable: [
          { id: "c1", name: "لمبة إضافية", price: 20 },
          { id: "c2", name: "بطارية أكبر", price: 50 }
        ]
      },
      { 
        id: "family", 
        name: "باقة العيلة", 
        price: 450, 
        basePrice: 450,
        installment: 4500, 
        description: "إنارة، مروحة، تلفزيون", 
        apps: ["6 لمبات", "مروحة", "تلفزيون 32 بوصة"],
        customizable: [
          { id: "c3", name: "مروحة إضافية", price: 40 },
          { id: "c4", name: "تلفزيون 43 بوصة بدلاً من 32", price: 80 }
        ]
      },
      { 
        id: "mashghal", 
        name: "باقة المشغل", 
        price: 900, 
        basePrice: 900,
        installment: 8000, 
        description: "ثلاجة أو ماكينة خياطة", 
        apps: ["نظام كامل", "ثلاجة صغيرة", "إنارة شاملة"],
        customizable: [
          { id: "c5", name: "ثلاجة أكبر", price: 150 },
          { id: "c6", name: "ماكينة خياطة", price: 100 }
        ]
      },
    ]
  };

  // API Routes
  app.get("/api/user-status", (req, res) => {
    res.json(db.users[0]);
  });

  app.get("/api/packages", (req, res) => {
    res.json(db.packages);
  });

  app.post("/api/profile/update", (req, res) => {
    const { name, phone, email } = req.body;
    if (name) db.users[0].name = name;
    if (phone) db.users[0].phone = phone;
    if (email) db.users[0].email = email;
    res.json({ success: true, user: db.users[0] });
  });

  app.post("/api/pay", (req, res) => {
    const { method = "تطبيق حوِّل", amount = 4500, useCredit = false } = req.body || {};
    const user = db.users[0];
    
    let amountPaid = amount;
    if (useCredit && user.creditBalance > 0) {
      if (user.creditBalance >= amount) {
        user.creditBalance -= amount;
        amountPaid = 0; // Covered entirely by credit
      } else {
        amountPaid = amount - user.creditBalance;
        user.creditBalance = 0;
      }
    }

    user.paidInstallments += 1;
    user.remainingDays += 7; // Add a week
    user.status = "active";
    user.lastActivationCode = `SH-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.random() * 26)}${String.fromCharCode(65 + Math.random() * 26)}`;
    
    // Add to history
    user.paymentHistory.unshift({
      id: `ph${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      amount: amountPaid,
      method: method
    });

    res.json({ success: true, user, code: user.lastActivationCode });
  });

  app.post("/api/referral", (req, res) => {
    const { code } = req.body;
    // Simulate applying a referral
    res.json({ success: true, message: "تم تطبيق كود الخصم بنجاح. ستحصل على رصيد إضافي في قسطك القادم." });
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
