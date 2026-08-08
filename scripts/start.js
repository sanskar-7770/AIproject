const { spawn } = require("child_process");
const path = require("path");
const node = process.platform === "win32" ? "node.exe" : "node";
const api = spawn(node, ["server.js"], { stdio: "inherit" });
const app = spawn(node, [path.join("node_modules", "react-scripts", "bin", "react-scripts.js"), "start"], { stdio: "inherit" });
const stop = () => { api.kill(); app.kill(); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
app.on("exit", (code) => process.exit(code || 0));
