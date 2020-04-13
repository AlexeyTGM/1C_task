import * as Express from "express";
import * as Sequelize from "sequelize";
import * as Models from "../models";

var router = Express.Router();

function writeJson(res: Express.Response, object) {
  res.setHeader("Content-Type", "application/json");
  res.json(object);
}

router.get("/:type", (req, res, next) => {
  var type = req.params.type;
  var models: Models.IApplicationModels = req.app.get("chassis_models");
  console.log(JSON.stringify(models));
  var objectDescriptor = models.metadata.filter(
    (od) => od.name === req.params.type
  )[0];
  writeJson(res, { data: [], objectDescriptor: objectDescriptor });
});

router.get("/:type/:id", (req, res, next) => {
  var type = req.params.type;
  var models: Models.IApplicationModels = req.app.get("chassis_models");
  console.log(JSON.stringify(models));
  var objectDescriptor = models.metadata.filter(
    (od) => od.name === req.params.type
  )[0];
  writeJson(res, { data: {}, objectDescriptor: objectDescriptor });
});

router.get("/:type/:id/:property", (req, res, next) => {
  // writeJson(res, {
  //   data: objects,
  //   objectDescriptor: appModels.metadata.filter(
  //     (od) => od.name === refType
  //   )[0],
  // });
});

router.delete("/:type/:id", (req, res, next) => {
  writeJson(res, { deleted: true });
});

router.put("/:type", function (req: Express.Request, res, next) {
  // writeJson(res, { data: object, objectDescriptor: objectDescriptor });
});

export = router;
