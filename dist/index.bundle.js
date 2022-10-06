/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/a11y-dialog/dist/a11y-dialog.esm.js":
/*!**********************************************************!*\
  !*** ./node_modules/a11y-dialog/dist/a11y-dialog.esm.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ A11yDialog)
/* harmony export */ });
var focusableSelectors = [
  'a[href]:not([tabindex^="-"])',
  'area[href]:not([tabindex^="-"])',
  'input:not([type="hidden"]):not([type="radio"]):not([disabled]):not([tabindex^="-"])',
  'input[type="radio"]:not([disabled]):not([tabindex^="-"])',
  'select:not([disabled]):not([tabindex^="-"])',
  'textarea:not([disabled]):not([tabindex^="-"])',
  'button:not([disabled]):not([tabindex^="-"])',
  'iframe:not([tabindex^="-"])',
  'audio[controls]:not([tabindex^="-"])',
  'video[controls]:not([tabindex^="-"])',
  '[contenteditable]:not([tabindex^="-"])',
  '[tabindex]:not([tabindex^="-"])',
];

var TAB_KEY = 'Tab';
var ESCAPE_KEY = 'Escape';

/**
 * Define the constructor to instantiate a dialog
 *
 * @constructor
 * @param {Element} element
 */
function A11yDialog(element) {
  // Prebind the functions that will be bound in addEventListener and
  // removeEventListener to avoid losing references
  this._show = this.show.bind(this);
  this._hide = this.hide.bind(this);
  this._maintainFocus = this._maintainFocus.bind(this);
  this._bindKeypress = this._bindKeypress.bind(this);

  this.$el = element;
  this.shown = false;
  this._id = this.$el.getAttribute('data-a11y-dialog') || this.$el.id;
  this._previouslyFocused = null;
  this._listeners = {};

  // Initialise everything needed for the dialog to work properly
  this.create();
}

/**
 * Set up everything necessary for the dialog to be functioning
 *
 * @param {(NodeList | Element | string)} targets
 * @return {this}
 */
A11yDialog.prototype.create = function () {
  this.$el.setAttribute('aria-hidden', true);
  this.$el.setAttribute('aria-modal', true);
  this.$el.setAttribute('tabindex', -1);

  if (!this.$el.hasAttribute('role')) {
    this.$el.setAttribute('role', 'dialog');
  }

  // Keep a collection of dialog openers, each of which will be bound a click
  // event listener to open the dialog
  this._openers = $$('[data-a11y-dialog-show="' + this._id + '"]');
  this._openers.forEach(
    function (opener) {
      opener.addEventListener('click', this._show);
    }.bind(this)
  );

  // Keep a collection of dialog closers, each of which will be bound a click
  // event listener to close the dialog
  const $el = this.$el;

  this._closers = $$('[data-a11y-dialog-hide]', this.$el)
    // This filter is necessary in case there are nested dialogs, so that
    // only closers from the current dialog are retrieved and effective
    .filter(function (closer) {
      // Testing for `[aria-modal="true"]` is not enough since this attribute
      // and the collect of closers is done at instantation time, when nested
      // dialogs might not have yet been instantiated. Note that if the dialogs
      // are manually instantiated, this could still fail because none of these
      // selectors would match; this would cause closers to close all parent
      // dialogs instead of just the current one
      return closer.closest('[aria-modal="true"], [data-a11y-dialog]') === $el
    })
    .concat($$('[data-a11y-dialog-hide="' + this._id + '"]'));

  this._closers.forEach(
    function (closer) {
      closer.addEventListener('click', this._hide);
    }.bind(this)
  );

  // Execute all callbacks registered for the `create` event
  this._fire('create');

  return this
};

/**
 * Show the dialog element, disable all the targets (siblings), trap the
 * current focus within it, listen for some specific key presses and fire all
 * registered callbacks for `show` event
 *
 * @param {CustomEvent} event
 * @return {this}
 */
A11yDialog.prototype.show = function (event) {
  // If the dialog is already open, abort
  if (this.shown) {
    return this
  }

  // Keep a reference to the currently focused element to be able to restore
  // it later
  this._previouslyFocused = document.activeElement;
  this.$el.removeAttribute('aria-hidden');
  this.shown = true;

  // Set the focus to the dialog element
  moveFocusToDialog(this.$el);

  // Bind a focus event listener to the body element to make sure the focus
  // stays trapped inside the dialog while open, and start listening for some
  // specific key presses (TAB and ESC)
  document.body.addEventListener('focus', this._maintainFocus, true);
  document.addEventListener('keydown', this._bindKeypress);

  // Execute all callbacks registered for the `show` event
  this._fire('show', event);

  return this
};

/**
 * Hide the dialog element, enable all the targets (siblings), restore the
 * focus to the previously active element, stop listening for some specific
 * key presses and fire all registered callbacks for `hide` event
 *
 * @param {CustomEvent} event
 * @return {this}
 */
A11yDialog.prototype.hide = function (event) {
  // If the dialog is already closed, abort
  if (!this.shown) {
    return this
  }

  this.shown = false;
  this.$el.setAttribute('aria-hidden', 'true');

  // If there was a focused element before the dialog was opened (and it has a
  // `focus` method), restore the focus back to it
  // See: https://github.com/KittyGiraudel/a11y-dialog/issues/108
  if (this._previouslyFocused && this._previouslyFocused.focus) {
    this._previouslyFocused.focus();
  }

  // Remove the focus event listener to the body element and stop listening
  // for specific key presses
  document.body.removeEventListener('focus', this._maintainFocus, true);
  document.removeEventListener('keydown', this._bindKeypress);

  // Execute all callbacks registered for the `hide` event
  this._fire('hide', event);

  return this
};

/**
 * Destroy the current instance (after making sure the dialog has been hidden)
 * and remove all associated listeners from dialog openers and closers
 *
 * @return {this}
 */
A11yDialog.prototype.destroy = function () {
  // Hide the dialog to avoid destroying an open instance
  this.hide();

  // Remove the click event listener from all dialog openers
  this._openers.forEach(
    function (opener) {
      opener.removeEventListener('click', this._show);
    }.bind(this)
  );

  // Remove the click event listener from all dialog closers
  this._closers.forEach(
    function (closer) {
      closer.removeEventListener('click', this._hide);
    }.bind(this)
  );

  // Execute all callbacks registered for the `destroy` event
  this._fire('destroy');

  // Keep an object of listener types mapped to callback functions
  this._listeners = {};

  return this
};

/**
 * Register a new callback for the given event type
 *
 * @param {string} type
 * @param {Function} handler
 */
A11yDialog.prototype.on = function (type, handler) {
  if (typeof this._listeners[type] === 'undefined') {
    this._listeners[type] = [];
  }

  this._listeners[type].push(handler);

  return this
};

/**
 * Unregister an existing callback for the given event type
 *
 * @param {string} type
 * @param {Function} handler
 */
A11yDialog.prototype.off = function (type, handler) {
  var index = (this._listeners[type] || []).indexOf(handler);

  if (index > -1) {
    this._listeners[type].splice(index, 1);
  }

  return this
};

/**
 * Iterate over all registered handlers for given type and call them all with
 * the dialog element as first argument, event as second argument (if any). Also
 * dispatch a custom event on the DOM element itself to make it possible to
 * react to the lifecycle of auto-instantiated dialogs.
 *
 * @access private
 * @param {string} type
 * @param {CustomEvent} event
 */
A11yDialog.prototype._fire = function (type, event) {
  var listeners = this._listeners[type] || [];
  var domEvent = new CustomEvent(type, { detail: event });

  this.$el.dispatchEvent(domEvent);

  listeners.forEach(
    function (listener) {
      listener(this.$el, event);
    }.bind(this)
  );
};

/**
 * Private event handler used when listening to some specific key presses
 * (namely ESCAPE and TAB)
 *
 * @access private
 * @param {Event} event
 */
A11yDialog.prototype._bindKeypress = function (event) {
  // This is an escape hatch in case there are nested dialogs, so the keypresses
  // are only reacted to for the most recent one
  const focused = document.activeElement;
  if (focused && focused.closest('[aria-modal="true"]') !== this.$el) return

  // If the dialog is shown and the ESCAPE key is being pressed, prevent any
  // further effects from the ESCAPE key and hide the dialog, unless its role
  // is 'alertdialog', which should be modal
  if (
    this.shown &&
    event.key === ESCAPE_KEY &&
    this.$el.getAttribute('role') !== 'alertdialog'
  ) {
    event.preventDefault();
    this.hide(event);
  }

  // If the dialog is shown and the TAB key is being pressed, make sure the
  // focus stays trapped within the dialog element
  if (this.shown && event.key === TAB_KEY) {
    trapTabKey(this.$el, event);
  }
};

/**
 * Private event handler used when making sure the focus stays within the
 * currently open dialog
 *
 * @access private
 * @param {Event} event
 */
A11yDialog.prototype._maintainFocus = function (event) {
  // If the dialog is shown and the focus is not within a dialog element (either
  // this one or another one in case of nested dialogs) or within an element
  // with the `data-a11y-dialog-focus-trap-ignore` attribute, move it back to
  // its first focusable child.
  // See: https://github.com/KittyGiraudel/a11y-dialog/issues/177
  if (
    this.shown &&
    !event.target.closest('[aria-modal="true"]') &&
    !event.target.closest('[data-a11y-dialog-ignore-focus-trap]')
  ) {
    moveFocusToDialog(this.$el);
  }
};

/**
 * Convert a NodeList into an array
 *
 * @param {NodeList} collection
 * @return {Array<Element>}
 */
function toArray(collection) {
  return Array.prototype.slice.call(collection)
}

/**
 * Query the DOM for nodes matching the given selector, scoped to context (or
 * the whole document)
 *
 * @param {String} selector
 * @param {Element} [context = document]
 * @return {Array<Element>}
 */
function $$(selector, context) {
  return toArray((context || document).querySelectorAll(selector))
}

/**
 * Set the focus to the first element with `autofocus` with the element or the
 * element itself
 *
 * @param {Element} node
 */
function moveFocusToDialog(node) {
  var focused = node.querySelector('[autofocus]') || node;

  focused.focus();
}

/**
 * Get the focusable children of the given element
 *
 * @param {Element} node
 * @return {Array<Element>}
 */
function getFocusableChildren(node) {
  return $$(focusableSelectors.join(','), node).filter(function (child) {
    return !!(
      child.offsetWidth ||
      child.offsetHeight ||
      child.getClientRects().length
    )
  })
}

/**
 * Trap the focus inside the given element
 *
 * @param {Element} node
 * @param {Event} event
 */
function trapTabKey(node, event) {
  var focusableChildren = getFocusableChildren(node);
  var focusedItemIndex = focusableChildren.indexOf(document.activeElement);

  // If the SHIFT key is being pressed while tabbing (moving backwards) and
  // the currently focused item is the first one, move the focus to the last
  // focusable item from the dialog element
  if (event.shiftKey && focusedItemIndex === 0) {
    focusableChildren[focusableChildren.length - 1].focus();
    event.preventDefault();
    // If the SHIFT key is not being pressed (moving forwards) and the currently
    // focused item is the last one, move the focus to the first focusable item
    // from the dialog element
  } else if (
    !event.shiftKey &&
    focusedItemIndex === focusableChildren.length - 1
  ) {
    focusableChildren[0].focus();
    event.preventDefault();
  }
}

function instantiateDialogs() {
  $$('[data-a11y-dialog]').forEach(function (node) {
    new A11yDialog(node);
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', instantiateDialogs);
  } else {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(instantiateDialogs);
    } else {
      window.setTimeout(instantiateDialogs, 16);
    }
  }
}




