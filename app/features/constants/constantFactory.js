/**
 * This factory contains all the constants used throughout the project
 */
angular.module("WebserviceApp.Services")
    .factory("ConstantFactory", function () {
        return {
            ACTIVE_CSS      : "active",
            ACTIVE_BTN_CSS  : "btn-primary",
            ACTIVE_PANEL_CSS: "panel-success",

            PROJECT_PER_PAGE: 3,

            DEFAULT_BTN_CSS : "btn-default",
            CANCEL_BTN_CSS  : "btn-danger",

            SPIN_ICON       : "fa-spin"
        }
    });