import * as Express from "express";
import { IApplicationModels } from "../models";

var router = Express.Router();

router.get("/", function (req: Express.Request, res: Express.Response) {
  var application = {
    title: "New Application",
    version: "1.0",
    MenuItems: [
      {
        text: "Configuration",
        items: [
          { text: "Objects", hash: "#list/ObjectDescriptor" },
          { text: "Properties", hash: "#list/PropertyDescriptor" },
        ],
      },
      { text: "Users", hash: "#list/User" },
    ],
  };
  console.log("Application: " + JSON.stringify(application));
  console.log("Created: " + "created");
  res.render("index", {
    title: application.title,
    menuItems: application.MenuItems,
  });
});

router.get("/metadata", function (req, res) {
  var models: IApplicationModels = req.app.get("chassis_models");
  res.setHeader("Content-Type", "application/json");
  res.json(models.metadata.concat(models.metadata));
});

export = router;
