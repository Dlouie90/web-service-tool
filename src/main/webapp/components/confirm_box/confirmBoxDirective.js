/**
 * Created by shay on 10/18/16.
 */

angular.module("WebserviceApp.Directives")
/**
 * A modal will be dropped into view and ask the user to confirm their decision.
 * A function (updateFn) can be called when an confirmation is made.
 *
 * How to use this?
 * modal: http://getbootstrap.com/javascript/#modals
 *
 * target: the field should be the same as the button's data-target".reset" but without the period
 * this tell bootstrap that you want the button to be "linked" a specific modal
 *
 * title/content: the text the modal will display
 *
 * updateFn: the function to be executed when the users confirm their decision.
 */
    .directive("confirmBox", function() {
        return {
            restrict: "E",
            scope: {target: "@", title: "@", content: "@", updateFn: '&'},
            templateUrl: "components/confirm_box/confirm-box.html"
        }
    });
