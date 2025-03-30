const express = require("express");
const path = require("path");
const { createServer: createViteServer } = require("vite");
const app = express();
const APPLET_URL = "http://localhost:5173";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

async function setupVite() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    root: path.join(__dirname, ".."),
  });

  app.use(vite.middlewares);
}
setupVite();

if (process.env.NODE_ENV === "production") {
  app.use("/src", express.static(path.join(__dirname)));
}

app.get("/", async (_req, res) => {
  try {
    const response = await fetch(`${APPLET_URL}/manifest.json`);
    const manifest = await response.json();
    res.render("index", { applet_url: APPLET_URL, manifest });
  } catch (error) {
    console.error("Error fetching manifest:", error);
    res.status(500).send("Error fetching manifest.json");
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
