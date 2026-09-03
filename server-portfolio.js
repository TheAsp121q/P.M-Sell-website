const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const hpp = require("hpp");
const compression = require("compression");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:" + PORT;

app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.emailjs.com", "https://fonts.googleapis.com", "'unsafe-inline'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "'unsafe-inline'"],
      fontSrc: ["https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.emailjs.com", "https://ipapi.co"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  permittedCrossDomainPolicies: false,
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
  frameguard: { action: "deny" }
}));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin === ALLOWED_ORIGIN || origin.startsWith("http://localhost")) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy violation"));
    }
  },
  methods: ["GET"],
  allowedHeaders: ["Content-Type"],
  credentials: false,
  optionsSuccessStatus: 204
}));

app.use(hpp());
app.use(compression());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));

const KNOWN_BAD_UA = /bot|crawl|spider|scraper|wget|curl|python-requests|go-http|java\/|libwww|lwp-|jakarta|httpclient|semrush|ahrefsbot|dotbot|mj12bot|baiduspider|yandexbot|seznambot|sogou|exabot|facebot|ia_archiver|masscan|nikto|nmap|sqlmap|havij|acunetix|burpsuite|nessus|openvas|dirbuster|gobuster|wfuzz|hydra|medusa/i;

const SQLI_PATTERN = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|CAST)\b|--|;|'.*'|\*|\/\*|\*\/|xp_|0x[0-9a-fA-F]+)/gi;
const XSS_PATTERN = /<[^>]*>|javascript\s*:|on\w+\s*=|<\s*script|<\s*iframe|data\s*:/gi;
const PATH_PATTERN = /(\.\.\/)|(\.\.\\)|(\/etc\/)|(\/proc\/)|(\/sys\/)|(%00)|(%2e%2e)/gi;
const SHELL_PATTERN = /(\$\()|(`)|(\|{1,2})|(>{2})|(>>)|(\bwget\b)|(\bcurl\b)/gi;

function blockBadAgents(req, res, next) {
  if (req.path === "/health") return next();
  const ua = req.headers["user-agent"] || "";
  if (KNOWN_BAD_UA.test(ua)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

function isMaliciousInput(val) {
  if (typeof val !== "string") return false;
  return SQLI_PATTERN.test(val) || XSS_PATTERN.test(val) || PATH_PATTERN.test(val) || SHELL_PATTERN.test(val);
}

function scanRequest(req, res, next) {
  const toCheck = [
    req.path,
    ...Object.values(req.query || {}),
    ...Object.values(req.body || {}),
    req.headers["x-forwarded-for"] || "",
    req.headers["referer"] || ""
  ];

  for (const val of toCheck) {
    if (typeof val === "string" && isMaliciousInput(val)) {
      return res.status(400).json({ error: "Bad request" });
    }
  }
  next();
}

function blockSuspiciousHeaders(req, res, next) {
  const suspicious = ["x-scan-id", "x-acunetix", "x-nessus", "x-sqlmap"];
  for (const h of suspicious) {
    if (req.headers[h]) {
      return res.status(403).json({ error: "Forbidden" });
    }
  }
  next();
}

function enforceHttps(req, res, next) {
  if (process.env.NODE_ENV === "production" && !req.secure && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(301, "https://" + req.headers.host + req.url);
  }
  next();
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests" },
  skip: function (req) { return req.path === "/health"; }
});

const speedLimiter = slowDown({
  windowMs: 60 * 1000,
  delayAfter: 40,
  delayMs: function (used) { return (used - 40) * 150; },
  maxDelayMs: 5000
});

const staticLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(enforceHttps);
app.use(blockBadAgents);
app.use(blockSuspiciousHeaders);
app.use(scanRequest);
app.use(globalLimiter);
app.use(speedLimiter);

app.use(function (req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});

app.use(staticLimiter);

app.use(express.static(path.join(__dirname), {
  index: "index.html",
  maxAge: "1h",
  etag: true,
  lastModified: true,
  setHeaders: function (res, filePath) {
    if (filePath.endsWith(".html")) {
      res.setHeader("Cache-Control", "no-store");
    }
    if (filePath.endsWith(".js") || filePath.endsWith(".css")) {
      res.setHeader("Cache-Control", "public, max-age=3600");
    }
  }
}));

app.get("/health", function (req, res) {
  res.status(200).json({ status: "ok" });
});

app.use(function (req, res) {
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

app.use(function (err, req, res, next) {
  if (err.message === "CORS policy violation") {
    return res.status(403).json({ error: "CORS policy violation" });
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, function () {
  console.log("Portfolio server running on port " + PORT);
});
