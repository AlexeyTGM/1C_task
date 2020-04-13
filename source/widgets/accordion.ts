import "./accordion.scss";
import * as ko from "knockout";

import Utils = require("./utils");

module Chassis.Widgets {
  class Accordion {
    constructor(public title, public data, public contentTemplate) {}

    open = ko.observable<boolean>();
    toggle = () => this.open(!this.open());
  }

  var template = require("text-loader!./accordion.html");
  document.body.insertBefore(
    Utils.createFragment(template),
    document.body.childNodes[0]
  );

  ko.components.register("c-accordion", {
    viewModel: {
      createViewModel: (params, componentInfo) => {
        return new Accordion(params.title, params.data, params.contentTemplate);
      },
    },
    template: { element: "c-accordion" },
  });
}

export = Chassis;
