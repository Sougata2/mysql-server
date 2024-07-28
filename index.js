const mysql = require("mysql2");
const express = require("express");
const app = express();

const PORT = 8000;

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sougata",
  database: "rizon",
});

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
    return;
  }
  console.log("connected as id " + connection.threadId);
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

app.use(express.json());

app.get("/api/data", function (req, res) {
  connection.query("select * from dashboard_tbl", (error, results, fields) => {
    return res.json({ status: "success", data: results });
  });
});

app.get("/api/data/:id", function (req, res) {
  const sql = "select * from dashboard_tbl where menuid = ?";
  const values = [req.params.id];
  connection.execute(sql, values, (error, results, fields) => {
    if (error) return res.json({ message: "fail", error });
    return res.json({ message: "success", data: results[0] });
  });
});

app.post("/api/data", function (req, res) {
  connection.query(
    "select menuid as lastid from dashboard_tbl order by menuid desc limit 1;",
    (error, results) => {
      const newid = results[0].lastid + 1;
      const newMenu = { menuid: newid, ...req.body };
      const sql = `
      insert into dashboard_tbl(menuid, menu_heading, menu_name, menu_under, enable_yn) 
      values(?, ?, ?, ?, ?)
      `;
      const values = Object.values(newMenu);
      connection.execute(sql, values, (error, results, fields) => {
        if (error) return res.json({ message: "fail", error });
        return res.json({ message: "success", data: newMenu });
      });
    }
  );
});

app.patch("/api/data/:id", function (req, res) {
  let sql = "update dashboard_tbl set ";
  sql += req.body.menuid ? `menuid=?,` : "";
  sql += req.body.menu_heading ? `menu_heading=?,` : "";
  sql += req.body.menu_name ? `menu_name=?,` : "";
  sql += req.body.menu_under ? `menu_under=?,` : "";
  sql += req.body.enable_yn ? `enable_yn=?,` : "";
  sql = sql.slice(0, sql.length - 1) + " " + `where menuid=?;`;
  const values = [
    ...Object.values(req.body).filter((value) => value != ""),
    req.params.id * 1,
  ];
  connection.execute(sql, values, (error) => {
    if (error) return res.json({ message: "fail", error });
    return res.json({ message: "success", data: req.body });
  });
});

app.delete("/api/data/:id", function (req, res) {
  const sql = `delete from dashboard_tbl where menuid = ?`;
  const values = [req.params.id];
  connection.execute(sql, values, (error) => {
    if (error) return res.json({ message: "fail", error });
    return res.json({ message: "success" });
  });
});

app.listen(PORT, () => {
  console.log("Listening to port", PORT);
});
