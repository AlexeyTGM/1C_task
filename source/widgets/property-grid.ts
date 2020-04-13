import * as ko from "knockout";
import * as superagent from "superagent";

import Utils = require("./utils");
import GlobalUtils = require("../utils");
import * as Models from "../models";

require("./accordion");

module Chassis {
  export interface IEditorConstructor {
    new (
      model: any,
      type: string,
      propertyDescriptor: Models.IPropertyDescriptor
    );
  }

  export class Editor {
    constructor(
      public model: any,
      private type: string,
      private propertyDescriptor: Models.IPropertyDescriptor
    ) {
      this.value = ko.computed({
        read: () => ko.unwrap(model[propertyDescriptor.name]),
        write: (val) => {
          if (ko.isWriteableObservable(model[propertyDescriptor.name])) {
            model[propertyDescriptor.name](val);
          } else {
            model[propertyDescriptor.name] = val;
          }
        },
      });
    }

    value: KnockoutObservable<any>;

    get title() {
      return this.propertyDescriptor.displayName;
    }

    templateName = "c-text-editor";
  }

  export class ViewEditor extends Editor {
    constructor(
      model: any,
      type: string,
      propertyDescriptor: Models.IPropertyDescriptor
    ) {
      super(model, type, propertyDescriptor);
      this.value = ko.computed(() => {
        return (
          "#list/" +
          type +
          "/" +
          ko.unwrap(model.id) +
          "/" +
          propertyDescriptor.name
        );
      });
    }

    templateName = "c-view-editor";
  }

  export class LookupEditor extends Editor {
    constructor(
      model: any,
      type: string,
      propertyDescriptor: Models.IPropertyDescriptor
    ) {
      super(model, type, propertyDescriptor);
      this.options = {
        items: ko.observableArray(),
        text: ko.observable(),
      };
      var typeDescriptor = GlobalUtils.parseType(propertyDescriptor.type);
      superagent.get("data/" + typeDescriptor.type).end((err, res) => {
        this.options.items(res.body.data);
        var stringPropertyDescriptor = res.body.objectDescriptor.PropertyDescriptors.filter(
          (pd) => pd.type === "STRING"
        )[0];
        this.options.text(stringPropertyDescriptor.name);
      });
    }
    options: any;
    templateName = "c-lookup-editor";
  }

  export class SimpleLookupEditor extends Editor {
    constructor(
      model: any,
      type: string,
      propertyDescriptor: Models.IPropertyDescriptor
    ) {
      super(model, type, propertyDescriptor);
      this.options = {
        items: ko.observableArray(),
      };
      var typeDescriptor = GlobalUtils.parseType(propertyDescriptor.type);
      this.options.items(typeDescriptor.values);
    }
    options: any;
    templateName = "c-lookup-editor-simple";
  }

  export var editorsMap: { [key: string]: IEditorConstructor } = {};

  export class PropertyGrid {
    constructor(
      target: KnockoutObservable<any>,
      type: string,
      properties: Array<Models.IPropertyDescriptor>
    ) {
      ko.computed(() => {
        var targetValue = target();
        if (!!targetValue) {
          this.editors(
            ko.unwrap(properties).map((propertyDescriptor) => {
              var editorType = PropertyGrid.getEditorType(propertyDescriptor);
              return new editorType(targetValue, type, propertyDescriptor);
            })
          );
        }
      });
    }
    static getEditorType(
      propertyDescriptor: Models.IPropertyDescriptor
    ): IEditorConstructor {
      var typeDescriptor = GlobalUtils.parseType(propertyDescriptor.type);
      if (!typeDescriptor.isSimple) {
        if (Array.isArray(typeDescriptor.values)) {
          return ViewEditor;
        }
        return LookupEditor;
      } else if (Array.isArray(typeDescriptor.values)) {
        return SimpleLookupEditor;
      }
      return editorsMap[propertyDescriptor.type] || Editor;
    }
    editors = ko.observableArray<Editor>();
  }

  var template = require("text-loader!./property-grid.html");
  document.body.insertBefore(
    Utils.createFragment(template),
    document.body.childNodes[0]
  );

  ko.components.register("c-property-grid", {
    viewModel: {
      createViewModel: (params, componentInfo) => {
        return new PropertyGrid(
          params.target,
          ko.unwrap(params.type),
          params.properties
        );
      },
    },
    template: { element: "c-property-grid" },
  });
}

export = Chassis;
