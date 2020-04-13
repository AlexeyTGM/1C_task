"use strict";

import * as Sequelize from "sequelize";

import { parseType } from "../utils";

module Chassis {
  export interface IModelsHolder {
    [index: string]: Sequelize.Model<any, any>;
  }

  export interface IPropertyDescriptor {
    name: string;
    displayName: string;
    type: string;
  }

  export interface IObjectDescriptor {
    name: string;
    PropertyDescriptors: Array<IPropertyDescriptor>;
  }

  export interface IApplicationModels {
    db: IModelsHolder;
    metadata: Array<IObjectDescriptor>;
  }

  // TODO: move to global utils
  var dataTypes = [
    "STRING",
    "TEXT",
    "INTEGER",
    "DOUBLE",
    "DECIMAL",
    "BOOLEAN",
    "TIME",
    "DATE",
    "ENUM",
    "VIRTUAL",
  ];

  export var metadata = [
    {
      name: "Application",
      PropertyDescriptors: [
        { name: "title", displayName: "Title", type: "STRING" },
        { name: "version", displayName: "Version", type: "STRING" },
        { name: "MenuItems", displayName: "Menu Items", type: "[MenuItem]" },
      ],
    },
    {
      name: "MenuItem",
      PropertyDescriptors: [
        { name: "title", displayName: "Title", type: "STRING" },
        { name: "hash", displayName: "Hash", type: "STRING" },
        {
          name: "ApplicationId",
          displayName: "Application",
          type: "Application",
        },
      ],
    },
    {
      name: "User",
      PropertyDescriptors: [
        { name: "username", displayName: "User Name", type: "STRING" },
        { name: "password", displayName: "Password", type: "STRING" },
        { name: "name", displayName: "Name", type: "STRING" },
        { name: "surname", displayName: "Surname", type: "STRING" },
        { name: "contacts", displayName: "Contacts", type: "STRING" },
        { name: "phone", displayName: "Phone", type: "STRING" },
        { name: "status", displayName: "Status", type: "STRING" },
      ],
    },
    {
      name: "PropertyDescriptor",
      PropertyDescriptors: [
        { name: "name", displayName: "Name", type: "STRING" },
        { name: "displayName", displayName: "Display Name", type: "STRING" },
        {
          name: "type",
          displayName: "Type",
          type: '[ "number", "STRING", "collection", "reference" ]',
        },
        {
          name: "ObjectDescriptorId",
          displayName: "Object Descriptor",
          type: "ObjectDescriptor",
        },
      ],
    },
    {
      name: "ObjectDescriptor",
      PropertyDescriptors: [
        { name: "name", displayName: "Name", type: "STRING" },
        { name: "displayName", displayName: "Display Name", type: "STRING" },
        {
          name: "PropertyDescriptors",
          displayName: "Property Descriptors",
          type: "[PropertyDescriptor]",
        },
      ],
    },
  ];

  export function fillDefinitions(
    db,
    metadata: Array<IObjectDescriptor>,
    sequelize: Sequelize.Sequelize
  ) {
    metadata.forEach((item) => {
      var simpleProperties: any = {};
      (item.PropertyDescriptors || [])
        .filter((descriptor) => {
          var typeDescriptor = parseType(descriptor.type);
          return (
            dataTypes.indexOf(typeDescriptor.type) !== -1 && !!descriptor.name
          );
        })
        .forEach((descriptor) => {
          var typeDescriptor = parseType(descriptor.type);
          simpleProperties[descriptor.name] = Sequelize[typeDescriptor.type];
        });

      var classMethods: any = {
        associate: (models) => {
          var currentItem = item;
          (currentItem.PropertyDescriptors || [])
            .filter(
              (descriptor) =>
                dataTypes.indexOf(descriptor.type) === -1 && !!descriptor.name
            )
            .forEach((descriptor) => {
              if (descriptor.type.indexOf("[") === 0) {
                var modelName = descriptor.type.substring(
                  1,
                  descriptor.type.length - 1
                );
                // console.log("modelName: " + modelName);
                // console.log("currentItem.name: " + currentItem.name);
                if (models[modelName]) {
                  models[currentItem.name].hasMany(models[modelName]);
                }
              } else {
                models[currentItem.name].belongsTo(models[descriptor.type], {
                  onDelete: "CASCADE",
                  foreignKey: {
                    allowNull: false,
                  },
                });
              }
            });
        },
      };
      db[item.name] = sequelize.define(item.name, simpleProperties, <any>{
        classMethods: classMethods,
      });
    });

    // Object.keys(db).forEach((modelName) => {
    //   if ("associate" in db[modelName]) {
    //     db[modelName].associate(db);
    //   }
    // });

    console.log("Registered models: " + Object.keys(db));
  }

  export function getCoreModels(
    sequelize: Sequelize.Sequelize
  ): IApplicationModels {
    var db: any = {};

    fillDefinitions(db, metadata, sequelize);

    return {
      db: db,
      metadata: [].concat(metadata),
    };
  }
}

export = Chassis;
