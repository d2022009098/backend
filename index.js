const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

//Inicialização e Middlewares
const app = express();
// app.use(function(req, res, next){
//   res.setHeader('Access-Control-Allow-Origin', '*')
//   next()
// })
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

//Verifica se é posível acessar o bd
var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
  if (err) {
    return console.error("Não foi possível conectar ao banco.", err);
  }
  client.query("SELECT NOW()", function (err, result) {
    if (err) {
      return console.error("Erro ao executar a query.", err);
    }
    console.log(result.rows[0]);
  });
});

//Verifica a disponibilidade do servidor
app.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok – Servidor disponível.");
});

//Verifica a porta
app.listen(config.port, () =>
  console.log("Servidor funcionando na porta " + config.port)
);

//rota get CadastroVaga
app.get("/vagas", (req, res) => {
  try {
    client.query("SELECT * FROM CadastroVaga", function (err, result) {
      if (err) {
        return console.error("Erro ao executar a qry de SELECT", err);
      }
      res.send(result.rows);
      console.log("Chamou get CadastroVaga");
    });
  } catch (error) {
    console.log(error);
  }
});

//rota post CadastroVaga
app.post("/vagas", (req, res) => {
  try {
    console.log("Chamou post", req.body);
    const { vaga, hobbie, nome, valor } = req.body;
    client.query(
      "INSERT INTO CadastroVaga (vaga, hobbie, nome, valor) VALUES ($1, $2, $3, $4) RETURNING * ",
      [vaga, hobbie, nome, valor],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de INSERT", err);
        }
        const { id } = result.rows[0];
        res.setHeader("id", `${id}`);
        res.status(201).json(result.rows[0]);
        console.log(result);
      }
    );
  } catch (erro) {
    console.error(erro);
  }
});

//rota delete CadastroVaga
app.delete("/vagas/:id", (req, res) => {
  try {
    console.log("Chamou delete /:id " + req.params.id);
    const id = req.params.id;
    client.query(
      "DELETE FROM CadastroVaga WHERE id = $1",
      [id],
      function (err, result) {
        if (err) {
          return console.error("Erro ao executar a qry de DELETE", err);
        } else {
          if (result.rowCount == 0) {
            res.status(400).json({ info: "Registro não encontrado." });
          } else {
            res.status(200).json({ info: `Registro excluído. Código: ${id}` });
          }
        }
        console.log(result);
      }
    );
  } catch (error) {
    console.log(error);
  }
});
module.exports = app; 

