import * as superagent from "superagent";
import * as ko from "knockout";

import * as Utils from "./utils";

require("./widgets/tree-view");
require("./widgets/view");

import "./application.scss";

module Chassis {
  export class Application {
    private _actionProviders = ko.observableArray<Utils.IActionProvider>();

    constructor() {
      // this.menu = {
      //   items: [
      //     {
      //       text: "Configuration",
      //       items: [
      //         { text: "Objects", hash: "#list/ObjectDescriptor" },
      //         { text: "Properties", hash: "#list/PropertyDescriptor" },
      //       ],
      //     },
      //     { text: "Users", hash: "#list/User" },
      //   ],
      // };

      window.onhashchange = this.navigate;
    }

    menu;
    hash = ko.observable<string>();
    navigate = (ev: HashChangeEvent) => {
      var newHash = location.hash;
      if (!newHash) {
        this.menuItemClick({ itemData: this.menu.items[0] });
      } else {
        this.hash(newHash);
      }
    };

    menuItemClick = (item: any) => {
      location.hash = item.itemData.hash;
    };

    start(appRoot) {
      ko.applyBindings(this, appRoot);
      this.navigate(null);
    }

    registerActionProvider(actionProvider: Utils.IActionProvider) {
      this._actionProviders.push(actionProvider);
    }
    unregisterActionProvider(actionProvider: Utils.IActionProvider) {
      this._actionProviders.remove(actionProvider);
    }
    actions = ko.computed<Utils.IAction[]>(() => {
      return this._actionProviders().reduce(
        (actions, actionProvider) => actions.concat(actionProvider.actions()),
        <Utils.IAction[]>[]
      );
    });
  }
}

export = Chassis;
