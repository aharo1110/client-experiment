import express from "express";
import { createServer as createViteServer } from "vite";

const app = express();
const APPLET_URL = "http://localhost:5173";

app.set("view engine", "ejs");
app.set("views", new URL("../views", import.meta.url).pathname);

const vite = await createViteServer({
  server: { middlewareMode: true },
  root: new URL("..", import.meta.url).pathname,
});

app.use(vite.middlewares);

if (process.env.NODE_ENV === "production") {
  app.use("/src", express.static(new URL(import.meta.url).pathname));
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
