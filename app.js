import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });



const app = express();
const port =  3000;


const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "inventorydb",
  password: "12345",
  port: 5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {

  const search = req.query.search || "";

  const result = await db.query(
    "SELECT * FROM products WHERE name ILIKE $1 ORDER BY id",
    [`%${search}%`]
  );

  res.render("home", {
    products: result.rows,
    search
  });

});


app.get("/add", (req, res) => {
  res.render("add");
});

app.post("/add", async (req, res) => {
  await db.query(
    "INSERT INTO products(name,quantity,price) VALUES($1,$2,$3)",
    [
      req.body.name,
      req.body.quantity,
      req.body.price
    ]
  );

  res.redirect("/");
});

app.get("/edit/:id", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM products WHERE id=$1",
    [req.params.id]
  );

  res.render("edit", {
    product: result.rows[0]
  });
});

app.post("/edit/:id", async (req, res) => {
  await db.query(
    "UPDATE products SET name=$1, quantity=$2, price=$3 WHERE id=$4",
    [
      req.body.name,
      req.body.quantity,
      req.body.price,
      req.params.id
    ]
  );

  res.redirect("/");
});

app.get("/delete/:id", async (req, res) => {
  await db.query(
    "DELETE FROM products WHERE id=$1",
    [req.params.id]
  );

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});