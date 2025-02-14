/*	Copyright (c) 2018 Jean-Marc VIGLINO, 
  released under the CeCILL-B license (French BSD license)
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/

import ol_Overlay_Popup from 'ol-ext/overlay/Popup.js'
import ol_ext_element from 'ol-ext/util/element'

/**
 * A popup element to be displayed on a feature.
 * @constructor
 * @extends {ol_Overlay_Popup}
 * @fires show
 * @fires hide
 * @fires change
 * @param {Object} options Extend PopupFeatures options
 *  @param {import('./SelectMultiple').default} options.select Select control of the map
 * @api stable
 */
var ol_Overlay_PopupMultiple = class olOVerlayPopupMultiple extends ol_Overlay_Popup {
  constructor(options) {
    options = options || {};

    super(options);

    /**
     * @public
     * @type {SelectMultiple}
    */
    this.select = options.select
  }

  /** Show the popup on the map
   * @param {ol.coordinate|undefined} coordinate Position of the popup
   * @param {string|Element|Array<string|Element>} contents Contents of the popup
   * @param {string|Element|Array<string|Element>} features Corresponding features for contents
   * @param {string|Element|Array<string|Element>} count The count of the feature to display
   */
  show(coordinate, contents, features, count) {
    if (!(contents instanceof Array))
      contents = [contents];
    if (!(features instanceof Array))
      features = [features];
    this._contents = contents.slice();
    this._features = features;

    this._count = 1;
    // Set _count to count if given
    if (count && Number.isInteger(count) && 0 < count && count < this._contents.length + 1) {
      this._count = count
    }

    // Calculate html upon content values
    let content = contents[this._count - 1]
    var html = this._getHtml(content);
    if (html) {
      if (!this.element.classList.contains('ol-fixed'))
        this.hide();
      this.select.setIndex(this._count)
      this.select.setShownFeature(this._features[this._count - 1])
      super.show(coordinate, html);
    } else {
      this.hide();
    }
  }


  /**
 * @private
 */
  _getHtml(content) {
    var html = ol_ext_element.create('DIV', { className: 'ol-popupfeature' });
    
    // Counter
    if (this._contents.length > 1) {
      let div = ol_ext_element.create('DIV', { className: 'ol-count', parent: html });
      ol_ext_element.create('BUTTON', {
        className: 'ol-prev fa fa-caret-left fa-2x',
        parent: div,
        click: function () {
          this._count--;
          if (this._count < 1)
            this._count = this._contents.length;
          html = this._getHtml(this._contents[this._count - 1]);
          setTimeout(function () {
            ol_Overlay_Popup.prototype.show.call(this, this.getPosition(), html, this._count);
          }.bind(this), 350);
          this.select.setIndex(this._count)
          this.select.setShownFeature(this._features[this._count - 1])
        }.bind(this)
      });
      ol_ext_element.create('TEXT', { html: this._count + '/' + this._contents.length, parent: div });
      ol_ext_element.create('BUTTON', {
        className: 'ol-next fa fa-caret-right fa-2x',
        parent: div,
        click: function () {
          this._count++;
          if (this._count > this._contents.length)
            this._count = 1;
          html = this._getHtml(this._contents[this._count - 1]);
          setTimeout(function () {
            ol_Overlay_Popup.prototype.show.call(this, this.getPosition(), html, this._count);
          }.bind(this), 350);
          this.select.setIndex(this._count)
          this.select.setShownFeature(this._features[this._count - 1])
        }.bind(this)
      });
    }

    // Insert content
    if (content instanceof Element) {
      html.appendChild(content);
    } else {
      ol_ext_element.create('DIV', {
        className: 'ol-popup-content',
        html: content,
        parent: html
      });
    }
    return html;
  }
}

/** Get a function to use as format to get local string for an attribute
 * if the attribute is a number: Number.toLocaleString()
 * if the attribute is a date: Date.toLocaleString()
 * otherwise the attibute itself
 * @param {string} locales string with a BCP 47 language tag, or an array of such strings
 * @param {*} options Number or Date toLocaleString options
 * @return {function} a function that takes an attribute and return the formated attribute
 */
var ol_Overlay_PopupMultiple_localString = function (locales , options) {
  return function (a) {
    if (a && a.toLocaleString) {
      return a.toLocaleString(locales , options);
    } else {
      // Try to get a date from a string
      var date = new Date(a);
      if (isNaN(date)) return a;
      else return date.toLocaleString(locales , options);
    }
  };
};

export {ol_Overlay_PopupMultiple_localString}
export default ol_Overlay_PopupMultiple
