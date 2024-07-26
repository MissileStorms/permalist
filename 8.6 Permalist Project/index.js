import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

const app = express();
const port = 3000;

dotenv.config();

const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  try {
    db.query("SELECT * FROM items ORDER BY id", (err, re) => {
      if (err) {
        console.log("Error executing query", err.stack);
      } else {
        const result = re.rows;
        console.log(result);
        res.render("index.ejs", {
          listTitle: "Today",
          listItems: result,
        });
      }
    });
  } catch (error) {
    console.error("Error in the main route", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items(title) VALUES($1)", [item]);
  } catch (error) {
    console.error("Error in the main route", error);
    res.status(500).send("Internal Server Error");
  }
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const edited_item = req.body.updatedItemTitle;
  const edited_id = req.body.updatedItemId;
  console.log(edited_id);
  try {
    await db.query("UPDATE items SET title=$1 WHERE id=$2", [
      edited_item,
      edited_id,
    ]);
  } catch (error) {
    console.error("Error in the main route", error);
    res.status(500).send("Internal Server Error");
  }
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const deleted_id = req.body.deleteItemId;
  try {
    db.query("DELETE FROM items WHERE id=$1", [deleted_id]);
  } catch (error) {
    console.error("Error in the main route", error);
    res.status(500).send("Internal Server Error");
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
