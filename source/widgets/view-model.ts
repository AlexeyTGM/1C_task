import * as superagent from "superagent";
import * as ko from "knockout";

import * as Utils from "../utils";
import * as Models from "../models";

require("./property-grid");

module Chassis {

    export class ViewModel implements Utils.IActionProvider {
        protected _objectDescriptor = ko.observable<Models.IObjectDescriptor>();

        protected _onViewReady() {
            this.ready(true);
        }

        constructor(public url: string) {
            superagent.get(url).end((err, res) => {
                this._objectDescriptor(res.body.objectDescriptor);
                this.data(Utils.fromJS(res.body.data, res.body.objectDescriptor));
                this._onViewReady();
            });
        }
        templateName = "c-empty-view";
        data = ko.observable<any>();
        actions = ko.observableArray<Utils.IAction>();
        ready = ko.observable<boolean>();
        get type() {
            return this._objectDescriptor().name;
        }
        get visibleProperties() {
            var objectDescriptor = this._objectDescriptor();
            if(!!objectDescriptor) {
                return objectDescriptor.PropertyDescriptors.filter(property => !!property.displayName);
            }
            return [];
        }
    }

    export class ListViewModel extends ViewModel {
        protected _onViewReady() {
            super._onViewReady();
            this.actions.push({
                enabled: ko.observable(true),
                text: ko.observable("New"),
                image: ko.observable("🗎"),
                action: () => {
                    location.hash = this.getDetailUrl();
                }
            });
        }
        constructor(url: string) {
            super(url);
            var urlComponents = url.split("/");
            if(urlComponents.length === 5) {
                this.entityName = urlComponents[4];
                this.foreignKey = urlComponents[3];
                this.ownerEntityName = urlComponents[2];
            }
            else {
                this.entityName = urlComponents[2];
            }
        }
        entityName: string;
        ownerEntityName: string;
        foreignKey: string;
        templateName = "c-list-view";
        getDetailUrl(id?: any | KnockoutObservable<any>) {
            if(!id) {
                if(!this.foreignKey) {
                    return "#detail/" + this._objectDescriptor().name + "/new";
                }
                return "#detail/" + this._objectDescriptor().name + "/new/#" + this.ownerEntityName + "Id/" + this.foreignKey;
            }
            return "#detail/" + this._objectDescriptor().name + "/" + ko.unwrap(id);
        }
    }

    export class DetailViewModel extends ViewModel {
        protected _onViewReady() {
            super._onViewReady();
            this.actions.push({
                enabled: ko.observable(true),
                text: ko.observable("Save"),
                image: ko.observable("🖫"),
                action: () => {
                    superagent
                        .put("/data/" + this._objectDescriptor().name)
                        .send(ko.toJS(this.data()))
                        .end((err, res) => {
                            if(!!err) {
                                debugger;
                            }
                        });
                }
            });
            this.actions.push({
                enabled: ko.observable(true),
                text: ko.observable("Delete"),
                image: ko.observable("🗑"),
                action: () => {
                    superagent
                        .delete(this.url)
                        .end((err, res) => {
                            if(!!err) {
                                debugger;
                            }
                        });
                }
            });
        }
        constructor(url: string) {
            super(url);
            var urlComponents = url.split("#");
            if(urlComponents.length > 1) {
                var defaults = urlComponents[1].split("/");
                for(var i = 0; i < defaults.length; i +=2) {
                    this.initialValues[defaults[i]] = defaults[i+1];
                }
            }
            ko.computed(() => {
                var val = this.data();
                if(!!val) {
                    Object.keys(this.initialValues).forEach(propertyName => {
                        if(ko.isWriteableObservable(val[propertyName])) {
                            val[propertyName](this.initialValues(propertyName));
                        }
                    });
                }
            });
        }
        initialValues: any = {};
        templateName = "c-detail-view";
    }

    export var viewModelsMap = {
        list: ListViewModel,
        detail: DetailViewModel
    };
}

export = Chassis;
