const express = require("express");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const thumbsupply = require("thumbsupply");

const videos = [
  {
    id: 0,
    poster: "/video/0/poster",
    duration: "3 mins",
    name: "Sample 1",
  },
  {
    id: 1,
    poster: "/video/1/poster",
    duration: "4 mins",
    name: "Sample 2",
  },
  {
    id: 2,
    poster: "/video/2/poster",
    duration: "2 mins",
    name: "Sample 3",
  },
];

const app = express();

app.use(cors());
app.use(express.json());

// app.get("/video", (req, res) => {
//   console.log(__dirname);
//   res.sendFile("assets/0.mp4", { root: __dirname });
// });

app.get("/videos", (req, res) => {
  res.json(videos);
});

app.get("/video/:id/data", (req, res) => {
  const id = req.params.id;
  const video = videos.find((v) => v.id == id);
  res.json(video);
});

app.get("/video/:id", (req, res) => {
  const path = `assets/${req.params.id}.mp4`;
  const stat = fs.statSync(path);
  const fileSize = stat.size;
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.get("/video/:id/poster", (req, res) => {
  thumbsupply
    .generateThumbnail(`assets/${req.params.id}.mp4`)
    .then((thumb) => res.sendFile(thumb));
});

// Listener config
const PORT = process.env.PORT || 4000;
app.listen(4000, () => {
  console.log(`Server running on port ${PORT}`);
});
