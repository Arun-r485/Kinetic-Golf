import express from "express";
import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { createServer as createViteServer } from "vite";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import nodemailer from "nodemailer";
import multer from "multer";
import fs from "fs";

/*
  ACCESS MATRIX
  ─────────────────────────────────────────────────
  Route Group               Public  Subscriber  Admin
  ─────────────────────────────────────────────────
  /api/auth/*               ✅      ✅          ✅
  /api/regions              ✅      ✅          ✅
  /api/settings (GET)       ✅      ✅          ✅
  /api/charities (GET)      ✅      ✅          ✅
  /api/draws (GET)          ✅      ✅          ✅
  /api/health               ✅      ✅          ✅
  /api/subscription/*       ❌      ✅          ✅ (bypasses checkSubscription)
  /api/scores/*             ❌      ✅          ✅ (bypasses checkSubscription)
  /api/draws/my-entries     ❌      ✅          ✅
  /api/winners/*            ❌      ✅          ✅
  /api/wallet/*             ❌      ✅          ✅
  /api/user/*               ❌      ✅          ✅
  /api/admin/*              ❌      ❌          ✅ (isAdmin only)
  ─────────────────────────────────────────────────
*/

dotenv.config();

// --- CASE TRANSFORMATION UTILITIES ---

// Convert snake_case object keys to camelCase
const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toCamel)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [
        key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
        toCamel(val)
      ])
    )
  }
  return obj
}

// Convert camelCase object keys to snake_case
const toSnake = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(toSnake)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, val]) => [
        key.replace(/[A-Z]/g, c => `_${c.toLowerCase()}`),
        toSnake(val)
      ])
    )
  }
  return obj
}

const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
  'FRONTEND_URL',
  'SUBSCRIPTION_MONTHLY_PRICE',
  'SUBSCRIPTION_YEARLY_PRICE'
]

const missingVars = REQUIRED_ENV_VARS.filter(v => !process.env[v])
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars)
  process.exit(1)
}

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

// Request Body Transformer (camelCase to snake_case)
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object' && !(req.body instanceof Buffer)) {
    req.body = toSnake(req.body)
  }
  next()
})

// --- SECURITY MIDDLEWARE ---

// HTTPS Enforcement in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`)
  }
  next()
})

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }
  next()
})

// --- SUPABASE CONFIG ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("CRITICAL ERROR: Supabase credentials are missing in .env");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many requests, please try again later" }
});

// Withdrawal rate limiter — max 5 per hour
const withdrawalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { 
    success: false, 
    message: 'Too many withdrawal requests. Try again in an hour.' 
  }
})

// Score submission rate limiter — max 20 per hour
const scoreLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { 
    success: false, 
    message: 'Too many score submissions. Try again later.' 
  }
})

// Admin action rate limiter — max 100 per 15 min
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { 
    success: false, 
    message: 'Too many admin requests. Slow down.' 
  }
})

// --- EMAIL SETUP ---
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER || "placeholder@ethereal.email",
    pass: process.env.SMTP_PASS || "placeholder_pass",
  },
});

const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Kinetic Golf" <noreply@kineticgolf.com>',
      to,
      subject,
      text,
      html: html || text,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Email failed:", error);
  }
};

// --- MULTER SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// --- ZOD SCHEMAS ---
const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const ScoreAddSchema = z.object({
  score: z.number().optional(),
  course: z.string(),
  date: z.string().optional(),
  holes: z.number().optional(), // 9 or 18
  hole_scores: z.array(z.number()).optional(),
  hole_pars: z.array(z.number()).optional(),
}).refine(data => {
  if (data.hole_scores || data.hole_pars) {
    return data.hole_scores?.length === data.hole_pars?.length;
  }
  return data.score !== undefined;
}, {
  message: "Either total score or matching hole scores and pars must be provided"
});

// Helper function to calculate Stableford points
function calculateStablefordPoints(holeScores: number[], holePars: number[]): number {
  return holeScores.reduce((acc: number, strokes: number, i: number) => {
    const par = holePars[i];
    const diff = strokes - par;
    if (diff >= 2) return acc + 0;
    if (diff === 1) return acc + 1;
    if (diff === 0) return acc + 2;
    if (diff === -1) return acc + 3;
    if (diff === -2) return acc + 4;
    if (diff <= -3) return acc + 5;
    return acc;
  }, 0);
}


// --- AUTH MIDDLEWARE ---

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ success: false, message: "Access denied" });

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) return res.status(403).json({ success: false, message: "Invalid token" });
    req.user = user;
    next();
  });
};

const isAdmin = async (req: any, res: any, next: any) => {
  try {
    // First check JWT role for speed
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    // Then verify against DB to prevent stale JWT abuse
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      message: 'Admin check failed' 
    });
  }
};

