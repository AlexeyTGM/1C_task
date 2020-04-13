import "./tree-view.scss";

import * as ko from "knockout";
import Utils = require("./utils");

module Chassis.Widgets {
  export class TreeViewItem {
    constructor(
      public itemData,
      clickHandler: (item: TreeViewItem) => void,
      public level: number = 0
    ) {
      this.onItemClick = clickHandler;
      this.text(itemData.text);
      this.items(
        (itemData.items || []).map((item) => {
          return new TreeViewItem(item, clickHandler, this.level + 1);
        })
      );
    }
    get hasItems() {
      return this.items().length > 0;
    }
    text = ko.observable();
    items = ko.observableArray();

    collapsed = ko.observable(true);
    itemClick = (item: TreeViewItem) => {
      if (item.hasItems) {
        item.collapsed(!item.collapsed());
      } else {
        if (!!this.onItemClick) {
          this.onItemClick(item);
        }
      }
    };
    onItemClick: (item: TreeViewItem) => void;
  }

  var template = require("text-loader!./tree-view.html");
  document.body.insertBefore(
    Utils.createFragment(template),
    document.body.childNodes[0]
  );

  ko.components.register("c-tree-view", {
    viewModel: {
      createViewModel: (params, componentInfo) => {
        //$(componentInfo.element);
        return new TreeViewItem(params.root, params.clickHandler);
      },
    },
    template: { element: "c-tree-view" },
  });
}

export = Chassis.Widgets;