/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/normalize.css/normalize.css":
/*!****************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/normalize.css/normalize.css ***!
  \****************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, "/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */\n\n/* Document\n   ========================================================================== */\n\n/**\n * 1. Correct the line height in all browsers.\n * 2. Prevent adjustments of font size after orientation changes in iOS.\n */\n\nhtml {\n  line-height: 1.15; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n}\n\n/* Sections\n   ========================================================================== */\n\n/**\n * Remove the margin in all browsers.\n */\n\nbody {\n  margin: 0;\n}\n\n/**\n * Render the `main` element consistently in IE.\n */\n\nmain {\n  display: block;\n}\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\n\n/* Grouping content\n   ========================================================================== */\n\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\n\nhr {\n  box-sizing: content-box; /* 1 */\n  height: 0; /* 1 */\n  overflow: visible; /* 2 */\n}\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n\npre {\n  font-family: monospace, monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/* Text-level semantics\n   ========================================================================== */\n\n/**\n * Remove the gray background on active links in IE 10.\n */\n\na {\n  background-color: transparent;\n}\n\n/**\n * 1. Remove the bottom border in Chrome 57-\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.\n */\n\nabbr[title] {\n  border-bottom: none; /* 1 */\n  text-decoration: underline; /* 2 */\n  text-decoration: underline dotted; /* 2 */\n}\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n\ncode,\nkbd,\nsamp {\n  font-family: monospace, monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/**\n * Add the correct font size in all browsers.\n */\n\nsmall {\n  font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/* Embedded content\n   ========================================================================== */\n\n/**\n * Remove the border on images inside links in IE 10.\n */\n\nimg {\n  border-style: none;\n}\n\n/* Forms\n   ========================================================================== */\n\n/**\n * 1. Change the font styles in all browsers.\n * 2. Remove the margin in Firefox and Safari.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  line-height: 1.15; /* 1 */\n  margin: 0; /* 2 */\n}\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\n\nbutton,\ninput { /* 1 */\n  overflow: visible;\n}\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\n\nbutton,\nselect { /* 1 */\n  text-transform: none;\n}\n\n/**\n * Correct the inability to style clickable types in iOS and Safari.\n */\n\nbutton,\n[type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n}\n\n/**\n * Remove the inner border and padding in Firefox.\n */\n\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0;\n}\n\n/**\n * Restore the focus styles unset by the previous rule.\n */\n\nbutton:-moz-focusring,\n[type=\"button\"]:-moz-focusring,\n[type=\"reset\"]:-moz-focusring,\n[type=\"submit\"]:-moz-focusring {\n  outline: 1px dotted ButtonText;\n}\n\n/**\n * Correct the padding in Firefox.\n */\n\nfieldset {\n  padding: 0.35em 0.75em 0.625em;\n}\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\n\nlegend {\n  box-sizing: border-box; /* 1 */\n  color: inherit; /* 2 */\n  display: table; /* 1 */\n  max-width: 100%; /* 1 */\n  padding: 0; /* 3 */\n  white-space: normal; /* 1 */\n}\n\n/**\n * Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\n\nprogress {\n  vertical-align: baseline;\n}\n\n/**\n * Remove the default vertical scrollbar in IE 10+.\n */\n\ntextarea {\n  overflow: auto;\n}\n\n/**\n * 1. Add the correct box sizing in IE 10.\n * 2. Remove the padding in IE 10.\n */\n\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  box-sizing: border-box; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n\n[type=\"search\"] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/**\n * Remove the inner padding in Chrome and Safari on macOS.\n */\n\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/* Interactive\n   ========================================================================== */\n\n/*\n * Add the correct display in Edge, IE 10+, and Firefox.\n */\n\ndetails {\n  display: block;\n}\n\n/*\n * Add the correct display in all browsers.\n */\n\nsummary {\n  display: list-item;\n}\n\n/* Misc\n   ========================================================================== */\n\n/**\n * Add the correct display in IE 10+.\n */\n\ntemplate {\n  display: none;\n}\n\n/**\n * Add the correct display in IE 10.\n */\n\n[hidden] {\n  display: none;\n}\n", "",{"version":3,"sources":["webpack://./node_modules/normalize.css/normalize.css"],"names":[],"mappings":"AAAA,2EAA2E;;AAE3E;+EAC+E;;AAE/E;;;EAGE;;AAEF;EACE,iBAAiB,EAAE,MAAM;EACzB,8BAA8B,EAAE,MAAM;AACxC;;AAEA;+EAC+E;;AAE/E;;EAEE;;AAEF;EACE,SAAS;AACX;;AAEA;;EAEE;;AAEF;EACE,cAAc;AAChB;;AAEA;;;EAGE;;AAEF;EACE,cAAc;EACd,gBAAgB;AAClB;;AAEA;+EAC+E;;AAE/E;;;EAGE;;AAEF;EACE,uBAAuB,EAAE,MAAM;EAC/B,SAAS,EAAE,MAAM;EACjB,iBAAiB,EAAE,MAAM;AAC3B;;AAEA;;;EAGE;;AAEF;EACE,iCAAiC,EAAE,MAAM;EACzC,cAAc,EAAE,MAAM;AACxB;;AAEA;+EAC+E;;AAE/E;;EAEE;;AAEF;EACE,6BAA6B;AAC/B;;AAEA;;;EAGE;;AAEF;EACE,mBAAmB,EAAE,MAAM;EAC3B,0BAA0B,EAAE,MAAM;EAClC,iCAAiC,EAAE,MAAM;AAC3C;;AAEA;;EAEE;;AAEF;;EAEE,mBAAmB;AACrB;;AAEA;;;EAGE;;AAEF;;;EAGE,iCAAiC,EAAE,MAAM;EACzC,cAAc,EAAE,MAAM;AACxB;;AAEA;;EAEE;;AAEF;EACE,cAAc;AAChB;;AAEA;;;EAGE;;AAEF;;EAEE,cAAc;EACd,cAAc;EACd,kBAAkB;EAClB,wBAAwB;AAC1B;;AAEA;EACE,eAAe;AACjB;;AAEA;EACE,WAAW;AACb;;AAEA;+EAC+E;;AAE/E;;EAEE;;AAEF;EACE,kBAAkB;AACpB;;AAEA;+EAC+E;;AAE/E;;;EAGE;;AAEF;;;;;EAKE,oBAAoB,EAAE,MAAM;EAC5B,eAAe,EAAE,MAAM;EACvB,iBAAiB,EAAE,MAAM;EACzB,SAAS,EAAE,MAAM;AACnB;;AAEA;;;EAGE;;AAEF;QACQ,MAAM;EACZ,iBAAiB;AACnB;;AAEA;;;EAGE;;AAEF;SACS,MAAM;EACb,oBAAoB;AACtB;;AAEA;;EAEE;;AAEF;;;;EAIE,0BAA0B;AAC5B;;AAEA;;EAEE;;AAEF;;;;EAIE,kBAAkB;EAClB,UAAU;AACZ;;AAEA;;EAEE;;AAEF;;;;EAIE,8BAA8B;AAChC;;AAEA;;EAEE;;AAEF;EACE,8BAA8B;AAChC;;AAEA;;;;;EAKE;;AAEF;EACE,sBAAsB,EAAE,MAAM;EAC9B,cAAc,EAAE,MAAM;EACtB,cAAc,EAAE,MAAM;EACtB,eAAe,EAAE,MAAM;EACvB,UAAU,EAAE,MAAM;EAClB,mBAAmB,EAAE,MAAM;AAC7B;;AAEA;;EAEE;;AAEF;EACE,wBAAwB;AAC1B;;AAEA;;EAEE;;AAEF;EACE,cAAc;AAChB;;AAEA;;;EAGE;;AAEF;;EAEE,sBAAsB,EAAE,MAAM;EAC9B,UAAU,EAAE,MAAM;AACpB;;AAEA;;EAEE;;AAEF;;EAEE,YAAY;AACd;;AAEA;;;EAGE;;AAEF;EACE,6BAA6B,EAAE,MAAM;EACrC,oBAAoB,EAAE,MAAM;AAC9B;;AAEA;;EAEE;;AAEF;EACE,wBAAwB;AAC1B;;AAEA;;;EAGE;;AAEF;EACE,0BAA0B,EAAE,MAAM;EAClC,aAAa,EAAE,MAAM;AACvB;;AAEA;+EAC+E;;AAE/E;;EAEE;;AAEF;EACE,cAAc;AAChB;;AAEA;;EAEE;;AAEF;EACE,kBAAkB;AACpB;;AAEA;+EAC+E;;AAE/E;;EAEE;;AAEF;EACE,aAAa;AACf;;AAEA;;EAEE;;AAEF;EACE,aAAa;AACf","sourcesContent":["/*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */\n\n/* Document\n   ========================================================================== */\n\n/**\n * 1. Correct the line height in all browsers.\n * 2. Prevent adjustments of font size after orientation changes in iOS.\n */\n\nhtml {\n  line-height: 1.15; /* 1 */\n  -webkit-text-size-adjust: 100%; /* 2 */\n}\n\n/* Sections\n   ========================================================================== */\n\n/**\n * Remove the margin in all browsers.\n */\n\nbody {\n  margin: 0;\n}\n\n/**\n * Render the `main` element consistently in IE.\n */\n\nmain {\n  display: block;\n}\n\n/**\n * Correct the font size and margin on `h1` elements within `section` and\n * `article` contexts in Chrome, Firefox, and Safari.\n */\n\nh1 {\n  font-size: 2em;\n  margin: 0.67em 0;\n}\n\n/* Grouping content\n   ========================================================================== */\n\n/**\n * 1. Add the correct box sizing in Firefox.\n * 2. Show the overflow in Edge and IE.\n */\n\nhr {\n  box-sizing: content-box; /* 1 */\n  height: 0; /* 1 */\n  overflow: visible; /* 2 */\n}\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n\npre {\n  font-family: monospace, monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/* Text-level semantics\n   ========================================================================== */\n\n/**\n * Remove the gray background on active links in IE 10.\n */\n\na {\n  background-color: transparent;\n}\n\n/**\n * 1. Remove the bottom border in Chrome 57-\n * 2. Add the correct text decoration in Chrome, Edge, IE, Opera, and Safari.\n */\n\nabbr[title] {\n  border-bottom: none; /* 1 */\n  text-decoration: underline; /* 2 */\n  text-decoration: underline dotted; /* 2 */\n}\n\n/**\n * Add the correct font weight in Chrome, Edge, and Safari.\n */\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/**\n * 1. Correct the inheritance and scaling of font size in all browsers.\n * 2. Correct the odd `em` font sizing in all browsers.\n */\n\ncode,\nkbd,\nsamp {\n  font-family: monospace, monospace; /* 1 */\n  font-size: 1em; /* 2 */\n}\n\n/**\n * Add the correct font size in all browsers.\n */\n\nsmall {\n  font-size: 80%;\n}\n\n/**\n * Prevent `sub` and `sup` elements from affecting the line height in\n * all browsers.\n */\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/* Embedded content\n   ========================================================================== */\n\n/**\n * Remove the border on images inside links in IE 10.\n */\n\nimg {\n  border-style: none;\n}\n\n/* Forms\n   ========================================================================== */\n\n/**\n * 1. Change the font styles in all browsers.\n * 2. Remove the margin in Firefox and Safari.\n */\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit; /* 1 */\n  font-size: 100%; /* 1 */\n  line-height: 1.15; /* 1 */\n  margin: 0; /* 2 */\n}\n\n/**\n * Show the overflow in IE.\n * 1. Show the overflow in Edge.\n */\n\nbutton,\ninput { /* 1 */\n  overflow: visible;\n}\n\n/**\n * Remove the inheritance of text transform in Edge, Firefox, and IE.\n * 1. Remove the inheritance of text transform in Firefox.\n */\n\nbutton,\nselect { /* 1 */\n  text-transform: none;\n}\n\n/**\n * Correct the inability to style clickable types in iOS and Safari.\n */\n\nbutton,\n[type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n}\n\n/**\n * Remove the inner border and padding in Firefox.\n */\n\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  border-style: none;\n  padding: 0;\n}\n\n/**\n * Restore the focus styles unset by the previous rule.\n */\n\nbutton:-moz-focusring,\n[type=\"button\"]:-moz-focusring,\n[type=\"reset\"]:-moz-focusring,\n[type=\"submit\"]:-moz-focusring {\n  outline: 1px dotted ButtonText;\n}\n\n/**\n * Correct the padding in Firefox.\n */\n\nfieldset {\n  padding: 0.35em 0.75em 0.625em;\n}\n\n/**\n * 1. Correct the text wrapping in Edge and IE.\n * 2. Correct the color inheritance from `fieldset` elements in IE.\n * 3. Remove the padding so developers are not caught out when they zero out\n *    `fieldset` elements in all browsers.\n */\n\nlegend {\n  box-sizing: border-box; /* 1 */\n  color: inherit; /* 2 */\n  display: table; /* 1 */\n  max-width: 100%; /* 1 */\n  padding: 0; /* 3 */\n  white-space: normal; /* 1 */\n}\n\n/**\n * Add the correct vertical alignment in Chrome, Firefox, and Opera.\n */\n\nprogress {\n  vertical-align: baseline;\n}\n\n/**\n * Remove the default vertical scrollbar in IE 10+.\n */\n\ntextarea {\n  overflow: auto;\n}\n\n/**\n * 1. Add the correct box sizing in IE 10.\n * 2. Remove the padding in IE 10.\n */\n\n[type=\"checkbox\"],\n[type=\"radio\"] {\n  box-sizing: border-box; /* 1 */\n  padding: 0; /* 2 */\n}\n\n/**\n * Correct the cursor style of increment and decrement buttons in Chrome.\n */\n\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/**\n * 1. Correct the odd appearance in Chrome and Safari.\n * 2. Correct the outline style in Safari.\n */\n\n[type=\"search\"] {\n  -webkit-appearance: textfield; /* 1 */\n  outline-offset: -2px; /* 2 */\n}\n\n/**\n * Remove the inner padding in Chrome and Safari on macOS.\n */\n\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/**\n * 1. Correct the inability to style clickable types in iOS and Safari.\n * 2. Change font properties to `inherit` in Safari.\n */\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button; /* 1 */\n  font: inherit; /* 2 */\n}\n\n/* Interactive\n   ========================================================================== */\n\n/*\n * Add the correct display in Edge, IE 10+, and Firefox.\n */\n\ndetails {\n  display: block;\n}\n\n/*\n * Add the correct display in all browsers.\n */\n\nsummary {\n  display: list-item;\n}\n\n/* Misc\n   ========================================================================== */\n\n/**\n * Add the correct display in IE 10+.\n */\n\ntemplate {\n  display: none;\n}\n\n/**\n * Add the correct display in IE 10.\n */\n\n[hidden] {\n  display: none;\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/main.scss":
/*!****************************************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/main.scss ***!
  \****************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.push([module.id, "@import url(https://fonts.googleapis.com/css2?family=Roboto&display=swap);"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, ":root {\n  font-family: \"Roboto\" sans-serif;\n}\n\n.icon {\n  display: grid;\n  place-items: center;\n}\n\n@media only screen and (max-width: 425px) {\n  body {\n    width: 100vw;\n    height: 100vh;\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n  }\n  header {\n    margin-top: auto;\n    width: 80%;\n    display: flex;\n    align-items: flex-end;\n    gap: 10px;\n  }\n  header a {\n    flex: 1;\n  }\n  header a button {\n    width: 100%;\n  }\n  header .add-habit {\n    flex: 0 0 50px;\n    height: 50px;\n    font-size: 2.5rem;\n  }\n  .dialog-container {\n    position: fixed;\n    display: flex;\n    justify-content: center;\n    align-items: center;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    z-index: 2;\n  }\n  .dialog-container[aria-hidden=true] {\n    display: none;\n  }\n  .dialog-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    bottom: 0;\n    right: 0;\n    background-color: rgba(43, 46, 56, 0.692);\n  }\n  .dialog-content {\n    background-color: rgb(255, 255, 255);\n    z-index: 2;\n    position: relative;\n  }\n  #pick-habit .dialog-content {\n    width: 100%;\n    display: flex;\n    flex-direction: column;\n    align-self: flex-end;\n    border-radius: 10px 10px 0 0;\n    background-color: transparent;\n  }\n  #pick-habit .habit-type {\n    background-color: rgba(0, 0, 0, 0.849);\n    color: white;\n    display: grid;\n    grid-template-columns: 40px 1fr 40px;\n    grid-template-rows: repeat(2, 40px);\n    grid-template-areas: \"icon title leading-arrow\" \"icon description leading-arrow\";\n    gap: 0 10px;\n    place-items: center;\n  }\n  #pick-habit .habit-type .icon {\n    grid-area: icon;\n    color: aquamarine;\n  }\n  #pick-habit .habit-type .title {\n    grid-area: title;\n    justify-self: start;\n  }\n  #pick-habit .habit-type .leading-arrow {\n    grid-area: leading-arrow;\n    align-self: stretch;\n  }\n  #pick-habit .habit-type .description {\n    grid-area: description;\n    justify-self: start;\n  }\n  #pick-habit .habit-type:first-child {\n    border-radius: 10px 10px 0 0;\n  }\n}", "",{"version":3,"sources":["webpack://./src/main.scss"],"names":[],"mappings":"AACA;EACI,gCAAA;AACJ;;AACA;EACI,aAAA;EACA,mBAAA;AAEJ;;AACA;EACI;IACI,YAAA;IACA,aAAA;IAEA,aAAA;IACA,sBAAA;IACA,mBAAA;EACN;EAEE;IACI,gBAAA;IAEA,UAAA;IAEA,aAAA;IACA,qBAAA;IACA,SAAA;EAFN;EAIM;IACI,OAAA;EAFV;EAIU;IACI,WAAA;EAFd;EAMM;IACI,cAAA;IAEA,YAAA;IAEA,iBAAA;EANV;EAUE;IACI,eAAA;IACA,aAAA;IACA,uBAAA;IACA,mBAAA;IAEA,MAAA;IACA,SAAA;IACA,OAAA;IACA,QAAA;IACA,UAAA;EATN;EAYE;IACI,aAAA;EAVN;EAaE;IACI,eAAA;IACA,MAAA;IACA,OAAA;IACA,SAAA;IACA,QAAA;IACA,yCAAA;EAXN;EAcE;IACI,oCAAA;IACA,UAAA;IACA,kBAAA;EAZN;EAgBM;IACI,WAAA;IAEA,aAAA;IACA,sBAAA;IAEA,oBAAA;IACA,4BAAA;IACA,6BAAA;EAhBV;EAmBM;IACI,sCAAA;IACA,YAAA;IAEA,aAAA;IACA,oCAAA;IACA,mCAAA;IACA,gFACA;IAEA,WAAA;IACA,mBAAA;EApBV;EAsBU;IACI,eAAA;IACA,iBAAA;EApBd;EAuBU;IACI,gBAAA;IACA,mBAAA;EArBd;EAwBU;IACI,wBAAA;IACA,mBAAA;EAtBd;EAyBU;IACI,sBAAA;IACA,mBAAA;EAvBd;EA2BM;IACI,4BAAA;EAzBV;AACF","sourcesContent":["@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');\n:root {\n    font-family: 'Roboto' sans-serif;\n}\n.icon {\n    display: grid;\n    place-items: center;\n}\n\n@media only screen and (max-width: 425px) {\n    body {\n        width: 100vw;\n        height: 100vh;\n\n        display: flex;\n        flex-direction: column;\n        align-items: center;\n    }\n\n    header {\n        margin-top: auto;\n\n        width: 80%;\n\n        display: flex;\n        align-items: flex-end;\n        gap: 10px;\n\n        a {\n            flex: 1;\n\n            button {\n                width: 100%;\n            }\n        }\n\n        .add-habit {\n            flex: 0 0 50px;\n\n            height: 50px;\n\n            font-size: 2.5rem;\n        }\n    }\n\n    .dialog-container {\n        position: fixed;\n        display: flex;\n        justify-content: center;\n        align-items: center;\n\n        top: 0;\n        bottom: 0;\n        left: 0;\n        right: 0;\n        z-index: 2;\n    }\n\n    .dialog-container[aria-hidden='true'] {\n        display: none;\n    }\n\n    .dialog-overlay {\n        position: fixed;\n        top: 0;\n        left: 0;\n        bottom: 0;\n        right: 0;\n        background-color: rgba(43, 46, 56, 0.692);\n    }\n\n    .dialog-content {\n        background-color: rgb(255, 255, 255);\n        z-index: 2;\n        position: relative;\n    }\n\n    #pick-habit {\n        .dialog-content {\n            width: 100%;\n\n            display: flex;\n            flex-direction: column;\n\n            align-self: flex-end;\n            border-radius: 10px 10px 0 0;\n            background-color: transparent;\n        }\n\n        .habit-type {\n            background-color: rgba(0, 0, 0, 0.849);\n            color: white;\n\n            display: grid;\n            grid-template-columns: 40px 1fr 40px;\n            grid-template-rows: repeat(2,40px);\n            grid-template-areas: \n            \"icon title leading-arrow\"\n            \"icon description leading-arrow\";\n            gap: 0 10px;\n            place-items: center;\n\n            .icon {\n                grid-area: icon;\n                color: aquamarine;\n            }\n\n            .title {\n                grid-area: title;\n                justify-self: start;\n            }\n\n            .leading-arrow {\n                grid-area: leading-arrow;\n                align-self: stretch;\n            }\n\n            .description {\n                grid-area: description;\n                justify-self: start;\n            }\n        }\n\n        .habit-type:first-child {\n            border-radius: 10px 10px 0 0;\n        }\n    }\n}\n\n\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";

      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }

      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }

      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }

      content += cssWithMappingToString(item);

      if (needLayer) {
        content += "}";
      }

      if (item[2]) {
        content += "}";
      }

      if (item[4]) {
        content += "}";
      }

      return content;
    }).join("");
  }; // import a list of modules into the list


  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }

      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }

      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }

      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }

      list.push(item);
    }
  };

  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/sourceMaps.js":
/*!************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/sourceMaps.js ***!
  \************************************************************/
/***/ ((module) => {



module.exports = function (item) {
  var content = item[1];
  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (typeof btoa === "function") {
    var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(cssMapping))));
    var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
    var sourceMapping = "/*# ".concat(data, " */");
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || "").concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join("\n");
  }

  return [content].join("\n");
};

/***/ }),

/***/ "./node_modules/normalize.css/normalize.css":
/*!**************************************************!*\
  !*** ./node_modules/normalize.css/normalize.css ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../css-loader/dist/cjs.js!./normalize.css */ "./node_modules/css-loader/dist/cjs.js!./node_modules/normalize.css/normalize.css");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"] && _css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _css_loader_dist_cjs_js_normalize_css__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./src/main.scss":
/*!***********************!*\
  !*** ./src/main.scss ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js */ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleDomAPI.js */ "./node_modules/style-loader/dist/runtime/styleDomAPI.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertBySelector.js */ "./node_modules/style-loader/dist/runtime/insertBySelector.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js */ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/insertStyleElement.js */ "./node_modules/style-loader/dist/runtime/insertStyleElement.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! !../node_modules/style-loader/dist/runtime/styleTagTransform.js */ "./node_modules/style-loader/dist/runtime/styleTagTransform.js");
/* harmony import */ var _node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_main_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! !!../node_modules/css-loader/dist/cjs.js!../node_modules/sass-loader/dist/cjs.js!./main.scss */ "./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src/main.scss");

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (_node_modules_style_loader_dist_runtime_styleTagTransform_js__WEBPACK_IMPORTED_MODULE_5___default());
options.setAttributes = (_node_modules_style_loader_dist_runtime_setAttributesWithoutAttributes_js__WEBPACK_IMPORTED_MODULE_3___default());

      options.insert = _node_modules_style_loader_dist_runtime_insertBySelector_js__WEBPACK_IMPORTED_MODULE_2___default().bind(null, "head");
    
options.domAPI = (_node_modules_style_loader_dist_runtime_styleDomAPI_js__WEBPACK_IMPORTED_MODULE_1___default());
options.insertStyleElement = (_node_modules_style_loader_dist_runtime_insertStyleElement_js__WEBPACK_IMPORTED_MODULE_4___default());

var update = _node_modules_style_loader_dist_runtime_injectStylesIntoStyleTag_js__WEBPACK_IMPORTED_MODULE_0___default()(_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_main_scss__WEBPACK_IMPORTED_MODULE_6__["default"], options);




       /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (_node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_main_scss__WEBPACK_IMPORTED_MODULE_6__["default"] && _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_main_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals ? _node_modules_css_loader_dist_cjs_js_node_modules_sass_loader_dist_cjs_js_main_scss__WEBPACK_IMPORTED_MODULE_6__["default"].locals : undefined);


/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js":
/*!****************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js ***!
  \****************************************************************************/
/***/ ((module) => {



var stylesInDOM = [];

function getIndexByIdentifier(identifier) {
  var result = -1;

  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }

  return result;
}

function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];

  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };

    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }

    identifiers.push(identifier);
  }

  return identifiers;
}

function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);

  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }

      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };

  return updater;
}

module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];

    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }

    var newLastIdentifiers = modulesToDom(newList, options);

    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];

      var _index = getIndexByIdentifier(_identifier);

      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();

        stylesInDOM.splice(_index, 1);
      }
    }

    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertBySelector.js":
