module Chassis.Widgets {

    export function createFragment(htmlString: string) {
        var fragment = document.createDocumentFragment(),
            temp = document.createElement("div");
        temp.innerHTML = htmlString;
        while (temp.firstChild) {
            fragment.appendChild(temp.firstChild);
        }
        return fragment;
    }

    export function Version() {
        return "0.0.1";
    }

}

export = Chassis.Widgets;
