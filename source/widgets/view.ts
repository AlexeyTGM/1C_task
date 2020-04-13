import "./view.scss";

import * as ko from "knockout";
import Utils = require("./utils");
import { viewModelsMap } from "./view-model";

module Chassis.Widgets {
  export class View {
    private _currentView = ko.observable();

    constructor(
      private _url: KnockoutObservable<string>,
      private _actionsPresenter
    ) {}

    viewModel = ko.computed(() => {
      var regExp = /#([-0-9A-Za-z]+)(\/(.+))?/,
        match = regExp.exec(this._url() || "#");

      !!this._actionsPresenter &&
        this._actionsPresenter.unregisterActionProvider(this._currentView());

      if (!!match) {
        var viewType = match[1],
          typeUrl = match[3];
        var viewConstructor = viewModelsMap[viewType];

        if (!!viewConstructor) {
          this._currentView(new viewConstructor("/data/" + typeUrl));
          !!this._actionsPresenter &&
            this._actionsPresenter.registerActionProvider(this._currentView());
          return this._currentView();
        }
      }
      return {
        templateName: "c-empty-view",
      };
    });
  }

  var template = require("text-loader!./view.html");
  document.body.insertBefore(
    Utils.createFragment(template),
    document.body.childNodes[0]
  );

  ko.components.register("c-view", {
    viewModel: {
      createViewModel: (params, componentInfo) => {
        return new View(params.url, params.actionsPresenter);
      },
    },
    template: { element: "c-view" },
  });
}

export = Chassis.Widgets;
