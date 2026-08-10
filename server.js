require("dotenv").config();

const http = require("http");
const crypto = require("crypto");
const dns = require("dns");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB_NAME || "apexstudy";
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

// Some local routers answer Windows DNS requests but refuse Node's SRV lookups.
// Set MONGODB_DNS_SERVER=1.1.1.1 in .env when that happens.
if (process.env.MONGODB_DNS_SERVER) {
  dns.setServers(process.env.MONGODB_DNS_SERVER.split(",").map((server) => server.trim()));
}

const mongoClient = new MongoClient(MONGODB_URI || "mongodb://invalid");
let users;

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}

function passwordMatches(password, storedPassword) {
  const [salt, storedHash] = String(storedPassword).split(":");
  if (!salt || !storedHash) return false;
  const attemptedHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(attemptedHash, "hex"));
}

function publicUser(user) {
  const { _id, password, ...safeUser } = user;
  return safeUser;
}

function send(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": CLIENT_ORIGIN, "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS" });
  response.end(JSON.stringify(data));
}

async function getAuthenticatedUser(request) {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");
    const { email } = jwt.verify(token, JWT_SECRET);
    return await users.findOne({ email });
  } catch {
    return null;
  }
}

function createToken(email) {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: "7d" });
}

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "sanskar2416@gmail.com").toLowerCase();
  const existing = await users.findOne({ email });
  if (!existing) {
    await users.insertOne({ id: `admin-${Date.now()}`, name: "ApexStudy Admin", email, password: hashPassword(process.env.ADMIN_PASSWORD || "Jaishreeram@"), role: "admin", course: "selfStudy", attempt: "", dailyGoal: 6, subjects: [], sessions: [], targets: [], exams: [], activeSession: null, createdAt: new Date().toISOString() });
  }
}

async function initializeDatabase() {
  if (!MONGODB_URI || !JWT_SECRET) throw new Error("MONGODB_URI and JWT_SECRET must be set in .env");
  await mongoClient.connect();
  users = mongoClient.db(DATABASE_NAME).collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  await seedAdmin();
}

const server = http.createServer((request, response) => {
  if (request.method === "OPTIONS") return send(response, 204, {});
  if (request.method === "GET" && request.url === "/api/health") return send(response, 200, { status: "ok" });
  if (!request.url.startsWith("/api/")) return send(response, 404, { message: "Not found" });
  let rawBody = "";
  request.on("data", (chunk) => { rawBody += chunk; });
  request.on("end", async () => {
    try {
      const body = rawBody ? JSON.parse(rawBody) : {};
      if (request.method === "POST" && request.url === "/api/auth/signup") {
        const { name, email, password, ...studyData } = body;
        const normalizedEmail = String(email || "").trim().toLowerCase();
        if (!name || !normalizedEmail || !password || password.length < 6) return send(response, 400, { message: "Please provide a name, email, and password of at least 6 characters." });
        if (await users.findOne({ email: normalizedEmail })) return send(response, 409, { message: "An account with this email already exists." });
        const user = { id: `user-${Date.now()}`, name: String(name).trim(), email: normalizedEmail, password: hashPassword(password), role: "user", ...studyData, createdAt: new Date().toISOString() };
        await users.insertOne(user);
        return send(response, 201, { token: createToken(normalizedEmail), user: publicUser(user) });
      }
      if (request.method === "POST" && request.url === "/api/auth/login") {
        const email = String(body.email || "").trim().toLowerCase();
        const user = await users.findOne({ email });
        if (!user || !passwordMatches(body.password || "", user.password)) return send(response, 401, { message: "Incorrect email or password." });
        return send(response, 200, { token: createToken(email), user: publicUser(user) });
      }
      if (request.method === "POST" && request.url === "/api/auth/migrate") {
        const legacyUser = body.user || {};
        const email = String(legacyUser.email || "").trim().toLowerCase();
        if (!email || !body.password || legacyUser.password !== body.password) return send(response, 401, { message: "Incorrect email or password." });
        if (await users.findOne({ email })) return send(response, 409, { message: "This account has already been migrated. Please sign in." });
        const { password, role, ...safeLegacyData } = legacyUser;
        const user = { ...safeLegacyData, email, password: hashPassword(body.password), role: "user", id: legacyUser.id || `user-${Date.now()}`, createdAt: legacyUser.createdAt || new Date().toISOString() };
        await users.insertOne(user);
        return send(response, 201, { token: createToken(email), user: publicUser(user) });
      }
      const user = await getAuthenticatedUser(request);
      if (!user) return send(response, 401, { message: "Please sign in again." });
      if (request.method === "GET" && request.url === "/api/auth/me") return send(response, 200, { user: publicUser(user) });
      if (request.method === "PATCH" && request.url === "/api/users/me") {
        const allowed = ["name", "course", "attempt", "dailyGoal", "subjects", "sessions", "targets", "exams", "activeSession"];
        const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
        await users.updateOne({ email: user.email }, { $set: updates });
        return send(response, 200, { user: publicUser({ ...user, ...updates }) });
      }
      if (request.method === "GET" && request.url === "/api/admin/users") {
        if (user.role !== "admin") return send(response, 403, { message: "Admin access required." });
        const allUsers = await users.find({}, { projection: { password: 0, _id: 0 } }).toArray();
        return send(response, 200, { users: allUsers });
      }
      return send(response, 404, { message: "Not found" });
    } catch (error) {
      console.error(error);
      return send(response, 500, { message: "The server could not process this request." });
    }
  });
});

initializeDatabase()
  .then(() => server.listen(PORT, "0.0.0.0", () => console.log(`ApexStudy API is running on port ${PORT}`)))
  .catch((error) => { console.error(`Database connection failed: ${error.message}`); process.exit(1); });
