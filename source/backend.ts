//var debug = require("debug")("chassis-core");
import * as Sequelize from "sequelize";
import * as http from "http";

import * as server from "./server";
import * as models from "./models";

server.set("port", process.env.PORT || 3000);

var env = process.env.NODE_ENV || "development";
//var config = require("../../config.json")[env];

var config: any = {
  dialect: "sqlite",
  //storage: "./db.development.sqlite",
  storage: ":memory:",
};

var sequelize = new (<any>Sequelize)(
  config.database,
  config.username,
  config.password,
  config
);
var domainModel = models.getCoreModels(sequelize);

console.log(JSON.stringify(domainModel));

server.set("chassis_models", domainModel);

var _instance: http.Server;
var _readyListner: (instance: http.Server) => void;
function onReady(readyListner: (instance: http.Server) => void) {
  _readyListner = readyListner;
  !!_instance && _readyListner(_instance);
}

_instance = server.listen(server.get("port"), () => {
  console.log("Express server listening on port " + _instance.address().port);
  !!_readyListner && _readyListner(_instance);
});

export = {
  server: server,
  onReady: onReady,
};
