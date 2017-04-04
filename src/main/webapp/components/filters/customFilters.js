/**
 * Created by shay on 10/12/16.
 */

angular.module("WebserviceApp.Filters", [])


// use to filter all non unique object based on a property name.
// returns a set of unique project.
    .filter("unique", function () {
        return function (data, propertyName) {
            if (angular.isArray(data) && angular.isString(propertyName)) {
                var results = [], keys = {};

                for (var i = 0; i < data.length; i++) {
                    var val = data[i][propertyName];

                    if (angular.isUndefined(keys[val])) {
                        keys[val] = true;
                        results.push(val);
                    }
                }
                return results;
            } else {
                return data;
            }
        }
    })


    // generate an array of "data" base on the indicated size, the current page.
    // if the size is 3, and we have "10" data, and we are currently on page 1,
    // then display the "data" in index 4, 5, 6.
    .filter("range", function ($filter) {
        return function (data, page, size) {

            if (angular.isArray(data) && angular.isNumber(page) && angular.isNumber(size)) {
                var start_index = (page - 1) * size;

                if (data.length < start_index) {
                    return [];
                } else {
                    return $filter("limitTo")(data.splice(start_index), size);
                }
            } else {
                return data;
            }
        }
    })


    // use to generate a list of numbers for pagination
    // if size is 3, and we have 10 "data", then this function will return a
    // a list of numbers (1-4). 3  "data" per page plus one with the reminder
    .filter("pageCount", function () {
        return function (data, size) {
            if (angular.isArray(data)) {
                var result = [];

                for (var i = 0; i < Math.ceil(data.length / size); i++) {
                    result.push(i);
                }

                return result;
            } else {
                return data;
            }
        }
    });