const isSubscriber = async (req: any, res: any, next: any) => {
  try {
    const { data: user, error } = await supabase.from("users").select("subscription_status, role").eq("id", req.user.id).single();
    if (error || !user) return res.status(404).json({ message: "User not found" });

    if (user.role === 'admin') {
      return next();
    }

    if (user.subscription_status !== "active") {
      return res.status(403).json({ message: "Active subscription required" });
    }
    next();
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

const checkSubscription = async (req: any, res: any, next: any) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('subscription_status, subscription_renewal_date, role')
      .eq('id', req.user.id)
      .single();

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Admins bypass subscription check entirely
    if (user.role === 'admin') {
      return next();
    }

    // Check if subscription has lapsed by renewal date
    if (
      user.subscription_status === 'active' &&
      user.subscription_renewal_date &&
      new Date(user.subscription_renewal_date) < new Date()
    ) {
      // Auto-lapse expired subscriptions
      await supabase
        .from('users')
        .update({ subscription_status: 'lapsed' })
        .eq('id', req.user.id);

      return res.status(403).json({ success: false, message: 'Subscription expired. Please renew.' });
    }

    if (user.subscription_status !== 'active') {
      return res.status(403).json({ success: false, message: 'Active subscription required.' });
    }

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Subscription check failed' });
  }
};

// --- WALLET UTILITY ---