/*!********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertBySelector.js ***!
  \********************************************************************/
/***/ ((module) => {



var memo = {};
/* istanbul ignore next  */

function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target); // Special case to return head of iframe instead of iframe itself

    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }

    memo[target] = styleTarget;
  }

  return memo[target];
}
/* istanbul ignore next  */


function insertBySelector(insert, style) {
  var target = getTarget(insert);

  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }

  target.appendChild(style);
}

module.exports = insertBySelector;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/insertStyleElement.js":
/*!**********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/insertStyleElement.js ***!
  \**********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}

module.exports = insertStyleElement;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js ***!
  \**********************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;

  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}

module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleDomAPI.js":
/*!***************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleDomAPI.js ***!
  \***************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";

  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }

  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }

  var needLayer = typeof obj.layer !== "undefined";

  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }

  css += obj.css;

  if (needLayer) {
    css += "}";
  }

  if (obj.media) {
    css += "}";
  }

  if (obj.supports) {
    css += "}";
  }

  var sourceMap = obj.sourceMap;

  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  } // For old IE

  /* istanbul ignore if  */


  options.styleTagTransform(css, styleElement, options.options);
}

function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }

  styleElement.parentNode.removeChild(styleElement);
}
/* istanbul ignore next  */


function domAPI(options) {
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}

module.exports = domAPI;

/***/ }),

/***/ "./node_modules/style-loader/dist/runtime/styleTagTransform.js":
/*!*********************************************************************!*\
  !*** ./node_modules/style-loader/dist/runtime/styleTagTransform.js ***!
  \*********************************************************************/
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }

    styleElement.appendChild(document.createTextNode(css));
  }
}

module.exports = styleTagTransform;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var a11y_dialog__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! a11y-dialog */ "./node_modules/a11y-dialog/dist/a11y-dialog.esm.js");
/* harmony import */ var normalize_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! normalize.css */ "./node_modules/normalize.css/normalize.css");
/* harmony import */ var _main_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./main.scss */ "./src/main.scss");




const DOMController = (function(){
    function generateMobileHeader(){
        const header = document.querySelector('header');

        header.innerHTML = `<a href="/dist/index.html"><button class="today">Today</button></a>
        <button class="add-habit">+</button>
        <a href="/dist/pages/raports.html"><button class="raports">Raports</button></a>`;
    }

    function createHabitCreatorDialog(){
        const dialogContainer = document.getElementById("pick-habit");
        /*dialogContainer.innerHTML = ``*/
        
        const dialog = new a11y_dialog__WEBPACK_IMPORTED_MODULE_0__["default"](dialogContainer);
        
        console.log("show");
        dialog.show();
    }

    return {generateMobileHeader,createHabitCreatorDialog};
})();

