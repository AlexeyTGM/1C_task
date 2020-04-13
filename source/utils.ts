import * as ko from "knockout";
import { IObjectDescriptor } from "./models"

module Chassis {

    export interface IAction {
        enabled: KnockoutObservable<boolean>;
        text: KnockoutObservable<string>;
        image: KnockoutObservable<string>;
        action: () => void;
    }

    export interface IActionProvider {
        actions: KnockoutObservableArray<IAction>;
    }

    export function createObject(objectDescriptor: IObjectDescriptor) {
        var result: any = {};
        objectDescriptor.PropertyDescriptors.forEach(propertyDescriptor => {
            var typeDescriptor = parseType(propertyDescriptor.type);
            var propertyValue: any = typeDescriptor.isSimple ? ko.observable() : null;
            if(!propertyValue) {
                // TODO: complex types
            }
            result[propertyDescriptor.name] = propertyValue;
        });
        return result;
    }

    export function fromJS(jsObject: any, objectDescriptor?: IObjectDescriptor) {
        var result: any = jsObject;

        if(Array.isArray(jsObject)) {
            result = jsObject.map(item => fromJS(item, objectDescriptor));
        }
        else if(!!jsObject && typeof jsObject === "object") {
            result = {};
            Object.keys(jsObject).forEach(propertyName => {
                var koValue;
                var propertyValue = jsObject[propertyName];
                if(Array.isArray(propertyValue)) {
                    koValue = ko.observableArray(fromJS(propertyValue));
                }
                else if(!!propertyValue && typeof propertyValue === "object") {
                    koValue = fromJS(propertyValue);
                }
                else {
                    koValue = ko.observable(propertyValue);
                }
                result[propertyName] = koValue;
            });
        } else if(!jsObject && !!objectDescriptor) {
            result = createObject(objectDescriptor);
        }

        return result;
    }

    var dataTypes = [ "STRING", "TEXT", "INTEGER", "DOUBLE", "DECIMAL", "BOOLEAN", "TIME", "DATE", "ENUM", "VIRTUAL" ];

    export function isSimpleType(typeStr: string) {
        return dataTypes.indexOf(typeStr) !== -1;
    }

    export interface ITypeDescriptor {
        type: string,
        isSimple: boolean,
        values: any
    }

    export function parseType(typeStr: string): ITypeDescriptor {
        if(!isSimpleType(typeStr)) {
            if(typeStr.indexOf("[") === 0 && typeStr.indexOf("]") === typeStr.length - 1) {
                if(typeStr.indexOf(",") !== -1) {
                    return {
                        type: "STRING", // "ENUM"
                        isSimple: true,
                        values: JSON.parse(typeStr)
                    }
                }
                else {
                    return {
                        type: typeStr.substring(1, typeStr.length - 1),
                        isSimple: false,
                        values: []
                    }
                }
            }
            else {
                return {
                    type: typeStr,
                    isSimple: false,
                    values: null
                }
            }
        }
        return {
            type: typeStr,
            isSimple: true,
            values: null
        };
    }
}

export = Chassis;