const creditWallet = async (userId: string, amount: number) => {
  // Check if wallet exists
  const { data: existing } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    // Update existing wallet
    await supabase
      .from('wallets')
      .update({
        balance: existing.balance + amount,
        total_earned: existing.total_earned + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
  } else {
    // Create new wallet
    await supabase
      .from('wallets')
      .insert({
        user_id: userId,
        balance: amount,
        total_earned: amount,
        total_withdrawn: 0
      });
  }
};

// --- RAZORPAY CONFIG ---

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// --- API ROUTES ---

// Auth
app.post("/api/auth/register", authLimiter, async (req, res) => {
  console.log("POST /api/auth/register triggered", { email: req.body?.email });
  console.log("Env Check:", { 
    hasUrl: !!process.env.SUPABASE_URL, 
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV
  });

  try {
    const { name, email, password } = RegisterSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingUser } = await supabase.from("users").select("id").eq("email", normalizedEmail).single();
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase.from("users").insert({
      name,
      email: normalizedEmail,
      password_hash: hashedPassword,
    }).select().single();
    if (error) {
      console.error("Signup database error:", error);
      return res.status(500).json({ success: false, message: `Database error: ${error.message}` });
    }
    
    // Send Welcome Email
    try {
      await sendEmail(
        normalizedEmail,
        "Welcome to Kinetic Golf!",
        `Hi ${name}, welcome to Kinetic Golf! You can now start tracking your scores and participating in our charitable mission.`,
        `<h1>Welcome to Kinetic Golf!</h1>
         <p>Hi ${name},</p>
         <p>Thank you for joining <strong>Kinetic Golf</strong>. We're excited to have you as part of our community making a real-world impact through the game of golf.</p>
         <p>You can now log in to the dashboard to start tracking your scores, explore our community partners, and participate in exclusive draws.</p>
         <br/>
         <p>Best regards,<br/>The Kinetic Golf Team</p>`
      );
    } catch (emailErr) {
      console.error("Welcome email failed:", emailErr);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        subscriptionPlan: user.subscription_plan,
        subscriptionRenewalDate: user.subscription_renewal_date,
        region: user.region,
        currency: user.currency,
        currencySymbol: user.currency_symbol,
        charityId: user.charity_id,
        charityContributionPercent: user.charity_contribution_percent
      }
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/api/auth/login", authLimiter, async (req, res) => {
  console.log("POST /api/auth/login triggered", { email: req.body?.email });
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const normalizedEmail = email.trim().toLowerCase();

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ success: false, message: "Backend configuration error: Supabase credentials missing" });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (error) {
      console.error("Login database error:", error);
      if (error.code === 'PGRST116') { // item not found
        return res.status(401).json({ success: false, message: "User not found with this email" });
      }
      return res.status(500).json({ success: false, message: `Database error: ${error.message}` });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionStatus: user.subscription_status,
        subscriptionPlan: user.subscription_plan,
        subscriptionRenewalDate: user.subscription_renewal_date,
        region: user.region,
        currency: user.currency,
        currencySymbol: user.currency_symbol,
        charityId: user.charity_id,
        charityContributionPercent: user.charity_contribution_percent
      }
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        subscription_status,
        subscription_plan,
        subscription_renewal_date,
        charity_id,
        charity_contribution_percent,
        created_at
      `)
      .eq('id', req.user.id)
      .single() as any;

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Transform snake_case to camelCase for frontend
    const mappedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscription_status,
      subscriptionPlan: user.subscription_plan,
      subscriptionRenewalDate: user.subscription_renewal_date,
      charityId: user.charity_id,
      charityContributionPercent: user.charity_contribution_percent,
      createdAt: user.created_at,
      phone: user.phone,
      address: user.address,
      state: user.state,
      pincode: user.pincode,
      plan: {
        name: user.subscription_plan,
        status: user.subscription_status
      }
    };
    res.json({ success: true, user: mappedUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req: any, res) => {
  try {
    const { name, phone, address, state, pincode } = req.body;
    const { data: user, error } = await supabase.from("users")
      .update({ name, phone, address, state, pincode })
      .eq("id", req.user.id)
      .select()
      .single();

    if (!user || error) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// Payment
app.post("/api/payment/create-order", authenticateToken, async (req: any, res) => {
  try {
    const { amount, plan } = req.body;
    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    const { error } = await supabase.from("payments").insert({
      user_id: req.user.id,
      razorpay_order_id: order.id,
      amount,
      status: "pending",
    });

    if (error) throw error;
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/api/payment/verify", authenticateToken, async (req: any, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      await supabase.from("payments")
        .update({ status: "success", razorpay_payment_id })
        .eq("razorpay_order_id", razorpay_order_id);

      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (plan === "yearly" ? 12 : 1));

      await supabase.from("users")
        .update({
          subscription_status: "active",
          subscription_plan: plan,
          subscription_renewal_date: endDate.toISOString()
        })
        .eq("id", req.user.id);

      await supabase.from("subscriptions").insert({
        user_id: req.user.id,
        plan,
        razorpay_order_id,
        razorpay_payment_id,
        status: "active",
        start_date: new Date().toISOString(),
        end_date: endDate.toISOString(),
      });
      // Fetch user details for email
      const { data: user, error: userError } = await supabase.from("users").select("name, email, subscription_renewal_date").eq("id", req.user.id).single() as any;
      if (user && !userError) {
        await sendEmail(
          user.email,
          "Subscription Activated - Kinetic Golf",
          `Hi ${user.name}, your ${plan} subscription is now active! Welcome to the elite circle.`,
          `<h1>Welcome to Kinetic Golf!</h1><p>Hi ${user.name},</p><p>Your <strong>${plan}</strong> subscription is now active! You are now eligible for monthly draws and elite gear rewards.</p><p>Next renewal: ${endDate.toLocaleDateString()}</p>`
        );
      }

res.json({ message: "Payment verified successfully" });
    } else {
      await supabase.from("payments").update({ status: "failed" }).eq("razorpay_order_id", razorpay_order_id);
      res.status(400).json({ message: "Invalid signature" });
    }
  } catch (err: any) {
  res.status(500).json({ message: err.message });
}
});

// Subscription Management
app.get("/api/subscription/status", authenticateToken, async (req: any, res) => {
  try {
    const { data: sub, error } = await supabase.from("subscriptions")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error || !sub) return res.status(404).json({ message: "Subscription not found" });
    res.json(sub);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/subscription/billing-history", authenticateToken, async (req: any, res) => {
  try {
    const { data: payments, error } = await supabase.from("payments")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(payments);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/subscription/cancel", authenticateToken, async (req: any, res) => {
  try {
    const { error } = await supabase.from("users")
      .update({ subscription_status: "cancelled" })
      .eq("id", req.user.id);
    if (error) throw error;
    res.json({ message: "Subscription cancelled successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/subscription/update-payment", authenticateToken, async (req: any, res) => {
  res.json({ message: "Payment method update initiated" });
});

app.post("/api/subscription/create-order", authenticateToken, async (req: any, res) => {
  const { amount, plan } = req.body;
  const options = { amount: amount * 100, currency: "INR", receipt: `receipt_${Date.now()}` };
  const order = await razorpay.orders.create(options);
  await supabase.from("payments").insert({ user_id: req.user.id, razorpay_order_id: order.id, amount, status: "pending" });
  res.json(order);
});

app.post("/api/subscription/verify-payment", authenticateToken, async (req: any, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(body.toString()).digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Calculate endDate correctly
    const endDate = new Date();
    if (plan === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Create subscription record
    await supabase.from('subscriptions').insert({
      user_id: req.user.id,
      plan,
      razorpay_order_id,
      razorpay_payment_id,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: endDate.toISOString()
    });

    // Update user record in Supabase
    await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_renewal_date: endDate.toISOString()
      })
      .eq('id', req.user.id);

    // Return fresh user data in response
    const { data: updatedUser } = await supabase
      .from('users')
      .select('id, name, email, role, subscription_status, subscription_plan, subscription_renewal_date')
      .eq('id', req.user.id)
      .single();

    res.json({
      success: true,
      message: 'Subscription activated',
      user: updatedUser
    });
  } else {
    res.status(400).json({ success: false, message: "Invalid signature" });
  }
});


// Scores
app.post("/api/scores/add", authenticateToken, checkSubscription, scoreLimiter, async (req: any, res) => {
  try {
    const { score, course, date, hole_scores, hole_pars, holes } = ScoreAddSchema.parse(req.body);

    let points = 0;
    if (hole_scores && hole_pars) {
      points = calculateStablefordPoints(hole_scores, hole_pars);
    } else {
      points = score || 0;
    }

    const totalStrokes = hole_scores ? hole_scores.reduce((a: number, b: number) => a + b, 0) : score;

    const { data: newScore, error } = await supabase.from("scores").insert({
      user_id: req.user.id,
      score: totalStrokes,
      points,
      course,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      hole_scores,
      hole_pars
    }).select().single();

    if (error) throw error;

    // Logic: Keep only last 5 scores
    const { data: userScores } = await supabase.from("scores")
      .select("id")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false });

    if (userScores && userScores.length > 5) {
      const idsToDelete = userScores.slice(5).map(s => s.id);
      await supabase.from("scores").delete().in("id", idsToDelete);
    }

    res.status(201).json({ message: "Score added successfully", points });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/scores", authenticateToken, checkSubscription, async (req: any, res) => {
  try {
    const { data: scores, error } = await supabase.from("scores")
      .select("*")
      .eq("user_id", req.user.id)
      .order("date", { ascending: false });

    if (error) throw error;
    res.json(scores);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/scores/:id", authenticateToken, checkSubscription, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { score, course, date, hole_scores, hole_pars, holes } = ScoreAddSchema.parse(req.body);

    // Verify ownership
    const { data: existing } = await supabase.from("scores").select("user_id").eq("id", id).single();
    if (!existing || existing.user_id !== req.user.id) {
      return res.status(404).json({ message: "Score not found" });
    }

    let points = 0;
    if (hole_scores && hole_pars) {
      points = calculateStablefordPoints(hole_scores, hole_pars);
    } else {
      points = score || 0;
    }

    const totalStrokes = hole_scores ? hole_scores.reduce((a: number, b: number) => a + b, 0) : score;

    const { data: updated, error } = await supabase.from("scores").update({
      score: totalStrokes,
      points,
      course,
      date: date ? new Date(date).toISOString() : new Date().toISOString(),
      hole_scores,
      hole_pars
    }).eq("id", id).select().single();

    if (error) throw error;
    res.json({ message: "Score updated successfully", updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/scores/:id", authenticateToken, checkSubscription, async (req: any, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const { data: existing } = await supabase.from("scores").select("user_id").eq("id", id).single();
    if (!existing || existing.user_id !== req.user.id) {
      return res.status(404).json({ message: "Score not found" });
    }

    const { error } = await supabase.from("scores").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "Score deleted successfully" });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Draws
app.get("/api/draws/current", async (req, res) => {
  try {
    const { data: draw } = await supabase.from("draws").select("*").order("created_at", { ascending: false }).limit(1).single();
    const { data: settings } = await supabase.from("settings").select("*").limit(1).single();
    res.json({ draw, settings });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/draws/history", async (req, res) => {
  try {
    const { data: draws } = await supabase.from("draws").select("*").order("created_at", { ascending: false }).limit(10);
    res.json(draws);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// Charities
app.get("/api/charities", async (req, res) => {
  try {
    const { data: charities } = await supabase.from("charities").select("*");
    res.json(charities);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/charities/select", authenticateToken, checkSubscription, async (req: any, res) => {
  try {
    const { charity_id, contribution_percentage } = req.body;
    await supabase.from("users")
      .update({ charity_id, charity_contribution_percent: contribution_percentage })
      .eq("id", req.user.id);
    res.json({ message: "Charity selected successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// Winners
app.post("/api/winners/upload-proof", authenticateToken, checkSubscription, upload.single("proof"), async (req: any, res) => {
  try {
    const { draw_id, match_type } = req.body;
    const proofUrl = req.file ? `/uploads/${req.file.filename}` : req.body.proof_url;

    const { data: winner, error } = await supabase.from("winners").insert({
      user_id: req.user.id,
      draw_id,
      match_type,
      proof_url: proofUrl,
      verification_status: "pending"
    }).select().single();

    if (error) throw error;

    const { data: user } = await supabase.from("users").select("name, email").eq("id", req.user.id).single();
    if (user) {
      await sendEmail(
        user.email,
        "Prize Claim Received - Kinetic Golf",
        `Hi ${user.name}, we've received your proof for the draw. Our team will verify it shortly.`,
        `<h1>Prize Claim Received</h1><p>Hi ${user.name},</p><p>We have received your proof for the prize claim. Our team is currently verifying the details.</p><p>You will be notified once the verification is complete.</p>`
      );
    }

    res.status(201).json({ message: "Proof uploaded successfully", winner });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/winners/status", authenticateToken, checkSubscription, async (req: any, res) => {
  try {
    const { data: winners, error } = await supabase.from("winners")
      .select("*, draws(*)")
      .eq("user_id", req.user.id);

    if (error) throw error;
    res.json(winners);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// --- WALLET ROUTES ---

app.get("/api/wallet", authenticateToken, checkSubscription, async (req: any, res) => {
  try {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    const { data: withdrawals } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!wallet) {
      return res.json({
        success: true,
        wallet: { balance: 0, totalEarned: 0, totalWithdrawn: 0 },
        withdrawals
      });
    }

    res.json({ success: true, wallet, withdrawals });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/wallet/withdraw", authenticateToken, checkSubscription, withdrawalLimiter, async (req: any, res) => {
  try {
    const { amount, withdrawal_method, bank_account_name, bank_account_number, bank_ifsc, bank_name, upi_id } = req.body;

    // Validation: amount must be a positive number
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    // Validation: minimum withdrawal is ₹100
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹100'
      });
    }

    // Validation: withdrawal_method must be 'bank' or 'upi'
    if (!['bank', 'upi'].includes(withdrawal_method)) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal method must be bank or UPI'
      });
    }

    // Validation: bank details required for 'bank' method
    if (withdrawal_method === 'bank') {
      if (!bank_account_name || !bank_account_number || !bank_ifsc || !bank_name) {
        return res.status(400).json({
          success: false,
          message: 'Bank account name, account number, IFSC, and bank name are required'
        });
      }
    }

    // Validation: UPI ID required for 'upi' method
    if (withdrawal_method === 'upi' && !upi_id) {
      return res.status(400).json({
        success: false,
        message: 'UPI ID is required'
      });
    }

    // Fetch wallet and check balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Check no pending withdrawal already exists
    const { data: pending } = await supabase
      .from('withdrawals')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('status', 'pending')
      .single();

    if (pending) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending withdrawal request'
      });
    }

    // Deduct amount from wallet balance
    const newBalance = wallet.balance - amount;
    await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        total_withdrawn: wallet.total_withdrawn + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id);

    // Create withdrawal record
    await supabase.from('withdrawals').insert({
      user_id: req.user.id,
      amount,
      status: 'pending',
      withdrawal_method,
      bank_account_name,
      bank_account_number,
      bank_ifsc,
      bank_name,
      upi_id
    });

    res.json({
      success: true,
      message: 'Withdrawal request submitted',
      newBalance: newBalance
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


app.use("/api/admin", adminLimiter);

app.get("/api/admin/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from("users").select("*", { count: "exact", head: true });
    const { count: activeSubs } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "active");
    
    const { data: payments } = await supabase.from("payments").select("amount").eq("status", "success");
    const totalRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

    const { data: charities } = await supabase.from("charities").select("total_donations");
    const totalCharity = charities?.reduce((sum, c) => sum + (c.total_donations || 0), 0) || 0;

    res.json({
      totalUsers: totalUsers || 0,
      activeSubs: activeSubs || 0,
      totalRevenue,
      totalCharity
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/admin/reports", authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const [
      { count: totalUsers },
      { count: activeSubscribers },
      { count: totalDraws },
      { count: pendingWinners },
      { data: recentWithdrawals },
      { data: topCharities },
      { data: settings }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'active'),
      supabase.from('draws').select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.from('winners').select('*', { count: 'exact', head: true })
        .eq('payment_status', 'pending'),
      supabase.from('withdrawals').select('amount, status')
        .order('created_at', { ascending: false }).limit(30),
      supabase.from('users')
        .select('charity_id, charities(name)')
        .not('charity_id', 'is', null),
      supabase.from('platform_settings')
        .select('key, value')
        .in('key', ['prize_pool_estimate', 'jackpot_amount', 'next_draw_date'])
    ])

    // Calculate financial totals from withdrawals
    const totalWithdrawnPaid = recentWithdrawals
      ?.filter(w => w.status === 'paid')
      .reduce((sum, w) => sum + Number(w.amount), 0) ?? 0

    const totalWithdrawnPending = recentWithdrawals
      ?.filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + Number(w.amount), 0) ?? 0

    // Calculate charity distribution
    const charityCount = topCharities?.reduce((acc, u) => {
      const name = (u as any).charities?.name ?? 'Unknown'
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {} as Record<string, number>) ?? {}

    return res.json({
      success: true,
      report: {
        users: { total: totalUsers, active: activeSubscribers },
        draws: { total: totalDraws },
        winners: { pending: pendingWinners },
        financials: {
          prizePoolEstimate: settings?.find(s => s.key === 'prize_pool_estimate')?.value ?? '0',
          jackpotAmount: settings?.find(s => s.key === 'jackpot_amount')?.value ?? '0',
          totalWithdrawnPaid: totalWithdrawnPaid,
          totalWithdrawnPending: totalWithdrawnPending
        },
        charityDistribution: charityCount,
        nextDrawDate: settings?.find(s => s.key === 'next_draw_date')?.value ?? ''
      }
    })
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: users } = await supabase.from("users").select("id, name, email, role, subscription_status, subscription_plan, subscription_renewal_date, charity_id, phone, address, state, pincode, created_at, charities(name)");
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/users/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: user, error } = await supabase.from("users")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error || !user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/admin/scores", authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { user_id, limit = 50, offset = 0, from, to } = req.query;

    let query = supabase
      .from('golf_scores')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(Math.min(Number(limit), 200))
      .range(Number(offset), Number(offset) + Math.min(Number(limit), 200) - 1);

    if (user_id) query = query.eq('user_id', user_id);
    if (from) query = query.gte('date_played', from);
    if (to) query = query.lte('date_played', to);

    const { data: scores, error } = await query;
    if (error) throw error;

    return res.json({ 
      success: true, 
      scores,
      pagination: { limit: Number(limit), offset: Number(offset) }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get("/api/admin/audit-log", authenticateToken, isAdmin, async (req: any, res) => {
  try {
    // Fetch last 50 events across the platform combining different tables
    const [
      { data: registrations },
      { data: subscriptions },
      { data: withdrawals },
      { data: draws }
    ] = await Promise.all([
      supabase.from('users').select('id, name, email, created_at')
        .order('created_at', { ascending: false }).limit(50),
      supabase.from('subscriptions').select('id, plan, amount, created_at, users(name)')
        .order('created_at', { ascending: false }).limit(50),
      supabase.from('withdrawals').select('id, amount, status, created_at, users(name)')
        .order('created_at', { ascending: false }).limit(50),
      supabase.from('draws').select('id, number, status, created_at')
        .order('created_at', { ascending: false }).limit(50)
    ]);

    const events = [
      ...(registrations || []).map(r => ({ ...r, type: 'registration' })),
      ...(subscriptions || []).map(s => ({ ...s, type: 'subscription' })),
      ...(withdrawals || []).map(w => ({ ...w, type: 'withdrawal' })),
      ...(draws || []).map(d => ({ ...d, type: 'draw' }))
    ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50);

    return res.json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/admin/scores/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: score, error } = await supabase.from("scores")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error || !score) return res.status(404).json({ message: "Score not found" });
    res.json(score);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/api/admin/charities", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: charity, error } = await supabase.from("charities").insert(req.body).select().single();
    if (error) throw error;
    res.status(201).json(charity);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.put("/api/admin/charities/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: charity, error } = await supabase.from("charities")
      .update(req.body)
      .eq("id", req.params.id)
      .select()
      .single();
    if (error || !charity) return res.status(404).json({ message: "Charity not found" });
    res.json(charity);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/admin/charities/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from("charities").delete().eq("id", req.params.id);
    if (error) throw error;
    res.json({ message: "Charity deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/admin/draw/run", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { numbers, type } = req.body;

    const { data: lastDraw } = await supabase.from("draws").select("*").order("created_at", { ascending: false }).limit(1).single();
    const lastDate = lastDraw ? lastDraw.created_at : new Date(0).toISOString();

    const { data: payments } = await supabase.from("payments").select("amount").eq("status", "success").gt("created_at", lastDate);
    const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
    const prizePool = revenue * 0.5;

    const { count: drawCount } = await supabase.from("draws").select("*", { count: "exact", head: true });
    const drawNumber = `DRW-${( (drawCount || 0) + 1).toString().padStart(4, '0')}`;
    
    const winningNumbers = numbers || Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);

    const { data: draw, error: drawError } = await supabase.from("draws").insert({
      drawn_numbers: winningNumbers,
      type: type || "random",
      number: drawNumber,
      status: "published",
      is_published: true,
      prize_pool: prizePool
    }).select().single();

    if (drawError) throw drawError;

    // Identify winners
    const { data: activeUsers } = await supabase.from("users").select("id, email, name").eq("subscription_status", "active");
    if (activeUsers) {
      for (const user of activeUsers) {
        const { data: latestScores } = await supabase.from("scores")
          .select("points")
          .eq("user_id", user.id)
          .order("date", { ascending: false })
          .limit(5);
        
        const userNumbers = latestScores?.map(s => s.points) || [];
        const matches = winningNumbers.filter((n: number) => userNumbers.includes(n)).length;

        if (matches >= 3) {
          let matchType = matches > 5 ? 5 : matches;
          let share = 0;
          if (matchType === 5) share = 0.4;
          else if (matchType === 4) share = 0.35;
          else if (matchType === 3) share = 0.25;

          await supabase.from("winners").insert({
            user_id: user.id,
            draw_id: draw.id,
            match_type: matchType,
            prize_amount: prizePool * share,
            status: "pending"
          });
        }
      }
    }

    res.status(201).json(draw);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/admin/draw/simulate", authenticateToken, isAdmin, async (req, res) => {
  try {
    const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);
    res.json({ numbers, type: "simulation", date: new Date() });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/admin/draw/publish/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: draw, error } = await supabase.from("draws")
      .update({ status: "published", is_published: true })
      .eq("id", req.params.id)
      .select()
      .single();
    if (error || !draw) return res.status(404).json({ message: "Draw not found" });
    res.json(draw);

    // [Trigger] Broadcast results to all participants
    try {
      const { data: entries } = await supabase
        .from('draw_entries')
        .select('user_id, match_type, users(email, name)')
        .eq('draw_id', req.params.id);
      
      if (entries) {
        for (const entry of (entries as any[])) {
          const isWinner = entry.match_type !== null;
          const subject = isWinner 
            ? "🏆 You won in this month's draw!" 
            : "This month's draw results are in";
          
          const html = isWinner
            ? `<h2>Congratulations ${entry.users.name}!</h2>
               <p>You matched <strong>${entry.match_type}</strong> in this month's draw.</p>
               <p>Log in to upload your proof and claim your prize.</p>
               <a href="${process.env.FRONTEND_URL}/winners">View Your Winnings</a>`
            : `<h2>Hi ${entry.users.name},</h2>
               <p>This month's draw results are now published.</p>
               <p>Unfortunately you didn't match this time — but keep entering your scores for next month!</p>
               <a href="${process.env.FRONTEND_URL}/draws">View Draw Results</a>`;
          
          sendEmail(entry.users.email, subject, html.replace(/<[^>]*>/g, ''), html);
        }
      }
    } catch (emailErr) {
      console.error("Broadcast email failed:", emailErr);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/admin/winners", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: winners } = await supabase.from("winners").select("*, users(*), draws(*)");
    res.json(winners);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/admin/withdrawals", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('withdrawals')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: withdrawals, error } = await query;

    if (error) throw error;
    res.json(withdrawals);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/withdrawals/:id/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: withdrawal, error } = await supabase
      .from('withdrawals')
      .update({
        status: 'approved',
        processed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*, users(name, email)')
      .single();

    if (error || !withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    res.json(withdrawal);

    // [Trigger] Email on Approve
    try {
      const { data: user } = await supabase.from("users").select("name, email").eq("id", withdrawal.user_id).single() as any;
      if (user) {
        await sendEmail(
          user.email,
          'Your withdrawal has been approved',
          `Hi ${user.name}, your withdrawal of ₹${withdrawal.amount} via ${withdrawal.withdrawal_method} has been approved. Expected processing time: 3-5 business days.`,
          `<h1>Withdrawal Approved</h1><p>Hi ${user.name},</p><p>Your withdrawal of <strong>₹${withdrawal.amount}</strong> via <strong>${withdrawal.withdrawal_method}</strong> has been approved.</p><p>Expected processing time: 3-5 business days.</p>`
        );
      }
    } catch (emailErr) {
      console.error("Approval email failed:", emailErr);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/withdrawals/:id/reject", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { admin_note } = req.body;

    // Get withdrawal details first
    const { data: withdrawal } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    // REFUND the amount back to user wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', withdrawal.user_id)
      .single();

    if (wallet) {
      await supabase
        .from('wallets')
        .update({
          balance: wallet.balance + withdrawal.amount,
          total_withdrawn: wallet.total_withdrawn - withdrawal.amount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', withdrawal.user_id);
    }

    // Update withdrawal status
    const { data: updated, error } = await supabase
      .from('withdrawals')
      .update({
        status: 'rejected',
        admin_note,
        processed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*, users(name, email)')
      .single();

    if (error || !updated) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    res.json(updated);

    // [Trigger] Email on Reject
    try {
      const { data: user } = await supabase.from("users").select("name, email").eq("id", updated.user_id).single() as any;
      if (user) {
        await sendEmail(
          user.email,
          'Update on your withdrawal request',
          `Hi ${user.name}, your withdrawal request of ₹${updated.amount} was rejected. Amount has been refunded to your wallet. ${updated.admin_note ? `Note: ${updated.admin_note}` : ''}`,
          `<h1>Withdrawal Update</h1><p>Hi ${user.name},</p><p>Your withdrawal request of <strong>₹${updated.amount}</strong> was rejected. The amount has been refunded back to your wallet balance.</p>${updated.admin_note ? `<p><strong>Admin Note:</strong> ${updated.admin_note}</p>` : ''}<p>You are welcome to try again if the issue is resolved.</p>`
        );
      }
    } catch (emailErr) {
      console.error("Rejection email failed:", emailErr);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/withdrawals/:id/mark-paid", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { data: withdrawal } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    // Credit wallet when marking as paid
    await creditWallet(withdrawal.user_id, withdrawal.amount);

    const { data: updated, error } = await supabase
      .from('withdrawals')
      .update({
        status: 'paid',
        processed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*, users(name, email)')
      .single();

    if (error || !updated) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    res.json(updated);

    // [Trigger] Email on Paid
    try {
      const { data: user } = await supabase.from("users").select("name, email").eq("id", updated.user_id).single() as any;
      if (user) {
        await sendEmail(
          user.email,
          '✅ Your withdrawal has been processed',
          `Hi ${user.name}, your withdrawal of ₹${updated.amount} has been successfully processed and sent to your ${updated.withdrawal_method} account.`,
          `<h1>Withdrawal Processed</h1><p>Hi ${user.name},</p><p>Your withdrawal of <strong>₹${updated.amount}</strong> was processed successfully.</p><p>Funds have been sent to your <strong>${updated.withdrawal_method}</strong> account.</p><p>Thank you for being part of Kinetic Golf!</p>`
        );
      }
    } catch (emailErr) {
      console.error("Payment confirmation email failed:", emailErr);
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/winners/:id", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { data: winner, error } = await supabase.from("winners")
      .update({ status })
      .eq("id", req.params.id)
      .select("*, users(*)")
      .single();
    
    if (error || !winner) return res.status(404).json({ message: "Winner not found" });

    if (status === "approved" || status === "paid") {
      const user = winner.users as any;
      await sendEmail(
        user.email,
        `Prize Claim ${status.toUpperCase()} - Kinetic Golf`,
        `Hi ${user.name}, your prize claim has been ${status}. Congratulations!`,
        `<h1>Prize Claim ${status.toUpperCase()}</h1><p>Hi ${user.name},</p><p>Your prize claim for the monthly draw has been <strong>${status}</strong>.</p><p>Congratulations on your win!</p>`
      );
    }
    res.json(winner);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// Settings
app.get("/api/settings", async (req, res) => {
  try {
    const { data: settings } = await supabase.from("settings").select("*").limit(1).single();
    if (!settings) {
      const { data: newSettings } = await supabase.from("settings").insert({}).select().single();
      return res.json(newSettings);
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/admin/settings", authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { next_draw_date, prize_pool_estimate } = req.body;
    const { data: settings, error } = await supabase.from("settings")
      .update({ next_draw_date, prize_pool_estimate })
      .eq("id", 1) // Assuming single settings record with id 1
      .select()
      .single();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


// Global Response Transformer (snake_case to camelCase)
app.use((req, res, next) => {
  const originalJson = res.json.bind(res)
  res.json = (data: any) => {
    return originalJson(toCamel(data))
  }
  next()
})

app.post("/api/admin/email/test", authenticateToken, isAdmin, async (req: any, res) => {
  try {
    const { data: user } = await supabase.from("users").select("name, email").eq("id", req.user.id).single() as any;
    if (!user) return res.status(404).json({ success: false, message: "Admin user not found" });

    await sendEmail(
      user.email,
      "SMTP Test Success - Kinetic Golf",
      `Hi ${user.name}, your SMTP configuration is working perfectly!`,
      `<h1>SMTP Test Successful</h1><p>Hi ${user.name},</p><p>This is a test email from <strong>Kinetic Golf</strong> to verify your SMTP settings. Everything is working correctly!</p>`
    );

    res.json({ success: true, message: `Test email sent to ${user.email}` });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// --- VITE MIDDLEWARE & SERVER START ---

async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    // Fallback for SPA routing in development
    app.get("*", async (req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.includes('.')) {
        return next();
      }

      try {
        const url = req.originalUrl;
        // Read index.html
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        // Apply Vite HTML transforms. This injects the Vite HMR client, and
        // also applies HTML transforms from Vite plugins, e.g. global preambles
        // from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template);
        // Send the transformed HTML back.
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // The vercel.json will handle the SPA fallback in production on Vercel,
    // but this is kept for other production environments.
    app.get("*", (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only listen if not running as a Vercel serverless function
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
