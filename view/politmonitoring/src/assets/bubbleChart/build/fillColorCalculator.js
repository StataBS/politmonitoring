"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FillColorCalculator = function () {
  function FillColorCalculator(useSubColors) {
    _classCallCheck(this, FillColorCalculator);

    this.useSubColors = useSubColors;
    this.subCategoryColors = {};
  }

  // calculates a color based on different inputs. darker is used for border => returns same color but a little bit darker
  // can be used for main categories or subcategories => useSubColors as object property


  _createClass(FillColorCalculator, [{
    key: "calculateColor",
    value: function calculateColor(themenbereich, thema_1, darker) {
      var finalColor = "";
      COLORS.forEach(function (color) {
        if (color.themenbereich === themenbereich) finalColor = color.color;
      });

      if (this.useSubColors) {
        finalColor = this.calculateSubcolor(finalColor, themenbereich, thema_1);
      }

      // make it darker if required
      if (darker) finalColor = d3.rgb(finalColor).darker();

      return finalColor;
    }
  }, {
    key: "calculateSubcolor",
    value: function calculateSubcolor(color, themenbereich, thema_1) {

      // count number of "thema_1" in every "themenbereich". it's possible to have multipe "themenbereiche" because filter
      // filters "themenbereich" and "thema_2"
      if (this.subCategoryColors.hasOwnProperty(themenbereich)) {
        if (this.subCategoryColors[themenbereich].indexOf(thema_1) === -1) {
          this.subCategoryColors[themenbereich].push(thema_1);
        }
      } else {
        this.subCategoryColors[themenbereich] = [thema_1];
      }

      // calculate lightness based on position of "thema_1" in array of "themenbereich". smallest lightness is 0.1,
      // then increasing 0.1 for each position in array
      var lightness = 0.3 + this.subCategoryColors[themenbereich].indexOf(thema_1) * 0.1;

      color = d3.hsl(color);
      var newColor = d3.hsl(color.h, color.s, lightness);
      // converte back to rgb
      return d3.rgb(newColor);
    }
  }]);

  return FillColorCalculator;
}();