'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CenterCalculator = function () {
  function CenterCalculator(category, width, height, margin, innerWidth, themenbereich_1Filter) {
    _classCallCheck(this, CenterCalculator);

    this.category = category;
    this.width = width;
    this.height = height;
    this.margin = margin;
    this.innerWidth = innerWidth;
    this.themenbereich_1Filter = themenbereich_1Filter;
  }

  _createClass(CenterCalculator, [{
    key: 'calculateCenters',
    value: function calculateCenters(nodes) {
      // check if user defined centers in CENTERS variable in config
      if (typeof CENTERS[this.category] !== "undefined") {
        return this.fixedCenters(nodes);
      } else {
        var centers = this.calculateNumberOfCirclesInCluster(nodes);
        centers = this.sort(centers);
        centers = this.calculateCoordinates(centers);
        return centers;
      }
    }
  }, {
    key: 'fixedCenters',


    // if centers are fixed in config, this function calculates coordinates
    value: function fixedCenters(nodes) {
      var _this = this;

      var centers = CENTERS[this.category];
      centers.forEach(function (d, i) {
        d.index = i;
        d.x = d.center * _this.width;
        d.y = _this.height / 2;
      });
      return centers;
    }
  }, {
    key: 'calculateNumberOfCirclesInCluster',
    value: function calculateNumberOfCirclesInCluster(nodes) {
      // get unique values of category and calculate size of expected area
      var centers = [];
      var self = this;
      nodes.forEach(function (d, i) {
        /*
        * If bubbles are split by thema_1 we only want to see those centers and labels for thema_1 with correct Themenbereich 1.
        * Becaus the filter consideres thema_1 AND thema_2, we also receive nodes with a different Themenbereich 1. (In the case
        * (of "Themenbereich 2", this is same as categoryFilter)
        */
        var found = false;
        var category = void 0;
        // if grouped by thema_1, allow the creation of new centers from matching thema_2
        if (self.category === 'thema_1') {
          self.themenbereich_1Filter !== 'all' && self.themenbereich_1Filter !== d.themenbereich_1 && self.themenbereich_1Filter === d.themenbereich_thema_2 ? category = 'thema_2' : category = self.category;
          centers.forEach(function (c) {
            if (c.title === d[category]) {
              c.size++;
              found = true;
            }
          });
          if (!found) {
            centers.push({ title: d[category], size: 1 });
          }
        }
        // if grouped by something different than thema_1 let the center always be self.category
        else {
            category = self.category;
            centers.forEach(function (c) {
              if (c.title === d[category]) {
                c.size++;
                found = true;
              }
            });
            if (!found) {
              centers.push({ title: d[category], size: 1 });
            }
          }
      });
      return centers;
    }

    // sort ascending or descending, based on given category and cluster size

  }, {
    key: 'sort',
    value: function sort(centers) {
      if (this.category === 'jahr') {
        centers.sort(function (a, b) {
          return a.title - b.title;
        });
        // Sort descending on category "jahr"
        return centers.reverse();
      } else {
        centers.sort(function (a, b) {
          var deltaSize = b.size - a.size;
          // order by size
          if (deltaSize !== 0) {
            return deltaSize;
            // if size is equal, order by title
          } else {
            return a.title.localeCompare(b.title);
          }
        });
        return centers;
      }
    }

    // calculates coordinates for centers based on sort order

  }, {
    key: 'calculateCoordinates',
    value: function calculateCoordinates(centers) {
      var self = this;
      if (centers.length === 1) {
        centers[0].x = self.width / 2;
        centers[0].y = self.height / 2;
        // distance between center 1 and center 2 was too large. So we need a special case cases with only two centers
      } else if (centers.length === 2) {
        centers[0].x = self.width / 4;
        centers[0].y = self.height / 2;
        centers[1].x = self.width / 4 * 3;
        centers[1].y = self.height / 2;
      } else {
        centers.forEach(function (d, i) {
          var x = void 0,
              y = void 0;
          centers[i].secondRow = false;
          // we want to add a second row if we have more than 6 groups
          if (centers.length > 6) {
            // first row
            if (i < Math.ceil(centers.length / 2)) {
              y = self.height / 3;
              x = self.margin.left + i / Math.ceil(centers.length / 2 - 1) * self.innerWidth;
              // second row
            } else {
              centers[i].secondRow = true;
              y = self.height * 2 / 3;
              x = self.margin.left + (i - Math.ceil(centers.length / 2)) / Math.ceil((centers.length - 1) / 2) * self.innerWidth;
            }
          } else {
            x = self.margin.left + i * self.innerWidth / (centers.length - 1);
            y = self.height / 2;
          }
          centers[i].x = x;
          centers[i].y = y;
          centers[i].index = i;
        });
      }
      return centers;
    }
  }]);

  return CenterCalculator;
}();