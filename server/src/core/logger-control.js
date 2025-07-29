"use strict";
/**
 * Runtime Logger Control
 *
 * Allows dynamic control of logging without restarting the server
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerControl = void 0;
var logger_1 = require("./logger");
var LoggerControl = /** @class */ (function () {
    function LoggerControl() {
        this.overrides = {};
    }
    LoggerControl.getInstance = function () {
        if (!LoggerControl.instance) {
            LoggerControl.instance = new LoggerControl();
        }
        return LoggerControl.instance;
    };
    /**
     * Temporarily suppress specific log categories
     */
    LoggerControl.prototype.suppress = function () {
        var categories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            categories[_i] = arguments[_i];
        }
        this.overrides.suppressCategories = __spreadArray(__spreadArray([], (this.overrides.suppressCategories || []), true), categories, true);
        logger_1.logger.info('LoggerControl', "Suppressed categories: ".concat(categories.join(', ')));
    };
    /**
     * Remove category suppression
     */
    LoggerControl.prototype.unsuppress = function () {
        var categories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            categories[_i] = arguments[_i];
        }
        if (!this.overrides.suppressCategories)
            return;
        this.overrides.suppressCategories = this.overrides.suppressCategories.filter(function (cat) { return !categories.includes(cat); });
        logger_1.logger.info('LoggerControl', "Unsuppressed categories: ".concat(categories.join(', ')));
    };
    /**
     * Only show specific categories
     */
    LoggerControl.prototype.showOnly = function () {
        var categories = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            categories[_i] = arguments[_i];
        }
        this.overrides.onlyShowCategories = categories;
        logger_1.logger.info('LoggerControl', "Showing only: ".concat(categories.join(', ')));
    };
    /**
     * Show all categories
     */
    LoggerControl.prototype.showAll = function () {
        this.overrides.onlyShowCategories = undefined;
        logger_1.logger.info('LoggerControl', 'Showing all categories');
    };
    /**
     * Set minimum log level
     */
    LoggerControl.prototype.setMinLevel = function (level) {
        this.overrides.minLevel = level;
        logger_1.logger.info('LoggerControl', "Set minimum log level to: ".concat(level));
    };
    /**
     * Reset all overrides
     */
    LoggerControl.prototype.reset = function () {
        this.overrides = {};
        logger_1.logger.info('LoggerControl', 'Reset all logging overrides');
    };
    /**
     * Get current overrides
     */
    LoggerControl.prototype.getOverrides = function () {
        return this.overrides;
    };
    /**
     * Apply overrides to logger config
     */
    LoggerControl.prototype.applyToConfig = function (baseConfig) {
        return __assign(__assign(__assign({}, baseConfig), this.overrides), { suppressCategories: __spreadArray(__spreadArray([], (baseConfig.suppressCategories || []), true), (this.overrides.suppressCategories || []), true) });
    };
    return LoggerControl;
}());
// Export singleton instance
exports.loggerControl = LoggerControl.getInstance();
// Make it available globally in development
if (process.env.NODE_ENV !== 'production') {
    global.loggerControl = exports.loggerControl;
}
