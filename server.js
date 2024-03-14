const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { nanoid } = require("nanoid");
const app = express();

const PORT = process.env.PORT || 3000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());

// route for homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/index.html"));
});

// route for notes page
app.get("/notes", (req, res) => {
    res.sendFile(path.join(__dirname, "/public/notes.html"));
});

// route to fetch notes from database
app.get("/api/notes", async (req, res) => {
    try {
        const data = await fs.readFile("./db/db.json", "utf8");
        res.send(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", msg: "error reading the database file" });
    }
});

// route to add a new note to the database
app.post("/api/notes", async (req, res) => {
    const newNote = {
        id: nanoid(7),
        title: req.body.title,
        text: req.body.text,
    };
    try {
        const data = await fs.readFile("./db/db.json", "utf8");
        const notesArr = JSON.parse(data);
        notesArr.push(newNote);
        await fs.writeFile("./db/db.json", JSON.stringify(notesArr, null, 2));
        res.status(200).sendFile(path.join(__dirname, "./db/db.json"));
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", msg: "error accessing or writing to the database file" });
    }
});

// route to delete note from the database
app.delete("/api/notes/:id", async (req, res) => {
    try {
        const data = await fs.readFile("./db/db.json", "utf8");
        const notes = JSON.parse(data);
        const id = req.params.id;
        const index = notes.findIndex(note => note.id === id);
        if (index === -1) {
            return res.status(404).json({ status: "error", msg: "note not found" });
        }
        notes.splice(index, 1);
        await fs.writeFile("./db/db.json", JSON.stringify(notes, null, 2));
        res.status(200).json({ status: "success", msg: "note deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error", msg: "error accessing or writing to the database file" });
    }
});


app.listen(PORT, () => console.log(`server started on ${PORT}`));