DOMController.generateMobileHeader();
DOMController.createHabitCreatorDialog();
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixtREFBVTtBQUNyQztBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZO0FBQ1osQ0FBQzs7QUFFRDtBQUNBLHlDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluLy4vbm9kZV9tb2R1bGVzL2ExMXktZGlhbG9nL2Rpc3QvYTExeS1kaWFsb2cuZXNtLmpzIiwid2VicGFjazovL2hhYml0LXRyYWNrZXItb2Rpbi8uL25vZGVfbW9kdWxlcy9ub3JtYWxpemUuY3NzL25vcm1hbGl6ZS5jc3MiLCJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluLy4vc3JjL21haW4uc2NzcyIsIndlYnBhY2s6Ly9oYWJpdC10cmFja2VyLW9kaW4vLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzIiwid2VicGFjazovL2hhYml0LXRyYWNrZXItb2Rpbi8uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9zb3VyY2VNYXBzLmpzIiwid2VicGFjazovL2hhYml0LXRyYWNrZXItb2Rpbi8uL25vZGVfbW9kdWxlcy9ub3JtYWxpemUuY3NzL25vcm1hbGl6ZS5jc3M/MzQyZiIsIndlYnBhY2s6Ly9oYWJpdC10cmFja2VyLW9kaW4vLi9zcmMvbWFpbi5zY3NzPzRlNTMiLCJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzIiwid2VicGFjazovL2hhYml0LXRyYWNrZXItb2Rpbi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanMiLCJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluLy4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzIiwid2VicGFjazovL2hhYml0LXRyYWNrZXItb2Rpbi8uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3NldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlcy5qcyIsIndlYnBhY2s6Ly9oYWJpdC10cmFja2VyLW9kaW4vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZURvbUFQSS5qcyIsIndlYnBhY2s6Ly9oYWJpdC10cmFja2VyLW9kaW4vLi9ub2RlX21vZHVsZXMvc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zdHlsZVRhZ1RyYW5zZm9ybS5qcyIsIndlYnBhY2s6Ly9oYWJpdC10cmFja2VyLW9kaW4vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluL3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL2hhYml0LXRyYWNrZXItb2Rpbi93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vaGFiaXQtdHJhY2tlci1vZGluL3dlYnBhY2svcnVudGltZS9ub25jZSIsIndlYnBhY2s6Ly9oYWJpdC10cmFja2VyLW9kaW4vLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGZvY3VzYWJsZVNlbGVjdG9ycyA9IFtcbiAgJ2FbaHJlZl06bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdhcmVhW2hyZWZdOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAnaW5wdXQ6bm90KFt0eXBlPVwiaGlkZGVuXCJdKTpub3QoW3R5cGU9XCJyYWRpb1wiXSk6bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAnaW5wdXRbdHlwZT1cInJhZGlvXCJdOm5vdChbZGlzYWJsZWRdKTpub3QoW3RhYmluZGV4Xj1cIi1cIl0pJyxcbiAgJ3NlbGVjdDpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICd0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSk6bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdidXR0b246bm90KFtkaXNhYmxlZF0pOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAnaWZyYW1lOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAnYXVkaW9bY29udHJvbHNdOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAndmlkZW9bY29udHJvbHNdOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuICAnW2NvbnRlbnRlZGl0YWJsZV06bm90KFt0YWJpbmRleF49XCItXCJdKScsXG4gICdbdGFiaW5kZXhdOm5vdChbdGFiaW5kZXhePVwiLVwiXSknLFxuXTtcblxudmFyIFRBQl9LRVkgPSAnVGFiJztcbnZhciBFU0NBUEVfS0VZID0gJ0VzY2FwZSc7XG5cbi8qKlxuICogRGVmaW5lIHRoZSBjb25zdHJ1Y3RvciB0byBpbnN0YW50aWF0ZSBhIGRpYWxvZ1xuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50XG4gKi9cbmZ1bmN0aW9uIEExMXlEaWFsb2coZWxlbWVudCkge1xuICAvLyBQcmViaW5kIHRoZSBmdW5jdGlvbnMgdGhhdCB3aWxsIGJlIGJvdW5kIGluIGFkZEV2ZW50TGlzdGVuZXIgYW5kXG4gIC8vIHJlbW92ZUV2ZW50TGlzdGVuZXIgdG8gYXZvaWQgbG9zaW5nIHJlZmVyZW5jZXNcbiAgdGhpcy5fc2hvdyA9IHRoaXMuc2hvdy5iaW5kKHRoaXMpO1xuICB0aGlzLl9oaWRlID0gdGhpcy5oaWRlLmJpbmQodGhpcyk7XG4gIHRoaXMuX21haW50YWluRm9jdXMgPSB0aGlzLl9tYWludGFpbkZvY3VzLmJpbmQodGhpcyk7XG4gIHRoaXMuX2JpbmRLZXlwcmVzcyA9IHRoaXMuX2JpbmRLZXlwcmVzcy5iaW5kKHRoaXMpO1xuXG4gIHRoaXMuJGVsID0gZWxlbWVudDtcbiAgdGhpcy5zaG93biA9IGZhbHNlO1xuICB0aGlzLl9pZCA9IHRoaXMuJGVsLmdldEF0dHJpYnV0ZSgnZGF0YS1hMTF5LWRpYWxvZycpIHx8IHRoaXMuJGVsLmlkO1xuICB0aGlzLl9wcmV2aW91c2x5Rm9jdXNlZCA9IG51bGw7XG4gIHRoaXMuX2xpc3RlbmVycyA9IHt9O1xuXG4gIC8vIEluaXRpYWxpc2UgZXZlcnl0aGluZyBuZWVkZWQgZm9yIHRoZSBkaWFsb2cgdG8gd29yayBwcm9wZXJseVxuICB0aGlzLmNyZWF0ZSgpO1xufVxuXG4vKipcbiAqIFNldCB1cCBldmVyeXRoaW5nIG5lY2Vzc2FyeSBmb3IgdGhlIGRpYWxvZyB0byBiZSBmdW5jdGlvbmluZ1xuICpcbiAqIEBwYXJhbSB7KE5vZGVMaXN0IHwgRWxlbWVudCB8IHN0cmluZyl9IHRhcmdldHNcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkExMXlEaWFsb2cucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy4kZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsIHRydWUpO1xuICB0aGlzLiRlbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCB0cnVlKTtcbiAgdGhpcy4kZWwuc2V0QXR0cmlidXRlKCd0YWJpbmRleCcsIC0xKTtcblxuICBpZiAoIXRoaXMuJGVsLmhhc0F0dHJpYnV0ZSgncm9sZScpKSB7XG4gICAgdGhpcy4kZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ2RpYWxvZycpO1xuICB9XG5cbiAgLy8gS2VlcCBhIGNvbGxlY3Rpb24gb2YgZGlhbG9nIG9wZW5lcnMsIGVhY2ggb2Ygd2hpY2ggd2lsbCBiZSBib3VuZCBhIGNsaWNrXG4gIC8vIGV2ZW50IGxpc3RlbmVyIHRvIG9wZW4gdGhlIGRpYWxvZ1xuICB0aGlzLl9vcGVuZXJzID0gJCQoJ1tkYXRhLWExMXktZGlhbG9nLXNob3c9XCInICsgdGhpcy5faWQgKyAnXCJdJyk7XG4gIHRoaXMuX29wZW5lcnMuZm9yRWFjaChcbiAgICBmdW5jdGlvbiAob3BlbmVyKSB7XG4gICAgICBvcGVuZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9zaG93KTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcblxuICAvLyBLZWVwIGEgY29sbGVjdGlvbiBvZiBkaWFsb2cgY2xvc2VycywgZWFjaCBvZiB3aGljaCB3aWxsIGJlIGJvdW5kIGEgY2xpY2tcbiAgLy8gZXZlbnQgbGlzdGVuZXIgdG8gY2xvc2UgdGhlIGRpYWxvZ1xuICBjb25zdCAkZWwgPSB0aGlzLiRlbDtcblxuICB0aGlzLl9jbG9zZXJzID0gJCQoJ1tkYXRhLWExMXktZGlhbG9nLWhpZGVdJywgdGhpcy4kZWwpXG4gICAgLy8gVGhpcyBmaWx0ZXIgaXMgbmVjZXNzYXJ5IGluIGNhc2UgdGhlcmUgYXJlIG5lc3RlZCBkaWFsb2dzLCBzbyB0aGF0XG4gICAgLy8gb25seSBjbG9zZXJzIGZyb20gdGhlIGN1cnJlbnQgZGlhbG9nIGFyZSByZXRyaWV2ZWQgYW5kIGVmZmVjdGl2ZVxuICAgIC5maWx0ZXIoZnVuY3Rpb24gKGNsb3Nlcikge1xuICAgICAgLy8gVGVzdGluZyBmb3IgYFthcmlhLW1vZGFsPVwidHJ1ZVwiXWAgaXMgbm90IGVub3VnaCBzaW5jZSB0aGlzIGF0dHJpYnV0ZVxuICAgICAgLy8gYW5kIHRoZSBjb2xsZWN0IG9mIGNsb3NlcnMgaXMgZG9uZSBhdCBpbnN0YW50YXRpb24gdGltZSwgd2hlbiBuZXN0ZWRcbiAgICAgIC8vIGRpYWxvZ3MgbWlnaHQgbm90IGhhdmUgeWV0IGJlZW4gaW5zdGFudGlhdGVkLiBOb3RlIHRoYXQgaWYgdGhlIGRpYWxvZ3NcbiAgICAgIC8vIGFyZSBtYW51YWxseSBpbnN0YW50aWF0ZWQsIHRoaXMgY291bGQgc3RpbGwgZmFpbCBiZWNhdXNlIG5vbmUgb2YgdGhlc2VcbiAgICAgIC8vIHNlbGVjdG9ycyB3b3VsZCBtYXRjaDsgdGhpcyB3b3VsZCBjYXVzZSBjbG9zZXJzIHRvIGNsb3NlIGFsbCBwYXJlbnRcbiAgICAgIC8vIGRpYWxvZ3MgaW5zdGVhZCBvZiBqdXN0IHRoZSBjdXJyZW50IG9uZVxuICAgICAgcmV0dXJuIGNsb3Nlci5jbG9zZXN0KCdbYXJpYS1tb2RhbD1cInRydWVcIl0sIFtkYXRhLWExMXktZGlhbG9nXScpID09PSAkZWxcbiAgICB9KVxuICAgIC5jb25jYXQoJCQoJ1tkYXRhLWExMXktZGlhbG9nLWhpZGU9XCInICsgdGhpcy5faWQgKyAnXCJdJykpO1xuXG4gIHRoaXMuX2Nsb3NlcnMuZm9yRWFjaChcbiAgICBmdW5jdGlvbiAoY2xvc2VyKSB7XG4gICAgICBjbG9zZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLl9oaWRlKTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcblxuICAvLyBFeGVjdXRlIGFsbCBjYWxsYmFja3MgcmVnaXN0ZXJlZCBmb3IgdGhlIGBjcmVhdGVgIGV2ZW50XG4gIHRoaXMuX2ZpcmUoJ2NyZWF0ZScpO1xuXG4gIHJldHVybiB0aGlzXG59O1xuXG4vKipcbiAqIFNob3cgdGhlIGRpYWxvZyBlbGVtZW50LCBkaXNhYmxlIGFsbCB0aGUgdGFyZ2V0cyAoc2libGluZ3MpLCB0cmFwIHRoZVxuICogY3VycmVudCBmb2N1cyB3aXRoaW4gaXQsIGxpc3RlbiBmb3Igc29tZSBzcGVjaWZpYyBrZXkgcHJlc3NlcyBhbmQgZmlyZSBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzIGZvciBgc2hvd2AgZXZlbnRcbiAqXG4gKiBAcGFyYW0ge0N1c3RvbUV2ZW50fSBldmVudFxuICogQHJldHVybiB7dGhpc31cbiAqL1xuQTExeURpYWxvZy5wcm90b3R5cGUuc2hvdyA9IGZ1bmN0aW9uIChldmVudCkge1xuICAvLyBJZiB0aGUgZGlhbG9nIGlzIGFscmVhZHkgb3BlbiwgYWJvcnRcbiAgaWYgKHRoaXMuc2hvd24pIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gS2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudGx5IGZvY3VzZWQgZWxlbWVudCB0byBiZSBhYmxlIHRvIHJlc3RvcmVcbiAgLy8gaXQgbGF0ZXJcbiAgdGhpcy5fcHJldmlvdXNseUZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICB0aGlzLiRlbC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG4gIHRoaXMuc2hvd24gPSB0cnVlO1xuXG4gIC8vIFNldCB0aGUgZm9jdXMgdG8gdGhlIGRpYWxvZyBlbGVtZW50XG4gIG1vdmVGb2N1c1RvRGlhbG9nKHRoaXMuJGVsKTtcblxuICAvLyBCaW5kIGEgZm9jdXMgZXZlbnQgbGlzdGVuZXIgdG8gdGhlIGJvZHkgZWxlbWVudCB0byBtYWtlIHN1cmUgdGhlIGZvY3VzXG4gIC8vIHN0YXlzIHRyYXBwZWQgaW5zaWRlIHRoZSBkaWFsb2cgd2hpbGUgb3BlbiwgYW5kIHN0YXJ0IGxpc3RlbmluZyBmb3Igc29tZVxuICAvLyBzcGVjaWZpYyBrZXkgcHJlc3NlcyAoVEFCIGFuZCBFU0MpXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCB0aGlzLl9tYWludGFpbkZvY3VzLCB0cnVlKTtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuX2JpbmRLZXlwcmVzcyk7XG5cbiAgLy8gRXhlY3V0ZSBhbGwgY2FsbGJhY2tzIHJlZ2lzdGVyZWQgZm9yIHRoZSBgc2hvd2AgZXZlbnRcbiAgdGhpcy5fZmlyZSgnc2hvdycsIGV2ZW50KTtcblxuICByZXR1cm4gdGhpc1xufTtcblxuLyoqXG4gKiBIaWRlIHRoZSBkaWFsb2cgZWxlbWVudCwgZW5hYmxlIGFsbCB0aGUgdGFyZ2V0cyAoc2libGluZ3MpLCByZXN0b3JlIHRoZVxuICogZm9jdXMgdG8gdGhlIHByZXZpb3VzbHkgYWN0aXZlIGVsZW1lbnQsIHN0b3AgbGlzdGVuaW5nIGZvciBzb21lIHNwZWNpZmljXG4gKiBrZXkgcHJlc3NlcyBhbmQgZmlyZSBhbGwgcmVnaXN0ZXJlZCBjYWxsYmFja3MgZm9yIGBoaWRlYCBldmVudFxuICpcbiAqIEBwYXJhbSB7Q3VzdG9tRXZlbnR9IGV2ZW50XG4gKiBAcmV0dXJuIHt0aGlzfVxuICovXG5BMTF5RGlhbG9nLnByb3RvdHlwZS5oaWRlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIC8vIElmIHRoZSBkaWFsb2cgaXMgYWxyZWFkeSBjbG9zZWQsIGFib3J0XG4gIGlmICghdGhpcy5zaG93bikge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICB0aGlzLnNob3duID0gZmFsc2U7XG4gIHRoaXMuJGVsLnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xuXG4gIC8vIElmIHRoZXJlIHdhcyBhIGZvY3VzZWQgZWxlbWVudCBiZWZvcmUgdGhlIGRpYWxvZyB3YXMgb3BlbmVkIChhbmQgaXQgaGFzIGFcbiAgLy8gYGZvY3VzYCBtZXRob2QpLCByZXN0b3JlIHRoZSBmb2N1cyBiYWNrIHRvIGl0XG4gIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL0tpdHR5R2lyYXVkZWwvYTExeS1kaWFsb2cvaXNzdWVzLzEwOFxuICBpZiAodGhpcy5fcHJldmlvdXNseUZvY3VzZWQgJiYgdGhpcy5fcHJldmlvdXNseUZvY3VzZWQuZm9jdXMpIHtcbiAgICB0aGlzLl9wcmV2aW91c2x5Rm9jdXNlZC5mb2N1cygpO1xuICB9XG5cbiAgLy8gUmVtb3ZlIHRoZSBmb2N1cyBldmVudCBsaXN0ZW5lciB0byB0aGUgYm9keSBlbGVtZW50IGFuZCBzdG9wIGxpc3RlbmluZ1xuICAvLyBmb3Igc3BlY2lmaWMga2V5IHByZXNzZXNcbiAgZG9jdW1lbnQuYm9keS5yZW1vdmVFdmVudExpc3RlbmVyKCdmb2N1cycsIHRoaXMuX21haW50YWluRm9jdXMsIHRydWUpO1xuICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5fYmluZEtleXByZXNzKTtcblxuICAvLyBFeGVjdXRlIGFsbCBjYWxsYmFja3MgcmVnaXN0ZXJlZCBmb3IgdGhlIGBoaWRlYCBldmVudFxuICB0aGlzLl9maXJlKCdoaWRlJywgZXZlbnQpO1xuXG4gIHJldHVybiB0aGlzXG59O1xuXG4vKipcbiAqIERlc3Ryb3kgdGhlIGN1cnJlbnQgaW5zdGFuY2UgKGFmdGVyIG1ha2luZyBzdXJlIHRoZSBkaWFsb2cgaGFzIGJlZW4gaGlkZGVuKVxuICogYW5kIHJlbW92ZSBhbGwgYXNzb2NpYXRlZCBsaXN0ZW5lcnMgZnJvbSBkaWFsb2cgb3BlbmVycyBhbmQgY2xvc2Vyc1xuICpcbiAqIEByZXR1cm4ge3RoaXN9XG4gKi9cbkExMXlEaWFsb2cucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIEhpZGUgdGhlIGRpYWxvZyB0byBhdm9pZCBkZXN0cm95aW5nIGFuIG9wZW4gaW5zdGFuY2VcbiAgdGhpcy5oaWRlKCk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBjbGljayBldmVudCBsaXN0ZW5lciBmcm9tIGFsbCBkaWFsb2cgb3BlbmVyc1xuICB0aGlzLl9vcGVuZXJzLmZvckVhY2goXG4gICAgZnVuY3Rpb24gKG9wZW5lcikge1xuICAgICAgb3BlbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5fc2hvdyk7XG4gICAgfS5iaW5kKHRoaXMpXG4gICk7XG5cbiAgLy8gUmVtb3ZlIHRoZSBjbGljayBldmVudCBsaXN0ZW5lciBmcm9tIGFsbCBkaWFsb2cgY2xvc2Vyc1xuICB0aGlzLl9jbG9zZXJzLmZvckVhY2goXG4gICAgZnVuY3Rpb24gKGNsb3Nlcikge1xuICAgICAgY2xvc2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5faGlkZSk7XG4gICAgfS5iaW5kKHRoaXMpXG4gICk7XG5cbiAgLy8gRXhlY3V0ZSBhbGwgY2FsbGJhY2tzIHJlZ2lzdGVyZWQgZm9yIHRoZSBgZGVzdHJveWAgZXZlbnRcbiAgdGhpcy5fZmlyZSgnZGVzdHJveScpO1xuXG4gIC8vIEtlZXAgYW4gb2JqZWN0IG9mIGxpc3RlbmVyIHR5cGVzIG1hcHBlZCB0byBjYWxsYmFjayBmdW5jdGlvbnNcbiAgdGhpcy5fbGlzdGVuZXJzID0ge307XG5cbiAgcmV0dXJuIHRoaXNcbn07XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBuZXcgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAqL1xuQTExeURpYWxvZy5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAodHlwZSwgaGFuZGxlcikge1xuICBpZiAodHlwZW9mIHRoaXMuX2xpc3RlbmVyc1t0eXBlXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB0aGlzLl9saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgfVxuXG4gIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5wdXNoKGhhbmRsZXIpO1xuXG4gIHJldHVybiB0aGlzXG59O1xuXG4vKipcbiAqIFVucmVnaXN0ZXIgYW4gZXhpc3RpbmcgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiBldmVudCB0eXBlXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAqL1xuQTExeURpYWxvZy5wcm90b3R5cGUub2ZmID0gZnVuY3Rpb24gKHR5cGUsIGhhbmRsZXIpIHtcbiAgdmFyIGluZGV4ID0gKHRoaXMuX2xpc3RlbmVyc1t0eXBlXSB8fCBbXSkuaW5kZXhPZihoYW5kbGVyKTtcblxuICBpZiAoaW5kZXggPiAtMSkge1xuICAgIHRoaXMuX2xpc3RlbmVyc1t0eXBlXS5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn07XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGFsbCByZWdpc3RlcmVkIGhhbmRsZXJzIGZvciBnaXZlbiB0eXBlIGFuZCBjYWxsIHRoZW0gYWxsIHdpdGhcbiAqIHRoZSBkaWFsb2cgZWxlbWVudCBhcyBmaXJzdCBhcmd1bWVudCwgZXZlbnQgYXMgc2Vjb25kIGFyZ3VtZW50IChpZiBhbnkpLiBBbHNvXG4gKiBkaXNwYXRjaCBhIGN1c3RvbSBldmVudCBvbiB0aGUgRE9NIGVsZW1lbnQgaXRzZWxmIHRvIG1ha2UgaXQgcG9zc2libGUgdG9cbiAqIHJlYWN0IHRvIHRoZSBsaWZlY3ljbGUgb2YgYXV0by1pbnN0YW50aWF0ZWQgZGlhbG9ncy5cbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlXG4gKiBAcGFyYW0ge0N1c3RvbUV2ZW50fSBldmVudFxuICovXG5BMTF5RGlhbG9nLnByb3RvdHlwZS5fZmlyZSA9IGZ1bmN0aW9uICh0eXBlLCBldmVudCkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fbGlzdGVuZXJzW3R5cGVdIHx8IFtdO1xuICB2YXIgZG9tRXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQodHlwZSwgeyBkZXRhaWw6IGV2ZW50IH0pO1xuXG4gIHRoaXMuJGVsLmRpc3BhdGNoRXZlbnQoZG9tRXZlbnQpO1xuXG4gIGxpc3RlbmVycy5mb3JFYWNoKFxuICAgIGZ1bmN0aW9uIChsaXN0ZW5lcikge1xuICAgICAgbGlzdGVuZXIodGhpcy4kZWwsIGV2ZW50KTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcbn07XG5cbi8qKlxuICogUHJpdmF0ZSBldmVudCBoYW5kbGVyIHVzZWQgd2hlbiBsaXN0ZW5pbmcgdG8gc29tZSBzcGVjaWZpYyBrZXkgcHJlc3Nlc1xuICogKG5hbWVseSBFU0NBUEUgYW5kIFRBQilcbiAqXG4gKiBAYWNjZXNzIHByaXZhdGVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKi9cbkExMXlEaWFsb2cucHJvdG90eXBlLl9iaW5kS2V5cHJlc3MgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgLy8gVGhpcyBpcyBhbiBlc2NhcGUgaGF0Y2ggaW4gY2FzZSB0aGVyZSBhcmUgbmVzdGVkIGRpYWxvZ3MsIHNvIHRoZSBrZXlwcmVzc2VzXG4gIC8vIGFyZSBvbmx5IHJlYWN0ZWQgdG8gZm9yIHRoZSBtb3N0IHJlY2VudCBvbmVcbiAgY29uc3QgZm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIGlmIChmb2N1c2VkICYmIGZvY3VzZWQuY2xvc2VzdCgnW2FyaWEtbW9kYWw9XCJ0cnVlXCJdJykgIT09IHRoaXMuJGVsKSByZXR1cm5cblxuICAvLyBJZiB0aGUgZGlhbG9nIGlzIHNob3duIGFuZCB0aGUgRVNDQVBFIGtleSBpcyBiZWluZyBwcmVzc2VkLCBwcmV2ZW50IGFueVxuICAvLyBmdXJ0aGVyIGVmZmVjdHMgZnJvbSB0aGUgRVNDQVBFIGtleSBhbmQgaGlkZSB0aGUgZGlhbG9nLCB1bmxlc3MgaXRzIHJvbGVcbiAgLy8gaXMgJ2FsZXJ0ZGlhbG9nJywgd2hpY2ggc2hvdWxkIGJlIG1vZGFsXG4gIGlmIChcbiAgICB0aGlzLnNob3duICYmXG4gICAgZXZlbnQua2V5ID09PSBFU0NBUEVfS0VZICYmXG4gICAgdGhpcy4kZWwuZ2V0QXR0cmlidXRlKCdyb2xlJykgIT09ICdhbGVydGRpYWxvZydcbiAgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmhpZGUoZXZlbnQpO1xuICB9XG5cbiAgLy8gSWYgdGhlIGRpYWxvZyBpcyBzaG93biBhbmQgdGhlIFRBQiBrZXkgaXMgYmVpbmcgcHJlc3NlZCwgbWFrZSBzdXJlIHRoZVxuICAvLyBmb2N1cyBzdGF5cyB0cmFwcGVkIHdpdGhpbiB0aGUgZGlhbG9nIGVsZW1lbnRcbiAgaWYgKHRoaXMuc2hvd24gJiYgZXZlbnQua2V5ID09PSBUQUJfS0VZKSB7XG4gICAgdHJhcFRhYktleSh0aGlzLiRlbCwgZXZlbnQpO1xuICB9XG59O1xuXG4vKipcbiAqIFByaXZhdGUgZXZlbnQgaGFuZGxlciB1c2VkIHdoZW4gbWFraW5nIHN1cmUgdGhlIGZvY3VzIHN0YXlzIHdpdGhpbiB0aGVcbiAqIGN1cnJlbnRseSBvcGVuIGRpYWxvZ1xuICpcbiAqIEBhY2Nlc3MgcHJpdmF0ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqL1xuQTExeURpYWxvZy5wcm90b3R5cGUuX21haW50YWluRm9jdXMgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgLy8gSWYgdGhlIGRpYWxvZyBpcyBzaG93biBhbmQgdGhlIGZvY3VzIGlzIG5vdCB3aXRoaW4gYSBkaWFsb2cgZWxlbWVudCAoZWl0aGVyXG4gIC8vIHRoaXMgb25lIG9yIGFub3RoZXIgb25lIGluIGNhc2Ugb2YgbmVzdGVkIGRpYWxvZ3MpIG9yIHdpdGhpbiBhbiBlbGVtZW50XG4gIC8vIHdpdGggdGhlIGBkYXRhLWExMXktZGlhbG9nLWZvY3VzLXRyYXAtaWdub3JlYCBhdHRyaWJ1dGUsIG1vdmUgaXQgYmFjayB0b1xuICAvLyBpdHMgZmlyc3QgZm9jdXNhYmxlIGNoaWxkLlxuICAvLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9LaXR0eUdpcmF1ZGVsL2ExMXktZGlhbG9nL2lzc3Vlcy8xNzdcbiAgaWYgKFxuICAgIHRoaXMuc2hvd24gJiZcbiAgICAhZXZlbnQudGFyZ2V0LmNsb3Nlc3QoJ1thcmlhLW1vZGFsPVwidHJ1ZVwiXScpICYmXG4gICAgIWV2ZW50LnRhcmdldC5jbG9zZXN0KCdbZGF0YS1hMTF5LWRpYWxvZy1pZ25vcmUtZm9jdXMtdHJhcF0nKVxuICApIHtcbiAgICBtb3ZlRm9jdXNUb0RpYWxvZyh0aGlzLiRlbCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ29udmVydCBhIE5vZGVMaXN0IGludG8gYW4gYXJyYXlcbiAqXG4gKiBAcGFyYW0ge05vZGVMaXN0fSBjb2xsZWN0aW9uXG4gKiBAcmV0dXJuIHtBcnJheTxFbGVtZW50Pn1cbiAqL1xuZnVuY3Rpb24gdG9BcnJheShjb2xsZWN0aW9uKSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChjb2xsZWN0aW9uKVxufVxuXG4vKipcbiAqIFF1ZXJ5IHRoZSBET00gZm9yIG5vZGVzIG1hdGNoaW5nIHRoZSBnaXZlbiBzZWxlY3Rvciwgc2NvcGVkIHRvIGNvbnRleHQgKG9yXG4gKiB0aGUgd2hvbGUgZG9jdW1lbnQpXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge0VsZW1lbnR9IFtjb250ZXh0ID0gZG9jdW1lbnRdXG4gKiBAcmV0dXJuIHtBcnJheTxFbGVtZW50Pn1cbiAqL1xuZnVuY3Rpb24gJCQoc2VsZWN0b3IsIGNvbnRleHQpIHtcbiAgcmV0dXJuIHRvQXJyYXkoKGNvbnRleHQgfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKVxufVxuXG4vKipcbiAqIFNldCB0aGUgZm9jdXMgdG8gdGhlIGZpcnN0IGVsZW1lbnQgd2l0aCBgYXV0b2ZvY3VzYCB3aXRoIHRoZSBlbGVtZW50IG9yIHRoZVxuICogZWxlbWVudCBpdHNlbGZcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqL1xuZnVuY3Rpb24gbW92ZUZvY3VzVG9EaWFsb2cobm9kZSkge1xuICB2YXIgZm9jdXNlZCA9IG5vZGUucXVlcnlTZWxlY3RvcignW2F1dG9mb2N1c10nKSB8fCBub2RlO1xuXG4gIGZvY3VzZWQuZm9jdXMoKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZvY3VzYWJsZSBjaGlsZHJlbiBvZiB0aGUgZ2l2ZW4gZWxlbWVudFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gbm9kZVxuICogQHJldHVybiB7QXJyYXk8RWxlbWVudD59XG4gKi9cbmZ1bmN0aW9uIGdldEZvY3VzYWJsZUNoaWxkcmVuKG5vZGUpIHtcbiAgcmV0dXJuICQkKGZvY3VzYWJsZVNlbGVjdG9ycy5qb2luKCcsJyksIG5vZGUpLmZpbHRlcihmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICByZXR1cm4gISEoXG4gICAgICBjaGlsZC5vZmZzZXRXaWR0aCB8fFxuICAgICAgY2hpbGQub2Zmc2V0SGVpZ2h0IHx8XG4gICAgICBjaGlsZC5nZXRDbGllbnRSZWN0cygpLmxlbmd0aFxuICAgIClcbiAgfSlcbn1cblxuLyoqXG4gKiBUcmFwIHRoZSBmb2N1cyBpbnNpZGUgdGhlIGdpdmVuIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG5vZGVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKi9cbmZ1bmN0aW9uIHRyYXBUYWJLZXkobm9kZSwgZXZlbnQpIHtcbiAgdmFyIGZvY3VzYWJsZUNoaWxkcmVuID0gZ2V0Rm9jdXNhYmxlQ2hpbGRyZW4obm9kZSk7XG4gIHZhciBmb2N1c2VkSXRlbUluZGV4ID0gZm9jdXNhYmxlQ2hpbGRyZW4uaW5kZXhPZihkb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcblxuICAvLyBJZiB0aGUgU0hJRlQga2V5IGlzIGJlaW5nIHByZXNzZWQgd2hpbGUgdGFiYmluZyAobW92aW5nIGJhY2t3YXJkcykgYW5kXG4gIC8vIHRoZSBjdXJyZW50bHkgZm9jdXNlZCBpdGVtIGlzIHRoZSBmaXJzdCBvbmUsIG1vdmUgdGhlIGZvY3VzIHRvIHRoZSBsYXN0XG4gIC8vIGZvY3VzYWJsZSBpdGVtIGZyb20gdGhlIGRpYWxvZyBlbGVtZW50XG4gIGlmIChldmVudC5zaGlmdEtleSAmJiBmb2N1c2VkSXRlbUluZGV4ID09PSAwKSB7XG4gICAgZm9jdXNhYmxlQ2hpbGRyZW5bZm9jdXNhYmxlQ2hpbGRyZW4ubGVuZ3RoIC0gMV0uZm9jdXMoKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIC8vIElmIHRoZSBTSElGVCBrZXkgaXMgbm90IGJlaW5nIHByZXNzZWQgKG1vdmluZyBmb3J3YXJkcykgYW5kIHRoZSBjdXJyZW50bHlcbiAgICAvLyBmb2N1c2VkIGl0ZW0gaXMgdGhlIGxhc3Qgb25lLCBtb3ZlIHRoZSBmb2N1cyB0byB0aGUgZmlyc3QgZm9jdXNhYmxlIGl0ZW1cbiAgICAvLyBmcm9tIHRoZSBkaWFsb2cgZWxlbWVudFxuICB9IGVsc2UgaWYgKFxuICAgICFldmVudC5zaGlmdEtleSAmJlxuICAgIGZvY3VzZWRJdGVtSW5kZXggPT09IGZvY3VzYWJsZUNoaWxkcmVuLmxlbmd0aCAtIDFcbiAgKSB7XG4gICAgZm9jdXNhYmxlQ2hpbGRyZW5bMF0uZm9jdXMoKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGluc3RhbnRpYXRlRGlhbG9ncygpIHtcbiAgJCQoJ1tkYXRhLWExMXktZGlhbG9nXScpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICBuZXcgQTExeURpYWxvZyhub2RlKTtcbiAgfSk7XG59XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09PSAnbG9hZGluZycpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5zdGFudGlhdGVEaWFsb2dzKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSkge1xuICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShpbnN0YW50aWF0ZURpYWxvZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aW5kb3cuc2V0VGltZW91dChpbnN0YW50aWF0ZURpYWxvZ3MsIDE2KTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgQTExeURpYWxvZyBhcyBkZWZhdWx0IH07XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvc291cmNlTWFwcy5qc1wiO1xuaW1wb3J0IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyBmcm9tIFwiLi4vY3NzLWxvYWRlci9kaXN0L3J1bnRpbWUvYXBpLmpzXCI7XG52YXIgX19fQ1NTX0xPQURFUl9FWFBPUlRfX18gPSBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18oX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCIvKiEgbm9ybWFsaXplLmNzcyB2OC4wLjEgfCBNSVQgTGljZW5zZSB8IGdpdGh1Yi5jb20vbmVjb2xhcy9ub3JtYWxpemUuY3NzICovXFxuXFxuLyogRG9jdW1lbnRcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cXG4gKiAyLiBQcmV2ZW50IGFkanVzdG1lbnRzIG9mIGZvbnQgc2l6ZSBhZnRlciBvcmllbnRhdGlvbiBjaGFuZ2VzIGluIGlPUy5cXG4gKi9cXG5cXG5odG1sIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXFxuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cXG59XFxuXFxuLyogU2VjdGlvbnNcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcblxcbi8qKlxcbiAqIFJlbW92ZSB0aGUgbWFyZ2luIGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5ib2R5IHtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuLyoqXFxuICogUmVuZGVyIHRoZSBgbWFpbmAgZWxlbWVudCBjb25zaXN0ZW50bHkgaW4gSUUuXFxuICovXFxuXFxubWFpbiB7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuXFxuLyoqXFxuICogQ29ycmVjdCB0aGUgZm9udCBzaXplIGFuZCBtYXJnaW4gb24gYGgxYCBlbGVtZW50cyB3aXRoaW4gYHNlY3Rpb25gIGFuZFxcbiAqIGBhcnRpY2xlYCBjb250ZXh0cyBpbiBDaHJvbWUsIEZpcmVmb3gsIGFuZCBTYWZhcmkuXFxuICovXFxuXFxuaDEge1xcbiAgZm9udC1zaXplOiAyZW07XFxuICBtYXJnaW46IDAuNjdlbSAwO1xcbn1cXG5cXG4vKiBHcm91cGluZyBjb250ZW50XFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG5cXG4vKipcXG4gKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBGaXJlZm94LlxcbiAqIDIuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UgYW5kIElFLlxcbiAqL1xcblxcbmhyIHtcXG4gIGJveC1zaXppbmc6IGNvbnRlbnQtYm94OyAvKiAxICovXFxuICBoZWlnaHQ6IDA7IC8qIDEgKi9cXG4gIG92ZXJmbG93OiB2aXNpYmxlOyAvKiAyICovXFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIGFuZCBzY2FsaW5nIG9mIGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXFxuICogMi4gQ29ycmVjdCB0aGUgb2RkIGBlbWAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxcbiAqL1xcblxcbnByZSB7XFxuICBmb250LWZhbWlseTogbW9ub3NwYWNlLCBtb25vc3BhY2U7IC8qIDEgKi9cXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXFxufVxcblxcbi8qIFRleHQtbGV2ZWwgc2VtYW50aWNzXFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG5cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGdyYXkgYmFja2dyb3VuZCBvbiBhY3RpdmUgbGlua3MgaW4gSUUgMTAuXFxuICovXFxuXFxuYSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG59XFxuXFxuLyoqXFxuICogMS4gUmVtb3ZlIHRoZSBib3R0b20gYm9yZGVyIGluIENocm9tZSA1Ny1cXG4gKiAyLiBBZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgSUUsIE9wZXJhLCBhbmQgU2FmYXJpLlxcbiAqL1xcblxcbmFiYnJbdGl0bGVdIHtcXG4gIGJvcmRlci1ib3R0b206IG5vbmU7IC8qIDEgKi9cXG4gIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyAvKiAyICovXFxuICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7IC8qIDIgKi9cXG59XFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgd2VpZ2h0IGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cXG4gKi9cXG5cXG5iLFxcbnN0cm9uZyB7XFxuICBmb250LXdlaWdodDogYm9sZGVyO1xcbn1cXG5cXG4vKipcXG4gKiAxLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBhbmQgc2NhbGluZyBvZiBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxcbiAqIDIuIENvcnJlY3QgdGhlIG9kZCBgZW1gIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5jb2RlLFxcbmtiZCxcXG5zYW1wIHtcXG4gIGZvbnQtZmFtaWx5OiBtb25vc3BhY2UsIG1vbm9zcGFjZTsgLyogMSAqL1xcbiAgZm9udC1zaXplOiAxZW07IC8qIDIgKi9cXG59XFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXFxuICovXFxuXFxuc21hbGwge1xcbiAgZm9udC1zaXplOiA4MCU7XFxufVxcblxcbi8qKlxcbiAqIFByZXZlbnQgYHN1YmAgYW5kIGBzdXBgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpblxcbiAqIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5zdWIsXFxuc3VwIHtcXG4gIGZvbnQtc2l6ZTogNzUlO1xcbiAgbGluZS1oZWlnaHQ6IDA7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcblxcbnN1YiB7XFxuICBib3R0b206IC0wLjI1ZW07XFxufVxcblxcbnN1cCB7XFxuICB0b3A6IC0wLjVlbTtcXG59XFxuXFxuLyogRW1iZWRkZWQgY29udGVudFxcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogUmVtb3ZlIHRoZSBib3JkZXIgb24gaW1hZ2VzIGluc2lkZSBsaW5rcyBpbiBJRSAxMC5cXG4gKi9cXG5cXG5pbWcge1xcbiAgYm9yZGVyLXN0eWxlOiBub25lO1xcbn1cXG5cXG4vKiBGb3Jtc1xcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXFxuICogMi4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gRmlyZWZveCBhbmQgU2FmYXJpLlxcbiAqL1xcblxcbmJ1dHRvbixcXG5pbnB1dCxcXG5vcHRncm91cCxcXG5zZWxlY3QsXFxudGV4dGFyZWEge1xcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cXG4gIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xcbiAgbGluZS1oZWlnaHQ6IDEuMTU7IC8qIDEgKi9cXG4gIG1hcmdpbjogMDsgLyogMiAqL1xcbn1cXG5cXG4vKipcXG4gKiBTaG93IHRoZSBvdmVyZmxvdyBpbiBJRS5cXG4gKiAxLiBTaG93IHRoZSBvdmVyZmxvdyBpbiBFZGdlLlxcbiAqL1xcblxcbmJ1dHRvbixcXG5pbnB1dCB7IC8qIDEgKi9cXG4gIG92ZXJmbG93OiB2aXNpYmxlO1xcbn1cXG5cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEVkZ2UsIEZpcmVmb3gsIGFuZCBJRS5cXG4gKiAxLiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEZpcmVmb3guXFxuICovXFxuXFxuYnV0dG9uLFxcbnNlbGVjdCB7IC8qIDEgKi9cXG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xcbn1cXG5cXG4vKipcXG4gKiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxcbiAqL1xcblxcbmJ1dHRvbixcXG5bdHlwZT1cXFwiYnV0dG9uXFxcIl0sXFxuW3R5cGU9XFxcInJlc2V0XFxcIl0sXFxuW3R5cGU9XFxcInN1Ym1pdFxcXCJdIHtcXG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uO1xcbn1cXG5cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGlubmVyIGJvcmRlciBhbmQgcGFkZGluZyBpbiBGaXJlZm94LlxcbiAqL1xcblxcbmJ1dHRvbjo6LW1vei1mb2N1cy1pbm5lcixcXG5bdHlwZT1cXFwiYnV0dG9uXFxcIl06Oi1tb3otZm9jdXMtaW5uZXIsXFxuW3R5cGU9XFxcInJlc2V0XFxcIl06Oi1tb3otZm9jdXMtaW5uZXIsXFxuW3R5cGU9XFxcInN1Ym1pdFxcXCJdOjotbW96LWZvY3VzLWlubmVyIHtcXG4gIGJvcmRlci1zdHlsZTogbm9uZTtcXG4gIHBhZGRpbmc6IDA7XFxufVxcblxcbi8qKlxcbiAqIFJlc3RvcmUgdGhlIGZvY3VzIHN0eWxlcyB1bnNldCBieSB0aGUgcHJldmlvdXMgcnVsZS5cXG4gKi9cXG5cXG5idXR0b246LW1vei1mb2N1c3JpbmcsXFxuW3R5cGU9XFxcImJ1dHRvblxcXCJdOi1tb3otZm9jdXNyaW5nLFxcblt0eXBlPVxcXCJyZXNldFxcXCJdOi1tb3otZm9jdXNyaW5nLFxcblt0eXBlPVxcXCJzdWJtaXRcXFwiXTotbW96LWZvY3VzcmluZyB7XFxuICBvdXRsaW5lOiAxcHggZG90dGVkIEJ1dHRvblRleHQ7XFxufVxcblxcbi8qKlxcbiAqIENvcnJlY3QgdGhlIHBhZGRpbmcgaW4gRmlyZWZveC5cXG4gKi9cXG5cXG5maWVsZHNldCB7XFxuICBwYWRkaW5nOiAwLjM1ZW0gMC43NWVtIDAuNjI1ZW07XFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIHRleHQgd3JhcHBpbmcgaW4gRWRnZSBhbmQgSUUuXFxuICogMi4gQ29ycmVjdCB0aGUgY29sb3IgaW5oZXJpdGFuY2UgZnJvbSBgZmllbGRzZXRgIGVsZW1lbnRzIGluIElFLlxcbiAqIDMuIFJlbW92ZSB0aGUgcGFkZGluZyBzbyBkZXZlbG9wZXJzIGFyZSBub3QgY2F1Z2h0IG91dCB3aGVuIHRoZXkgemVybyBvdXRcXG4gKiAgICBgZmllbGRzZXRgIGVsZW1lbnRzIGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5sZWdlbmQge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xcbiAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cXG4gIGRpc3BsYXk6IHRhYmxlOyAvKiAxICovXFxuICBtYXgtd2lkdGg6IDEwMCU7IC8qIDEgKi9cXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cXG4gIHdoaXRlLXNwYWNlOiBub3JtYWw7IC8qIDEgKi9cXG59XFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IHZlcnRpY2FsIGFsaWdubWVudCBpbiBDaHJvbWUsIEZpcmVmb3gsIGFuZCBPcGVyYS5cXG4gKi9cXG5cXG5wcm9ncmVzcyB7XFxuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcblxcbi8qKlxcbiAqIFJlbW92ZSB0aGUgZGVmYXVsdCB2ZXJ0aWNhbCBzY3JvbGxiYXIgaW4gSUUgMTArLlxcbiAqL1xcblxcbnRleHRhcmVhIHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbn1cXG5cXG4vKipcXG4gKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBJRSAxMC5cXG4gKiAyLiBSZW1vdmUgdGhlIHBhZGRpbmcgaW4gSUUgMTAuXFxuICovXFxuXFxuW3R5cGU9XFxcImNoZWNrYm94XFxcIl0sXFxuW3R5cGU9XFxcInJhZGlvXFxcIl0ge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xcbiAgcGFkZGluZzogMDsgLyogMiAqL1xcbn1cXG5cXG4vKipcXG4gKiBDb3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBDaHJvbWUuXFxuICovXFxuXFxuW3R5cGU9XFxcIm51bWJlclxcXCJdOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uLFxcblt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XFxuICBoZWlnaHQ6IGF1dG87XFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIG9kZCBhcHBlYXJhbmNlIGluIENocm9tZSBhbmQgU2FmYXJpLlxcbiAqIDIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxcbiAqL1xcblxcblt0eXBlPVxcXCJzZWFyY2hcXFwiXSB7XFxuICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xcbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cXG59XFxuXFxuLyoqXFxuICogUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxcbiAqL1xcblxcblt0eXBlPVxcXCJzZWFyY2hcXFwiXTo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XFxuICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXFxuICogMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBgaW5oZXJpdGAgaW4gU2FmYXJpLlxcbiAqL1xcblxcbjo6LXdlYmtpdC1maWxlLXVwbG9hZC1idXR0b24ge1xcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cXG59XFxuXFxuLyogSW50ZXJhY3RpdmVcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcblxcbi8qXFxuICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gRWRnZSwgSUUgMTArLCBhbmQgRmlyZWZveC5cXG4gKi9cXG5cXG5kZXRhaWxzIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5cXG4vKlxcbiAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5zdW1tYXJ5IHtcXG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcXG59XFxuXFxuLyogTWlzY1xcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gSUUgMTArLlxcbiAqL1xcblxcbnRlbXBsYXRlIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi8qKlxcbiAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIElFIDEwLlxcbiAqL1xcblxcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblwiLCBcIlwiLHtcInZlcnNpb25cIjozLFwic291cmNlc1wiOltcIndlYnBhY2s6Ly8uL25vZGVfbW9kdWxlcy9ub3JtYWxpemUuY3NzL25vcm1hbGl6ZS5jc3NcIl0sXCJuYW1lc1wiOltdLFwibWFwcGluZ3NcIjpcIkFBQUEsMkVBQTJFOztBQUUzRTsrRUFDK0U7O0FBRS9FOzs7RUFHRTs7QUFFRjtFQUNFLGlCQUFpQixFQUFFLE1BQU07RUFDekIsOEJBQThC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QUFFRjtFQUNFLGFBQWE7QUFDZlwiLFwic291cmNlc0NvbnRlbnRcIjpbXCIvKiEgbm9ybWFsaXplLmNzcyB2OC4wLjEgfCBNSVQgTGljZW5zZSB8IGdpdGh1Yi5jb20vbmVjb2xhcy9ub3JtYWxpemUuY3NzICovXFxuXFxuLyogRG9jdW1lbnRcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGxpbmUgaGVpZ2h0IGluIGFsbCBicm93c2Vycy5cXG4gKiAyLiBQcmV2ZW50IGFkanVzdG1lbnRzIG9mIGZvbnQgc2l6ZSBhZnRlciBvcmllbnRhdGlvbiBjaGFuZ2VzIGluIGlPUy5cXG4gKi9cXG5cXG5odG1sIHtcXG4gIGxpbmUtaGVpZ2h0OiAxLjE1OyAvKiAxICovXFxuICAtd2Via2l0LXRleHQtc2l6ZS1hZGp1c3Q6IDEwMCU7IC8qIDIgKi9cXG59XFxuXFxuLyogU2VjdGlvbnNcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcblxcbi8qKlxcbiAqIFJlbW92ZSB0aGUgbWFyZ2luIGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5ib2R5IHtcXG4gIG1hcmdpbjogMDtcXG59XFxuXFxuLyoqXFxuICogUmVuZGVyIHRoZSBgbWFpbmAgZWxlbWVudCBjb25zaXN0ZW50bHkgaW4gSUUuXFxuICovXFxuXFxubWFpbiB7XFxuICBkaXNwbGF5OiBibG9jaztcXG59XFxuXFxuLyoqXFxuICogQ29ycmVjdCB0aGUgZm9udCBzaXplIGFuZCBtYXJnaW4gb24gYGgxYCBlbGVtZW50cyB3aXRoaW4gYHNlY3Rpb25gIGFuZFxcbiAqIGBhcnRpY2xlYCBjb250ZXh0cyBpbiBDaHJvbWUsIEZpcmVmb3gsIGFuZCBTYWZhcmkuXFxuICovXFxuXFxuaDEge1xcbiAgZm9udC1zaXplOiAyZW07XFxuICBtYXJnaW46IDAuNjdlbSAwO1xcbn1cXG5cXG4vKiBHcm91cGluZyBjb250ZW50XFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG5cXG4vKipcXG4gKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBGaXJlZm94LlxcbiAqIDIuIFNob3cgdGhlIG92ZXJmbG93IGluIEVkZ2UgYW5kIElFLlxcbiAqL1xcblxcbmhyIHtcXG4gIGJveC1zaXppbmc6IGNvbnRlbnQtYm94OyAvKiAxICovXFxuICBoZWlnaHQ6IDA7IC8qIDEgKi9cXG4gIG92ZXJmbG93OiB2aXNpYmxlOyAvKiAyICovXFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGluaGVyaXRhbmNlIGFuZCBzY2FsaW5nIG9mIGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXFxuICogMi4gQ29ycmVjdCB0aGUgb2RkIGBlbWAgZm9udCBzaXppbmcgaW4gYWxsIGJyb3dzZXJzLlxcbiAqL1xcblxcbnByZSB7XFxuICBmb250LWZhbWlseTogbW9ub3NwYWNlLCBtb25vc3BhY2U7IC8qIDEgKi9cXG4gIGZvbnQtc2l6ZTogMWVtOyAvKiAyICovXFxufVxcblxcbi8qIFRleHQtbGV2ZWwgc2VtYW50aWNzXFxuICAgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cXG5cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGdyYXkgYmFja2dyb3VuZCBvbiBhY3RpdmUgbGlua3MgaW4gSUUgMTAuXFxuICovXFxuXFxuYSB7XFxuICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG59XFxuXFxuLyoqXFxuICogMS4gUmVtb3ZlIHRoZSBib3R0b20gYm9yZGVyIGluIENocm9tZSA1Ny1cXG4gKiAyLiBBZGQgdGhlIGNvcnJlY3QgdGV4dCBkZWNvcmF0aW9uIGluIENocm9tZSwgRWRnZSwgSUUsIE9wZXJhLCBhbmQgU2FmYXJpLlxcbiAqL1xcblxcbmFiYnJbdGl0bGVdIHtcXG4gIGJvcmRlci1ib3R0b206IG5vbmU7IC8qIDEgKi9cXG4gIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lOyAvKiAyICovXFxuICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSBkb3R0ZWQ7IC8qIDIgKi9cXG59XFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgd2VpZ2h0IGluIENocm9tZSwgRWRnZSwgYW5kIFNhZmFyaS5cXG4gKi9cXG5cXG5iLFxcbnN0cm9uZyB7XFxuICBmb250LXdlaWdodDogYm9sZGVyO1xcbn1cXG5cXG4vKipcXG4gKiAxLiBDb3JyZWN0IHRoZSBpbmhlcml0YW5jZSBhbmQgc2NhbGluZyBvZiBmb250IHNpemUgaW4gYWxsIGJyb3dzZXJzLlxcbiAqIDIuIENvcnJlY3QgdGhlIG9kZCBgZW1gIGZvbnQgc2l6aW5nIGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5jb2RlLFxcbmtiZCxcXG5zYW1wIHtcXG4gIGZvbnQtZmFtaWx5OiBtb25vc3BhY2UsIG1vbm9zcGFjZTsgLyogMSAqL1xcbiAgZm9udC1zaXplOiAxZW07IC8qIDIgKi9cXG59XFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IGZvbnQgc2l6ZSBpbiBhbGwgYnJvd3NlcnMuXFxuICovXFxuXFxuc21hbGwge1xcbiAgZm9udC1zaXplOiA4MCU7XFxufVxcblxcbi8qKlxcbiAqIFByZXZlbnQgYHN1YmAgYW5kIGBzdXBgIGVsZW1lbnRzIGZyb20gYWZmZWN0aW5nIHRoZSBsaW5lIGhlaWdodCBpblxcbiAqIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5zdWIsXFxuc3VwIHtcXG4gIGZvbnQtc2l6ZTogNzUlO1xcbiAgbGluZS1oZWlnaHQ6IDA7XFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcblxcbnN1YiB7XFxuICBib3R0b206IC0wLjI1ZW07XFxufVxcblxcbnN1cCB7XFxuICB0b3A6IC0wLjVlbTtcXG59XFxuXFxuLyogRW1iZWRkZWQgY29udGVudFxcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogUmVtb3ZlIHRoZSBib3JkZXIgb24gaW1hZ2VzIGluc2lkZSBsaW5rcyBpbiBJRSAxMC5cXG4gKi9cXG5cXG5pbWcge1xcbiAgYm9yZGVyLXN0eWxlOiBub25lO1xcbn1cXG5cXG4vKiBGb3Jtc1xcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogMS4gQ2hhbmdlIHRoZSBmb250IHN0eWxlcyBpbiBhbGwgYnJvd3NlcnMuXFxuICogMi4gUmVtb3ZlIHRoZSBtYXJnaW4gaW4gRmlyZWZveCBhbmQgU2FmYXJpLlxcbiAqL1xcblxcbmJ1dHRvbixcXG5pbnB1dCxcXG5vcHRncm91cCxcXG5zZWxlY3QsXFxudGV4dGFyZWEge1xcbiAgZm9udC1mYW1pbHk6IGluaGVyaXQ7IC8qIDEgKi9cXG4gIGZvbnQtc2l6ZTogMTAwJTsgLyogMSAqL1xcbiAgbGluZS1oZWlnaHQ6IDEuMTU7IC8qIDEgKi9cXG4gIG1hcmdpbjogMDsgLyogMiAqL1xcbn1cXG5cXG4vKipcXG4gKiBTaG93IHRoZSBvdmVyZmxvdyBpbiBJRS5cXG4gKiAxLiBTaG93IHRoZSBvdmVyZmxvdyBpbiBFZGdlLlxcbiAqL1xcblxcbmJ1dHRvbixcXG5pbnB1dCB7IC8qIDEgKi9cXG4gIG92ZXJmbG93OiB2aXNpYmxlO1xcbn1cXG5cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEVkZ2UsIEZpcmVmb3gsIGFuZCBJRS5cXG4gKiAxLiBSZW1vdmUgdGhlIGluaGVyaXRhbmNlIG9mIHRleHQgdHJhbnNmb3JtIGluIEZpcmVmb3guXFxuICovXFxuXFxuYnV0dG9uLFxcbnNlbGVjdCB7IC8qIDEgKi9cXG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xcbn1cXG5cXG4vKipcXG4gKiBDb3JyZWN0IHRoZSBpbmFiaWxpdHkgdG8gc3R5bGUgY2xpY2thYmxlIHR5cGVzIGluIGlPUyBhbmQgU2FmYXJpLlxcbiAqL1xcblxcbmJ1dHRvbixcXG5bdHlwZT1cXFwiYnV0dG9uXFxcIl0sXFxuW3R5cGU9XFxcInJlc2V0XFxcIl0sXFxuW3R5cGU9XFxcInN1Ym1pdFxcXCJdIHtcXG4gIC13ZWJraXQtYXBwZWFyYW5jZTogYnV0dG9uO1xcbn1cXG5cXG4vKipcXG4gKiBSZW1vdmUgdGhlIGlubmVyIGJvcmRlciBhbmQgcGFkZGluZyBpbiBGaXJlZm94LlxcbiAqL1xcblxcbmJ1dHRvbjo6LW1vei1mb2N1cy1pbm5lcixcXG5bdHlwZT1cXFwiYnV0dG9uXFxcIl06Oi1tb3otZm9jdXMtaW5uZXIsXFxuW3R5cGU9XFxcInJlc2V0XFxcIl06Oi1tb3otZm9jdXMtaW5uZXIsXFxuW3R5cGU9XFxcInN1Ym1pdFxcXCJdOjotbW96LWZvY3VzLWlubmVyIHtcXG4gIGJvcmRlci1zdHlsZTogbm9uZTtcXG4gIHBhZGRpbmc6IDA7XFxufVxcblxcbi8qKlxcbiAqIFJlc3RvcmUgdGhlIGZvY3VzIHN0eWxlcyB1bnNldCBieSB0aGUgcHJldmlvdXMgcnVsZS5cXG4gKi9cXG5cXG5idXR0b246LW1vei1mb2N1c3JpbmcsXFxuW3R5cGU9XFxcImJ1dHRvblxcXCJdOi1tb3otZm9jdXNyaW5nLFxcblt0eXBlPVxcXCJyZXNldFxcXCJdOi1tb3otZm9jdXNyaW5nLFxcblt0eXBlPVxcXCJzdWJtaXRcXFwiXTotbW96LWZvY3VzcmluZyB7XFxuICBvdXRsaW5lOiAxcHggZG90dGVkIEJ1dHRvblRleHQ7XFxufVxcblxcbi8qKlxcbiAqIENvcnJlY3QgdGhlIHBhZGRpbmcgaW4gRmlyZWZveC5cXG4gKi9cXG5cXG5maWVsZHNldCB7XFxuICBwYWRkaW5nOiAwLjM1ZW0gMC43NWVtIDAuNjI1ZW07XFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIHRleHQgd3JhcHBpbmcgaW4gRWRnZSBhbmQgSUUuXFxuICogMi4gQ29ycmVjdCB0aGUgY29sb3IgaW5oZXJpdGFuY2UgZnJvbSBgZmllbGRzZXRgIGVsZW1lbnRzIGluIElFLlxcbiAqIDMuIFJlbW92ZSB0aGUgcGFkZGluZyBzbyBkZXZlbG9wZXJzIGFyZSBub3QgY2F1Z2h0IG91dCB3aGVuIHRoZXkgemVybyBvdXRcXG4gKiAgICBgZmllbGRzZXRgIGVsZW1lbnRzIGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5sZWdlbmQge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xcbiAgY29sb3I6IGluaGVyaXQ7IC8qIDIgKi9cXG4gIGRpc3BsYXk6IHRhYmxlOyAvKiAxICovXFxuICBtYXgtd2lkdGg6IDEwMCU7IC8qIDEgKi9cXG4gIHBhZGRpbmc6IDA7IC8qIDMgKi9cXG4gIHdoaXRlLXNwYWNlOiBub3JtYWw7IC8qIDEgKi9cXG59XFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IHZlcnRpY2FsIGFsaWdubWVudCBpbiBDaHJvbWUsIEZpcmVmb3gsIGFuZCBPcGVyYS5cXG4gKi9cXG5cXG5wcm9ncmVzcyB7XFxuICB2ZXJ0aWNhbC1hbGlnbjogYmFzZWxpbmU7XFxufVxcblxcbi8qKlxcbiAqIFJlbW92ZSB0aGUgZGVmYXVsdCB2ZXJ0aWNhbCBzY3JvbGxiYXIgaW4gSUUgMTArLlxcbiAqL1xcblxcbnRleHRhcmVhIHtcXG4gIG92ZXJmbG93OiBhdXRvO1xcbn1cXG5cXG4vKipcXG4gKiAxLiBBZGQgdGhlIGNvcnJlY3QgYm94IHNpemluZyBpbiBJRSAxMC5cXG4gKiAyLiBSZW1vdmUgdGhlIHBhZGRpbmcgaW4gSUUgMTAuXFxuICovXFxuXFxuW3R5cGU9XFxcImNoZWNrYm94XFxcIl0sXFxuW3R5cGU9XFxcInJhZGlvXFxcIl0ge1xcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDsgLyogMSAqL1xcbiAgcGFkZGluZzogMDsgLyogMiAqL1xcbn1cXG5cXG4vKipcXG4gKiBDb3JyZWN0IHRoZSBjdXJzb3Igc3R5bGUgb2YgaW5jcmVtZW50IGFuZCBkZWNyZW1lbnQgYnV0dG9ucyBpbiBDaHJvbWUuXFxuICovXFxuXFxuW3R5cGU9XFxcIm51bWJlclxcXCJdOjotd2Via2l0LWlubmVyLXNwaW4tYnV0dG9uLFxcblt0eXBlPVxcXCJudW1iZXJcXFwiXTo6LXdlYmtpdC1vdXRlci1zcGluLWJ1dHRvbiB7XFxuICBoZWlnaHQ6IGF1dG87XFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIG9kZCBhcHBlYXJhbmNlIGluIENocm9tZSBhbmQgU2FmYXJpLlxcbiAqIDIuIENvcnJlY3QgdGhlIG91dGxpbmUgc3R5bGUgaW4gU2FmYXJpLlxcbiAqL1xcblxcblt0eXBlPVxcXCJzZWFyY2hcXFwiXSB7XFxuICAtd2Via2l0LWFwcGVhcmFuY2U6IHRleHRmaWVsZDsgLyogMSAqL1xcbiAgb3V0bGluZS1vZmZzZXQ6IC0ycHg7IC8qIDIgKi9cXG59XFxuXFxuLyoqXFxuICogUmVtb3ZlIHRoZSBpbm5lciBwYWRkaW5nIGluIENocm9tZSBhbmQgU2FmYXJpIG9uIG1hY09TLlxcbiAqL1xcblxcblt0eXBlPVxcXCJzZWFyY2hcXFwiXTo6LXdlYmtpdC1zZWFyY2gtZGVjb3JhdGlvbiB7XFxuICAtd2Via2l0LWFwcGVhcmFuY2U6IG5vbmU7XFxufVxcblxcbi8qKlxcbiAqIDEuIENvcnJlY3QgdGhlIGluYWJpbGl0eSB0byBzdHlsZSBjbGlja2FibGUgdHlwZXMgaW4gaU9TIGFuZCBTYWZhcmkuXFxuICogMi4gQ2hhbmdlIGZvbnQgcHJvcGVydGllcyB0byBgaW5oZXJpdGAgaW4gU2FmYXJpLlxcbiAqL1xcblxcbjo6LXdlYmtpdC1maWxlLXVwbG9hZC1idXR0b24ge1xcbiAgLXdlYmtpdC1hcHBlYXJhbmNlOiBidXR0b247IC8qIDEgKi9cXG4gIGZvbnQ6IGluaGVyaXQ7IC8qIDIgKi9cXG59XFxuXFxuLyogSW50ZXJhY3RpdmVcXG4gICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAqL1xcblxcbi8qXFxuICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gRWRnZSwgSUUgMTArLCBhbmQgRmlyZWZveC5cXG4gKi9cXG5cXG5kZXRhaWxzIHtcXG4gIGRpc3BsYXk6IGJsb2NrO1xcbn1cXG5cXG4vKlxcbiAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIGFsbCBicm93c2Vycy5cXG4gKi9cXG5cXG5zdW1tYXJ5IHtcXG4gIGRpc3BsYXk6IGxpc3QtaXRlbTtcXG59XFxuXFxuLyogTWlzY1xcbiAgID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXFxuXFxuLyoqXFxuICogQWRkIHRoZSBjb3JyZWN0IGRpc3BsYXkgaW4gSUUgMTArLlxcbiAqL1xcblxcbnRlbXBsYXRlIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblxcbi8qKlxcbiAqIEFkZCB0aGUgY29ycmVjdCBkaXNwbGF5IGluIElFIDEwLlxcbiAqL1xcblxcbltoaWRkZW5dIHtcXG4gIGRpc3BsYXk6IG5vbmU7XFxufVxcblwiXSxcInNvdXJjZVJvb3RcIjpcIlwifV0pO1xuLy8gRXhwb3J0c1xuZXhwb3J0IGRlZmF1bHQgX19fQ1NTX0xPQURFUl9FWFBPUlRfX187XG4iLCIvLyBJbXBvcnRzXG5pbXBvcnQgX19fQ1NTX0xPQURFUl9BUElfU09VUkNFTUFQX0lNUE9SVF9fXyBmcm9tIFwiLi4vbm9kZV9tb2R1bGVzL2Nzcy1sb2FkZXIvZGlzdC9ydW50aW1lL3NvdXJjZU1hcHMuanNcIjtcbmltcG9ydCBfX19DU1NfTE9BREVSX0FQSV9JTVBPUlRfX18gZnJvbSBcIi4uL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2Rpc3QvcnVudGltZS9hcGkuanNcIjtcbnZhciBfX19DU1NfTE9BREVSX0VYUE9SVF9fXyA9IF9fX0NTU19MT0FERVJfQVBJX0lNUE9SVF9fXyhfX19DU1NfTE9BREVSX0FQSV9TT1VSQ0VNQVBfSU1QT1JUX19fKTtcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCJAaW1wb3J0IHVybChodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PVJvYm90byZkaXNwbGF5PXN3YXApO1wiXSk7XG4vLyBNb2R1bGVcbl9fX0NTU19MT0FERVJfRVhQT1JUX19fLnB1c2goW21vZHVsZS5pZCwgXCI6cm9vdCB7XFxuICBmb250LWZhbWlseTogXFxcIlJvYm90b1xcXCIgc2Fucy1zZXJpZjtcXG59XFxuXFxuLmljb24ge1xcbiAgZGlzcGxheTogZ3JpZDtcXG4gIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XFxufVxcblxcbkBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNDI1cHgpIHtcXG4gIGJvZHkge1xcbiAgICB3aWR0aDogMTAwdnc7XFxuICAgIGhlaWdodDogMTAwdmg7XFxuICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICB9XFxuICBoZWFkZXIge1xcbiAgICBtYXJnaW4tdG9wOiBhdXRvO1xcbiAgICB3aWR0aDogODAlO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBhbGlnbi1pdGVtczogZmxleC1lbmQ7XFxuICAgIGdhcDogMTBweDtcXG4gIH1cXG4gIGhlYWRlciBhIHtcXG4gICAgZmxleDogMTtcXG4gIH1cXG4gIGhlYWRlciBhIGJ1dHRvbiB7XFxuICAgIHdpZHRoOiAxMDAlO1xcbiAgfVxcbiAgaGVhZGVyIC5hZGQtaGFiaXQge1xcbiAgICBmbGV4OiAwIDAgNTBweDtcXG4gICAgaGVpZ2h0OiA1MHB4O1xcbiAgICBmb250LXNpemU6IDIuNXJlbTtcXG4gIH1cXG4gIC5kaWFsb2ctY29udGFpbmVyIHtcXG4gICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcXG4gICAgdG9wOiAwO1xcbiAgICBib3R0b206IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIHJpZ2h0OiAwO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgfVxcbiAgLmRpYWxvZy1jb250YWluZXJbYXJpYS1oaWRkZW49dHJ1ZV0ge1xcbiAgICBkaXNwbGF5OiBub25lO1xcbiAgfVxcbiAgLmRpYWxvZy1vdmVybGF5IHtcXG4gICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICB0b3A6IDA7XFxuICAgIGxlZnQ6IDA7XFxuICAgIGJvdHRvbTogMDtcXG4gICAgcmlnaHQ6IDA7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoNDMsIDQ2LCA1NiwgMC42OTIpO1xcbiAgfVxcbiAgLmRpYWxvZy1jb250ZW50IHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiKDI1NSwgMjU1LCAyNTUpO1xcbiAgICB6LWluZGV4OiAyO1xcbiAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICB9XFxuICAjcGljay1oYWJpdCAuZGlhbG9nLWNvbnRlbnQge1xcbiAgICB3aWR0aDogMTAwJTtcXG4gICAgZGlzcGxheTogZmxleDtcXG4gICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgIGJvcmRlci1yYWRpdXM6IDEwcHggMTBweCAwIDA7XFxuICAgIGJhY2tncm91bmQtY29sb3I6IHRyYW5zcGFyZW50O1xcbiAgfVxcbiAgI3BpY2staGFiaXQgLmhhYml0LXR5cGUge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODQ5KTtcXG4gICAgY29sb3I6IHdoaXRlO1xcbiAgICBkaXNwbGF5OiBncmlkO1xcbiAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDQwcHggMWZyIDQwcHg7XFxuICAgIGdyaWQtdGVtcGxhdGUtcm93czogcmVwZWF0KDIsIDQwcHgpO1xcbiAgICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXFwiaWNvbiB0aXRsZSBsZWFkaW5nLWFycm93XFxcIiBcXFwiaWNvbiBkZXNjcmlwdGlvbiBsZWFkaW5nLWFycm93XFxcIjtcXG4gICAgZ2FwOiAwIDEwcHg7XFxuICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XFxuICB9XFxuICAjcGljay1oYWJpdCAuaGFiaXQtdHlwZSAuaWNvbiB7XFxuICAgIGdyaWQtYXJlYTogaWNvbjtcXG4gICAgY29sb3I6IGFxdWFtYXJpbmU7XFxuICB9XFxuICAjcGljay1oYWJpdCAuaGFiaXQtdHlwZSAudGl0bGUge1xcbiAgICBncmlkLWFyZWE6IHRpdGxlO1xcbiAgICBqdXN0aWZ5LXNlbGY6IHN0YXJ0O1xcbiAgfVxcbiAgI3BpY2staGFiaXQgLmhhYml0LXR5cGUgLmxlYWRpbmctYXJyb3cge1xcbiAgICBncmlkLWFyZWE6IGxlYWRpbmctYXJyb3c7XFxuICAgIGFsaWduLXNlbGY6IHN0cmV0Y2g7XFxuICB9XFxuICAjcGljay1oYWJpdCAuaGFiaXQtdHlwZSAuZGVzY3JpcHRpb24ge1xcbiAgICBncmlkLWFyZWE6IGRlc2NyaXB0aW9uO1xcbiAgICBqdXN0aWZ5LXNlbGY6IHN0YXJ0O1xcbiAgfVxcbiAgI3BpY2staGFiaXQgLmhhYml0LXR5cGU6Zmlyc3QtY2hpbGQge1xcbiAgICBib3JkZXItcmFkaXVzOiAxMHB4IDEwcHggMCAwO1xcbiAgfVxcbn1cIiwgXCJcIix7XCJ2ZXJzaW9uXCI6MyxcInNvdXJjZXNcIjpbXCJ3ZWJwYWNrOi8vLi9zcmMvbWFpbi5zY3NzXCJdLFwibmFtZXNcIjpbXSxcIm1hcHBpbmdzXCI6XCJBQUNBO0VBQ0ksZ0NBQUE7QUFDSjs7QUFDQTtFQUNJLGFBQUE7RUFDQSxtQkFBQTtBQUVKOztBQUNBO0VBQ0k7SUFDSSxZQUFBO0lBQ0EsYUFBQTtJQUVBLGFBQUE7SUFDQSxzQkFBQTtJQUNBLG1CQUFBO0VBQ047RUFFRTtJQUNJLGdCQUFBO0lBRUEsVUFBQTtJQUVBLGFBQUE7SUFDQSxxQkFBQTtJQUNBLFNBQUE7RUFGTjtFQUlNO0lBQ0ksT0FBQTtFQUZWO0VBSVU7SUFDSSxXQUFBO0VBRmQ7RUFNTTtJQUNJLGNBQUE7SUFFQSxZQUFBO0lBRUEsaUJBQUE7RUFOVjtFQVVFO0lBQ0ksZUFBQTtJQUNBLGFBQUE7SUFDQSx1QkFBQTtJQUNBLG1CQUFBO0lBRUEsTUFBQTtJQUNBLFNBQUE7SUFDQSxPQUFBO0lBQ0EsUUFBQTtJQUNBLFVBQUE7RUFUTjtFQVlFO0lBQ0ksYUFBQTtFQVZOO0VBYUU7SUFDSSxlQUFBO0lBQ0EsTUFBQTtJQUNBLE9BQUE7SUFDQSxTQUFBO0lBQ0EsUUFBQTtJQUNBLHlDQUFBO0VBWE47RUFjRTtJQUNJLG9DQUFBO0lBQ0EsVUFBQTtJQUNBLGtCQUFBO0VBWk47RUFnQk07SUFDSSxXQUFBO0lBRUEsYUFBQTtJQUNBLHNCQUFBO0lBRUEsb0JBQUE7SUFDQSw0QkFBQTtJQUNBLDZCQUFBO0VBaEJWO0VBbUJNO0lBQ0ksc0NBQUE7SUFDQSxZQUFBO0lBRUEsYUFBQTtJQUNBLG9DQUFBO0lBQ0EsbUNBQUE7SUFDQSxnRkFDQTtJQUVBLFdBQUE7SUFDQSxtQkFBQTtFQXBCVjtFQXNCVTtJQUNJLGVBQUE7SUFDQSxpQkFBQTtFQXBCZDtFQXVCVTtJQUNJLGdCQUFBO0lBQ0EsbUJBQUE7RUFyQmQ7RUF3QlU7SUFDSSx3QkFBQTtJQUNBLG1CQUFBO0VBdEJkO0VBeUJVO0lBQ0ksc0JBQUE7SUFDQSxtQkFBQTtFQXZCZDtFQTJCTTtJQUNJLDRCQUFBO0VBekJWO0FBQ0ZcIixcInNvdXJjZXNDb250ZW50XCI6W1wiQGltcG9ydCB1cmwoJ2h0dHBzOi8vZm9udHMuZ29vZ2xlYXBpcy5jb20vY3NzMj9mYW1pbHk9Um9ib3RvJmRpc3BsYXk9c3dhcCcpO1xcbjpyb290IHtcXG4gICAgZm9udC1mYW1pbHk6ICdSb2JvdG8nIHNhbnMtc2VyaWY7XFxufVxcbi5pY29uIHtcXG4gICAgZGlzcGxheTogZ3JpZDtcXG4gICAgcGxhY2UtaXRlbXM6IGNlbnRlcjtcXG59XFxuXFxuQG1lZGlhIG9ubHkgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiA0MjVweCkge1xcbiAgICBib2R5IHtcXG4gICAgICAgIHdpZHRoOiAxMDB2dztcXG4gICAgICAgIGhlaWdodDogMTAwdmg7XFxuXFxuICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuICAgIH1cXG5cXG4gICAgaGVhZGVyIHtcXG4gICAgICAgIG1hcmdpbi10b3A6IGF1dG87XFxuXFxuICAgICAgICB3aWR0aDogODAlO1xcblxcbiAgICAgICAgZGlzcGxheTogZmxleDtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBmbGV4LWVuZDtcXG4gICAgICAgIGdhcDogMTBweDtcXG5cXG4gICAgICAgIGEge1xcbiAgICAgICAgICAgIGZsZXg6IDE7XFxuXFxuICAgICAgICAgICAgYnV0dG9uIHtcXG4gICAgICAgICAgICAgICAgd2lkdGg6IDEwMCU7XFxuICAgICAgICAgICAgfVxcbiAgICAgICAgfVxcblxcbiAgICAgICAgLmFkZC1oYWJpdCB7XFxuICAgICAgICAgICAgZmxleDogMCAwIDUwcHg7XFxuXFxuICAgICAgICAgICAgaGVpZ2h0OiA1MHB4O1xcblxcbiAgICAgICAgICAgIGZvbnQtc2l6ZTogMi41cmVtO1xcbiAgICAgICAgfVxcbiAgICB9XFxuXFxuICAgIC5kaWFsb2ctY29udGFpbmVyIHtcXG4gICAgICAgIHBvc2l0aW9uOiBmaXhlZDtcXG4gICAgICAgIGRpc3BsYXk6IGZsZXg7XFxuICAgICAgICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcXG4gICAgICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XFxuXFxuICAgICAgICB0b3A6IDA7XFxuICAgICAgICBib3R0b206IDA7XFxuICAgICAgICBsZWZ0OiAwO1xcbiAgICAgICAgcmlnaHQ6IDA7XFxuICAgICAgICB6LWluZGV4OiAyO1xcbiAgICB9XFxuXFxuICAgIC5kaWFsb2ctY29udGFpbmVyW2FyaWEtaGlkZGVuPSd0cnVlJ10ge1xcbiAgICAgICAgZGlzcGxheTogbm9uZTtcXG4gICAgfVxcblxcbiAgICAuZGlhbG9nLW92ZXJsYXkge1xcbiAgICAgICAgcG9zaXRpb246IGZpeGVkO1xcbiAgICAgICAgdG9wOiAwO1xcbiAgICAgICAgbGVmdDogMDtcXG4gICAgICAgIGJvdHRvbTogMDtcXG4gICAgICAgIHJpZ2h0OiAwO1xcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSg0MywgNDYsIDU2LCAwLjY5Mik7XFxuICAgIH1cXG5cXG4gICAgLmRpYWxvZy1jb250ZW50IHtcXG4gICAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYigyNTUsIDI1NSwgMjU1KTtcXG4gICAgICAgIHotaW5kZXg6IDI7XFxuICAgICAgICBwb3NpdGlvbjogcmVsYXRpdmU7XFxuICAgIH1cXG5cXG4gICAgI3BpY2staGFiaXQge1xcbiAgICAgICAgLmRpYWxvZy1jb250ZW50IHtcXG4gICAgICAgICAgICB3aWR0aDogMTAwJTtcXG5cXG4gICAgICAgICAgICBkaXNwbGF5OiBmbGV4O1xcbiAgICAgICAgICAgIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XFxuXFxuICAgICAgICAgICAgYWxpZ24tc2VsZjogZmxleC1lbmQ7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweCAxMHB4IDAgMDtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiB0cmFuc3BhcmVudDtcXG4gICAgICAgIH1cXG5cXG4gICAgICAgIC5oYWJpdC10eXBlIHtcXG4gICAgICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiByZ2JhKDAsIDAsIDAsIDAuODQ5KTtcXG4gICAgICAgICAgICBjb2xvcjogd2hpdGU7XFxuXFxuICAgICAgICAgICAgZGlzcGxheTogZ3JpZDtcXG4gICAgICAgICAgICBncmlkLXRlbXBsYXRlLWNvbHVtbnM6IDQwcHggMWZyIDQwcHg7XFxuICAgICAgICAgICAgZ3JpZC10ZW1wbGF0ZS1yb3dzOiByZXBlYXQoMiw0MHB4KTtcXG4gICAgICAgICAgICBncmlkLXRlbXBsYXRlLWFyZWFzOiBcXG4gICAgICAgICAgICBcXFwiaWNvbiB0aXRsZSBsZWFkaW5nLWFycm93XFxcIlxcbiAgICAgICAgICAgIFxcXCJpY29uIGRlc2NyaXB0aW9uIGxlYWRpbmctYXJyb3dcXFwiO1xcbiAgICAgICAgICAgIGdhcDogMCAxMHB4O1xcbiAgICAgICAgICAgIHBsYWNlLWl0ZW1zOiBjZW50ZXI7XFxuXFxuICAgICAgICAgICAgLmljb24ge1xcbiAgICAgICAgICAgICAgICBncmlkLWFyZWE6IGljb247XFxuICAgICAgICAgICAgICAgIGNvbG9yOiBhcXVhbWFyaW5lO1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICAudGl0bGUge1xcbiAgICAgICAgICAgICAgICBncmlkLWFyZWE6IHRpdGxlO1xcbiAgICAgICAgICAgICAgICBqdXN0aWZ5LXNlbGY6IHN0YXJ0O1xcbiAgICAgICAgICAgIH1cXG5cXG4gICAgICAgICAgICAubGVhZGluZy1hcnJvdyB7XFxuICAgICAgICAgICAgICAgIGdyaWQtYXJlYTogbGVhZGluZy1hcnJvdztcXG4gICAgICAgICAgICAgICAgYWxpZ24tc2VsZjogc3RyZXRjaDtcXG4gICAgICAgICAgICB9XFxuXFxuICAgICAgICAgICAgLmRlc2NyaXB0aW9uIHtcXG4gICAgICAgICAgICAgICAgZ3JpZC1hcmVhOiBkZXNjcmlwdGlvbjtcXG4gICAgICAgICAgICAgICAganVzdGlmeS1zZWxmOiBzdGFydDtcXG4gICAgICAgICAgICB9XFxuICAgICAgICB9XFxuXFxuICAgICAgICAuaGFiaXQtdHlwZTpmaXJzdC1jaGlsZCB7XFxuICAgICAgICAgICAgYm9yZGVyLXJhZGl1czogMTBweCAxMHB4IDAgMDtcXG4gICAgICAgIH1cXG4gICAgfVxcbn1cXG5cXG5cXG5cIl0sXCJzb3VyY2VSb290XCI6XCJcIn1dKTtcbi8vIEV4cG9ydHNcbmV4cG9ydCBkZWZhdWx0IF9fX0NTU19MT0FERVJfRVhQT1JUX19fO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qXG4gIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gIEF1dGhvciBUb2JpYXMgS29wcGVycyBAc29rcmFcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjc3NXaXRoTWFwcGluZ1RvU3RyaW5nKSB7XG4gIHZhciBsaXN0ID0gW107IC8vIHJldHVybiB0aGUgbGlzdCBvZiBtb2R1bGVzIGFzIGNzcyBzdHJpbmdcblxuICBsaXN0LnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICB2YXIgY29udGVudCA9IFwiXCI7XG4gICAgICB2YXIgbmVlZExheWVyID0gdHlwZW9mIGl0ZW1bNV0gIT09IFwidW5kZWZpbmVkXCI7XG5cbiAgICAgIGlmIChpdGVtWzRdKSB7XG4gICAgICAgIGNvbnRlbnQgKz0gXCJAc3VwcG9ydHMgKFwiLmNvbmNhdChpdGVtWzRdLCBcIikge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGl0ZW1bMl0pIHtcbiAgICAgICAgY29udGVudCArPSBcIkBtZWRpYSBcIi5jb25jYXQoaXRlbVsyXSwgXCIge1wiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwiQGxheWVyXCIuY29uY2F0KGl0ZW1bNV0ubGVuZ3RoID4gMCA/IFwiIFwiLmNvbmNhdChpdGVtWzVdKSA6IFwiXCIsIFwiIHtcIik7XG4gICAgICB9XG5cbiAgICAgIGNvbnRlbnQgKz0gY3NzV2l0aE1hcHBpbmdUb1N0cmluZyhpdGVtKTtcblxuICAgICAgaWYgKG5lZWRMYXllcikge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVsyXSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXRlbVs0XSkge1xuICAgICAgICBjb250ZW50ICs9IFwifVwiO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY29udGVudDtcbiAgICB9KS5qb2luKFwiXCIpO1xuICB9OyAvLyBpbXBvcnQgYSBsaXN0IG9mIG1vZHVsZXMgaW50byB0aGUgbGlzdFxuXG5cbiAgbGlzdC5pID0gZnVuY3Rpb24gaShtb2R1bGVzLCBtZWRpYSwgZGVkdXBlLCBzdXBwb3J0cywgbGF5ZXIpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZXMgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIG1vZHVsZXMgPSBbW251bGwsIG1vZHVsZXMsIHVuZGVmaW5lZF1dO1xuICAgIH1cblxuICAgIHZhciBhbHJlYWR5SW1wb3J0ZWRNb2R1bGVzID0ge307XG5cbiAgICBpZiAoZGVkdXBlKSB7XG4gICAgICBmb3IgKHZhciBrID0gMDsgayA8IHRoaXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGlkID0gdGhpc1trXVswXTtcblxuICAgICAgICBpZiAoaWQgIT0gbnVsbCkge1xuICAgICAgICAgIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaWRdID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIF9rID0gMDsgX2sgPCBtb2R1bGVzLmxlbmd0aDsgX2srKykge1xuICAgICAgdmFyIGl0ZW0gPSBbXS5jb25jYXQobW9kdWxlc1tfa10pO1xuXG4gICAgICBpZiAoZGVkdXBlICYmIGFscmVhZHlJbXBvcnRlZE1vZHVsZXNbaXRlbVswXV0pIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbGF5ZXIgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVtWzVdID09PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBsYXllclwiLmNvbmNhdChpdGVtWzVdLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQoaXRlbVs1XSkgOiBcIlwiLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs1XSA9IGxheWVyO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICBpZiAoIWl0ZW1bMl0pIHtcbiAgICAgICAgICBpdGVtWzJdID0gbWVkaWE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaXRlbVsxXSA9IFwiQG1lZGlhIFwiLmNvbmNhdChpdGVtWzJdLCBcIiB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVsyXSA9IG1lZGlhO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzdXBwb3J0cykge1xuICAgICAgICBpZiAoIWl0ZW1bNF0pIHtcbiAgICAgICAgICBpdGVtWzRdID0gXCJcIi5jb25jYXQoc3VwcG9ydHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGl0ZW1bMV0gPSBcIkBzdXBwb3J0cyAoXCIuY29uY2F0KGl0ZW1bNF0sIFwiKSB7XCIpLmNvbmNhdChpdGVtWzFdLCBcIn1cIik7XG4gICAgICAgICAgaXRlbVs0XSA9IHN1cHBvcnRzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxpc3QucHVzaChpdGVtKTtcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGxpc3Q7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gIHZhciBjb250ZW50ID0gaXRlbVsxXTtcbiAgdmFyIGNzc01hcHBpbmcgPSBpdGVtWzNdO1xuXG4gIGlmICghY3NzTWFwcGluZykge1xuICAgIHJldHVybiBjb250ZW50O1xuICB9XG5cbiAgaWYgKHR5cGVvZiBidG9hID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICB2YXIgYmFzZTY0ID0gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoY3NzTWFwcGluZykpKSk7XG4gICAgdmFyIGRhdGEgPSBcInNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LFwiLmNvbmNhdChiYXNlNjQpO1xuICAgIHZhciBzb3VyY2VNYXBwaW5nID0gXCIvKiMgXCIuY29uY2F0KGRhdGEsIFwiICovXCIpO1xuICAgIHZhciBzb3VyY2VVUkxzID0gY3NzTWFwcGluZy5zb3VyY2VzLm1hcChmdW5jdGlvbiAoc291cmNlKSB7XG4gICAgICByZXR1cm4gXCIvKiMgc291cmNlVVJMPVwiLmNvbmNhdChjc3NNYXBwaW5nLnNvdXJjZVJvb3QgfHwgXCJcIikuY29uY2F0KHNvdXJjZSwgXCIgKi9cIik7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtjb250ZW50XS5jb25jYXQoc291cmNlVVJMcykuY29uY2F0KFtzb3VyY2VNYXBwaW5nXSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIHJldHVybiBbY29udGVudF0uam9pbihcIlxcblwiKTtcbn07IiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9pbmplY3RTdHlsZXNJbnRvU3R5bGVUYWcuanNcIjtcbiAgICAgIGltcG9ydCBkb21BUEkgZnJvbSBcIiEuLi9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlRG9tQVBJLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0Rm4gZnJvbSBcIiEuLi9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vc3R5bGUtbG9hZGVyL2Rpc3QvcnVudGltZS9zZXRBdHRyaWJ1dGVzV2l0aG91dEF0dHJpYnV0ZXMuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRTdHlsZUVsZW1lbnQgZnJvbSBcIiEuLi9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydFN0eWxlRWxlbWVudC5qc1wiO1xuICAgICAgaW1wb3J0IHN0eWxlVGFnVHJhbnNmb3JtRm4gZnJvbSBcIiEuLi9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9jc3MtbG9hZGVyL2Rpc3QvY2pzLmpzIS4vbm9ybWFsaXplLmNzc1wiO1xuICAgICAgXG4gICAgICBcblxudmFyIG9wdGlvbnMgPSB7fTtcblxub3B0aW9ucy5zdHlsZVRhZ1RyYW5zZm9ybSA9IHN0eWxlVGFnVHJhbnNmb3JtRm47XG5vcHRpb25zLnNldEF0dHJpYnV0ZXMgPSBzZXRBdHRyaWJ1dGVzO1xuXG4gICAgICBvcHRpb25zLmluc2VydCA9IGluc2VydEZuLmJpbmQobnVsbCwgXCJoZWFkXCIpO1xuICAgIFxub3B0aW9ucy5kb21BUEkgPSBkb21BUEk7XG5vcHRpb25zLmluc2VydFN0eWxlRWxlbWVudCA9IGluc2VydFN0eWxlRWxlbWVudDtcblxudmFyIHVwZGF0ZSA9IEFQSShjb250ZW50LCBvcHRpb25zKTtcblxuXG5cbmV4cG9ydCAqIGZyb20gXCIhIS4uL2Nzcy1sb2FkZXIvZGlzdC9janMuanMhLi9ub3JtYWxpemUuY3NzXCI7XG4gICAgICAgZXhwb3J0IGRlZmF1bHQgY29udGVudCAmJiBjb250ZW50LmxvY2FscyA/IGNvbnRlbnQubG9jYWxzIDogdW5kZWZpbmVkO1xuIiwiXG4gICAgICBpbXBvcnQgQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5qZWN0U3R5bGVzSW50b1N0eWxlVGFnLmpzXCI7XG4gICAgICBpbXBvcnQgZG9tQVBJIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc3R5bGVEb21BUEkuanNcIjtcbiAgICAgIGltcG9ydCBpbnNlcnRGbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL2luc2VydEJ5U2VsZWN0b3IuanNcIjtcbiAgICAgIGltcG9ydCBzZXRBdHRyaWJ1dGVzIGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzLmpzXCI7XG4gICAgICBpbXBvcnQgaW5zZXJ0U3R5bGVFbGVtZW50IGZyb20gXCIhLi4vbm9kZV9tb2R1bGVzL3N0eWxlLWxvYWRlci9kaXN0L3J1bnRpbWUvaW5zZXJ0U3R5bGVFbGVtZW50LmpzXCI7XG4gICAgICBpbXBvcnQgc3R5bGVUYWdUcmFuc2Zvcm1GbiBmcm9tIFwiIS4uL25vZGVfbW9kdWxlcy9zdHlsZS1sb2FkZXIvZGlzdC9ydW50aW1lL3N0eWxlVGFnVHJhbnNmb3JtLmpzXCI7XG4gICAgICBpbXBvcnQgY29udGVudCwgKiBhcyBuYW1lZEV4cG9ydCBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvZGlzdC9janMuanMhLi9tYWluLnNjc3NcIjtcbiAgICAgIFxuICAgICAgXG5cbnZhciBvcHRpb25zID0ge307XG5cbm9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0gPSBzdHlsZVRhZ1RyYW5zZm9ybUZuO1xub3B0aW9ucy5zZXRBdHRyaWJ1dGVzID0gc2V0QXR0cmlidXRlcztcblxuICAgICAgb3B0aW9ucy5pbnNlcnQgPSBpbnNlcnRGbi5iaW5kKG51bGwsIFwiaGVhZFwiKTtcbiAgICBcbm9wdGlvbnMuZG9tQVBJID0gZG9tQVBJO1xub3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7XG5cbnZhciB1cGRhdGUgPSBBUEkoY29udGVudCwgb3B0aW9ucyk7XG5cblxuXG5leHBvcnQgKiBmcm9tIFwiISEuLi9ub2RlX21vZHVsZXMvY3NzLWxvYWRlci9kaXN0L2Nqcy5qcyEuLi9ub2RlX21vZHVsZXMvc2Fzcy1sb2FkZXIvZGlzdC9janMuanMhLi9tYWluLnNjc3NcIjtcbiAgICAgICBleHBvcnQgZGVmYXVsdCBjb250ZW50ICYmIGNvbnRlbnQubG9jYWxzID8gY29udGVudC5sb2NhbHMgOiB1bmRlZmluZWQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHN0eWxlc0luRE9NID0gW107XG5cbmZ1bmN0aW9uIGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcbiAgdmFyIHJlc3VsdCA9IC0xO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3R5bGVzSW5ET00ubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoc3R5bGVzSW5ET01baV0uaWRlbnRpZmllciA9PT0gaWRlbnRpZmllcikge1xuICAgICAgcmVzdWx0ID0gaTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1vZHVsZXNUb0RvbShsaXN0LCBvcHRpb25zKSB7XG4gIHZhciBpZENvdW50TWFwID0ge307XG4gIHZhciBpZGVudGlmaWVycyA9IFtdO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXTtcbiAgICB2YXIgaWQgPSBvcHRpb25zLmJhc2UgPyBpdGVtWzBdICsgb3B0aW9ucy5iYXNlIDogaXRlbVswXTtcbiAgICB2YXIgY291bnQgPSBpZENvdW50TWFwW2lkXSB8fCAwO1xuICAgIHZhciBpZGVudGlmaWVyID0gXCJcIi5jb25jYXQoaWQsIFwiIFwiKS5jb25jYXQoY291bnQpO1xuICAgIGlkQ291bnRNYXBbaWRdID0gY291bnQgKyAxO1xuICAgIHZhciBpbmRleEJ5SWRlbnRpZmllciA9IGdldEluZGV4QnlJZGVudGlmaWVyKGlkZW50aWZpZXIpO1xuICAgIHZhciBvYmogPSB7XG4gICAgICBjc3M6IGl0ZW1bMV0sXG4gICAgICBtZWRpYTogaXRlbVsyXSxcbiAgICAgIHNvdXJjZU1hcDogaXRlbVszXSxcbiAgICAgIHN1cHBvcnRzOiBpdGVtWzRdLFxuICAgICAgbGF5ZXI6IGl0ZW1bNV1cbiAgICB9O1xuXG4gICAgaWYgKGluZGV4QnlJZGVudGlmaWVyICE9PSAtMSkge1xuICAgICAgc3R5bGVzSW5ET01baW5kZXhCeUlkZW50aWZpZXJdLnJlZmVyZW5jZXMrKztcbiAgICAgIHN0eWxlc0luRE9NW2luZGV4QnlJZGVudGlmaWVyXS51cGRhdGVyKG9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB1cGRhdGVyID0gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucyk7XG4gICAgICBvcHRpb25zLmJ5SW5kZXggPSBpO1xuICAgICAgc3R5bGVzSW5ET00uc3BsaWNlKGksIDAsIHtcbiAgICAgICAgaWRlbnRpZmllcjogaWRlbnRpZmllcixcbiAgICAgICAgdXBkYXRlcjogdXBkYXRlcixcbiAgICAgICAgcmVmZXJlbmNlczogMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWRlbnRpZmllcnMucHVzaChpZGVudGlmaWVyKTtcbiAgfVxuXG4gIHJldHVybiBpZGVudGlmaWVycztcbn1cblxuZnVuY3Rpb24gYWRkRWxlbWVudFN0eWxlKG9iaiwgb3B0aW9ucykge1xuICB2YXIgYXBpID0gb3B0aW9ucy5kb21BUEkob3B0aW9ucyk7XG4gIGFwaS51cGRhdGUob2JqKTtcblxuICB2YXIgdXBkYXRlciA9IGZ1bmN0aW9uIHVwZGF0ZXIobmV3T2JqKSB7XG4gICAgaWYgKG5ld09iaikge1xuICAgICAgaWYgKG5ld09iai5jc3MgPT09IG9iai5jc3MgJiYgbmV3T2JqLm1lZGlhID09PSBvYmoubWVkaWEgJiYgbmV3T2JqLnNvdXJjZU1hcCA9PT0gb2JqLnNvdXJjZU1hcCAmJiBuZXdPYmouc3VwcG9ydHMgPT09IG9iai5zdXBwb3J0cyAmJiBuZXdPYmoubGF5ZXIgPT09IG9iai5sYXllcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGFwaS51cGRhdGUob2JqID0gbmV3T2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXBpLnJlbW92ZSgpO1xuICAgIH1cbiAgfTtcblxuICByZXR1cm4gdXBkYXRlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobGlzdCwgb3B0aW9ucykge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgbGlzdCA9IGxpc3QgfHwgW107XG4gIHZhciBsYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obGlzdCwgb3B0aW9ucyk7XG4gIHJldHVybiBmdW5jdGlvbiB1cGRhdGUobmV3TGlzdCkge1xuICAgIG5ld0xpc3QgPSBuZXdMaXN0IHx8IFtdO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsYXN0SWRlbnRpZmllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW2ldO1xuICAgICAgdmFyIGluZGV4ID0gZ2V0SW5kZXhCeUlkZW50aWZpZXIoaWRlbnRpZmllcik7XG4gICAgICBzdHlsZXNJbkRPTVtpbmRleF0ucmVmZXJlbmNlcy0tO1xuICAgIH1cblxuICAgIHZhciBuZXdMYXN0SWRlbnRpZmllcnMgPSBtb2R1bGVzVG9Eb20obmV3TGlzdCwgb3B0aW9ucyk7XG5cbiAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgbGFzdElkZW50aWZpZXJzLmxlbmd0aDsgX2krKykge1xuICAgICAgdmFyIF9pZGVudGlmaWVyID0gbGFzdElkZW50aWZpZXJzW19pXTtcblxuICAgICAgdmFyIF9pbmRleCA9IGdldEluZGV4QnlJZGVudGlmaWVyKF9pZGVudGlmaWVyKTtcblxuICAgICAgaWYgKHN0eWxlc0luRE9NW19pbmRleF0ucmVmZXJlbmNlcyA9PT0gMCkge1xuICAgICAgICBzdHlsZXNJbkRPTVtfaW5kZXhdLnVwZGF0ZXIoKTtcblxuICAgICAgICBzdHlsZXNJbkRPTS5zcGxpY2UoX2luZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsYXN0SWRlbnRpZmllcnMgPSBuZXdMYXN0SWRlbnRpZmllcnM7XG4gIH07XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbWVtbyA9IHt9O1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cbmZ1bmN0aW9uIGdldFRhcmdldCh0YXJnZXQpIHtcbiAgaWYgKHR5cGVvZiBtZW1vW3RhcmdldF0gPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgc3R5bGVUYXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRhcmdldCk7IC8vIFNwZWNpYWwgY2FzZSB0byByZXR1cm4gaGVhZCBvZiBpZnJhbWUgaW5zdGVhZCBvZiBpZnJhbWUgaXRzZWxmXG5cbiAgICBpZiAod2luZG93LkhUTUxJRnJhbWVFbGVtZW50ICYmIHN0eWxlVGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxJRnJhbWVFbGVtZW50KSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBUaGlzIHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGFjY2VzcyB0byBpZnJhbWUgaXMgYmxvY2tlZFxuICAgICAgICAvLyBkdWUgdG8gY3Jvc3Mtb3JpZ2luIHJlc3RyaWN0aW9uc1xuICAgICAgICBzdHlsZVRhcmdldCA9IHN0eWxlVGFyZ2V0LmNvbnRlbnREb2N1bWVudC5oZWFkO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvLyBpc3RhbmJ1bCBpZ25vcmUgbmV4dFxuICAgICAgICBzdHlsZVRhcmdldCA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbWVtb1t0YXJnZXRdID0gc3R5bGVUYXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVtb1t0YXJnZXRdO1xufVxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5cblxuZnVuY3Rpb24gaW5zZXJ0QnlTZWxlY3RvcihpbnNlcnQsIHN0eWxlKSB7XG4gIHZhciB0YXJnZXQgPSBnZXRUYXJnZXQoaW5zZXJ0KTtcblxuICBpZiAoIXRhcmdldCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkbid0IGZpbmQgYSBzdHlsZSB0YXJnZXQuIFRoaXMgcHJvYmFibHkgbWVhbnMgdGhhdCB0aGUgdmFsdWUgZm9yIHRoZSAnaW5zZXJ0JyBwYXJhbWV0ZXIgaXMgaW52YWxpZC5cIik7XG4gIH1cblxuICB0YXJnZXQuYXBwZW5kQ2hpbGQoc3R5bGUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEJ5U2VsZWN0b3I7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gaW5zZXJ0U3R5bGVFbGVtZW50KG9wdGlvbnMpIHtcbiAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3R5bGVcIik7XG4gIG9wdGlvbnMuc2V0QXR0cmlidXRlcyhlbGVtZW50LCBvcHRpb25zLmF0dHJpYnV0ZXMpO1xuICBvcHRpb25zLmluc2VydChlbGVtZW50LCBvcHRpb25zLm9wdGlvbnMpO1xuICByZXR1cm4gZWxlbWVudDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRTdHlsZUVsZW1lbnQ7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc2V0QXR0cmlidXRlc1dpdGhvdXRBdHRyaWJ1dGVzKHN0eWxlRWxlbWVudCkge1xuICB2YXIgbm9uY2UgPSB0eXBlb2YgX193ZWJwYWNrX25vbmNlX18gIT09IFwidW5kZWZpbmVkXCIgPyBfX3dlYnBhY2tfbm9uY2VfXyA6IG51bGw7XG5cbiAgaWYgKG5vbmNlKSB7XG4gICAgc3R5bGVFbGVtZW50LnNldEF0dHJpYnV0ZShcIm5vbmNlXCIsIG5vbmNlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldEF0dHJpYnV0ZXNXaXRob3V0QXR0cmlidXRlczsiLCJcInVzZSBzdHJpY3RcIjtcblxuLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG5mdW5jdGlvbiBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaikge1xuICB2YXIgY3NzID0gXCJcIjtcblxuICBpZiAob2JqLnN1cHBvcnRzKSB7XG4gICAgY3NzICs9IFwiQHN1cHBvcnRzIChcIi5jb25jYXQob2JqLnN1cHBvcnRzLCBcIikge1wiKTtcbiAgfVxuXG4gIGlmIChvYmoubWVkaWEpIHtcbiAgICBjc3MgKz0gXCJAbWVkaWEgXCIuY29uY2F0KG9iai5tZWRpYSwgXCIge1wiKTtcbiAgfVxuXG4gIHZhciBuZWVkTGF5ZXIgPSB0eXBlb2Ygb2JqLmxheWVyICE9PSBcInVuZGVmaW5lZFwiO1xuXG4gIGlmIChuZWVkTGF5ZXIpIHtcbiAgICBjc3MgKz0gXCJAbGF5ZXJcIi5jb25jYXQob2JqLmxheWVyLmxlbmd0aCA+IDAgPyBcIiBcIi5jb25jYXQob2JqLmxheWVyKSA6IFwiXCIsIFwiIHtcIik7XG4gIH1cblxuICBjc3MgKz0gb2JqLmNzcztcblxuICBpZiAobmVlZExheWVyKSB7XG4gICAgY3NzICs9IFwifVwiO1xuICB9XG5cbiAgaWYgKG9iai5tZWRpYSkge1xuICAgIGNzcyArPSBcIn1cIjtcbiAgfVxuXG4gIGlmIChvYmouc3VwcG9ydHMpIHtcbiAgICBjc3MgKz0gXCJ9XCI7XG4gIH1cblxuICB2YXIgc291cmNlTWFwID0gb2JqLnNvdXJjZU1hcDtcblxuICBpZiAoc291cmNlTWFwICYmIHR5cGVvZiBidG9hICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgY3NzICs9IFwiXFxuLyojIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxcIi5jb25jYXQoYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlTWFwKSkpKSwgXCIgKi9cIik7XG4gIH0gLy8gRm9yIG9sZCBJRVxuXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuXG4gIG9wdGlvbnMuc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQsIG9wdGlvbnMub3B0aW9ucyk7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpIHtcbiAgLy8gaXN0YW5idWwgaWdub3JlIGlmXG4gIGlmIChzdHlsZUVsZW1lbnQucGFyZW50Tm9kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHN0eWxlRWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHN0eWxlRWxlbWVudCk7XG59XG4vKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cblxuXG5mdW5jdGlvbiBkb21BUEkob3B0aW9ucykge1xuICB2YXIgc3R5bGVFbGVtZW50ID0gb3B0aW9ucy5pbnNlcnRTdHlsZUVsZW1lbnQob3B0aW9ucyk7XG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUob2JqKSB7XG4gICAgICBhcHBseShzdHlsZUVsZW1lbnQsIG9wdGlvbnMsIG9iaik7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgIHJlbW92ZVN0eWxlRWxlbWVudChzdHlsZUVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkb21BUEk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuZnVuY3Rpb24gc3R5bGVUYWdUcmFuc2Zvcm0oY3NzLCBzdHlsZUVsZW1lbnQpIHtcbiAgaWYgKHN0eWxlRWxlbWVudC5zdHlsZVNoZWV0KSB7XG4gICAgc3R5bGVFbGVtZW50LnN0eWxlU2hlZXQuY3NzVGV4dCA9IGNzcztcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoc3R5bGVFbGVtZW50LmZpcnN0Q2hpbGQpIHtcbiAgICAgIHN0eWxlRWxlbWVudC5yZW1vdmVDaGlsZChzdHlsZUVsZW1lbnQuZmlyc3RDaGlsZCk7XG4gICAgfVxuXG4gICAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzcykpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R5bGVUYWdUcmFuc2Zvcm07IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHRpZDogbW9kdWxlSWQsXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubmMgPSB1bmRlZmluZWQ7IiwiaW1wb3J0IEExMXlEaWFsb2cgZnJvbSBcImExMXktZGlhbG9nXCI7XG5pbXBvcnQgXCJub3JtYWxpemUuY3NzXCI7XG5pbXBvcnQgXCIuL21haW4uc2Nzc1wiO1xuXG5jb25zdCBET01Db250cm9sbGVyID0gKGZ1bmN0aW9uKCl7XG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVNb2JpbGVIZWFkZXIoKXtcbiAgICAgICAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaGVhZGVyJyk7XG5cbiAgICAgICAgaGVhZGVyLmlubmVySFRNTCA9IGA8YSBocmVmPVwiL2Rpc3QvaW5kZXguaHRtbFwiPjxidXR0b24gY2xhc3M9XCJ0b2RheVwiPlRvZGF5PC9idXR0b24+PC9hPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYWRkLWhhYml0XCI+KzwvYnV0dG9uPlxuICAgICAgICA8YSBocmVmPVwiL2Rpc3QvcGFnZXMvcmFwb3J0cy5odG1sXCI+PGJ1dHRvbiBjbGFzcz1cInJhcG9ydHNcIj5SYXBvcnRzPC9idXR0b24+PC9hPmA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlSGFiaXRDcmVhdG9yRGlhbG9nKCl7XG4gICAgICAgIGNvbnN0IGRpYWxvZ0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGljay1oYWJpdFwiKTtcbiAgICAgICAgLypkaWFsb2dDb250YWluZXIuaW5uZXJIVE1MID0gYGAqL1xuICAgICAgICBcbiAgICAgICAgY29uc3QgZGlhbG9nID0gbmV3IEExMXlEaWFsb2coZGlhbG9nQ29udGFpbmVyKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnNvbGUubG9nKFwic2hvd1wiKTtcbiAgICAgICAgZGlhbG9nLnNob3coKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge2dlbmVyYXRlTW9iaWxlSGVhZGVyLGNyZWF0ZUhhYml0Q3JlYXRvckRpYWxvZ307XG59KSgpO1xuXG5ET01Db250cm9sbGVyLmdlbmVyYXRlTW9iaWxlSGVhZGVyKCk7XG5ET01Db250cm9sbGVyLmNyZWF0ZUhhYml0Q3JlYXRvckRpYWxvZygpOyJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==