"use strict";
/**
 * Type-safe fixture factory system for Degentalk
 * Provides fluent API for creating test data with proper relationships
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Factory = exports.FactoryRegistry = exports.ScenarioResult = exports.RelationshipManager = exports.FactoryBuilder = exports.BaseFactory = void 0;
var faker_1 = require("@faker-js/faker");
var BaseFactory = /** @class */ (function () {
    function BaseFactory(options) {
        if (options === void 0) { options = {}; }
        var _a;
        this.seed = (_a = options.seed) !== null && _a !== void 0 ? _a : Date.now();
        this.faker = faker_1.faker;
        this.faker.seed(this.seed);
    }
    BaseFactory.prototype.build = function (options) {
        if (options === void 0) { options = {}; }
        var base = this.definition();
        var overrides = options.overrides || {};
        return __assign(__assign(__assign({}, base), overrides), this.buildRelationships(options.relationships));
    };
    BaseFactory.prototype.buildList = function (count, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return Array.from({ length: count }, function (_, index) {
            // Use index for deterministic variations
            _this.faker.seed(_this.seed + index);
            return _this.build(options);
        });
    };
    BaseFactory.prototype.buildRelationships = function (relationships) {
        if (!relationships)
            return {};
        var built = {};
        for (var _i = 0, _a = Object.entries(relationships); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], factory = _b[1];
            if (typeof (factory === null || factory === void 0 ? void 0 : factory.build) === 'function') {
                built[key] = factory.build();
            }
            else {
                built[key] = factory;
            }
        }
        return built;
    };
    // Fluent API helpers
    BaseFactory.prototype.with = function (overrides) {
        return new FactoryBuilder(this, overrides);
    };
    BaseFactory.prototype.states = function (state) {
        var stateOverrides = this.getState(state);
        return new FactoryBuilder(this, stateOverrides);
    };
    BaseFactory.prototype.getState = function (state) {
        // Override in subclasses to define states
        return {};
    };
    return BaseFactory;
}());
exports.BaseFactory = BaseFactory;
var FactoryBuilder = /** @class */ (function () {
    function FactoryBuilder(factory, overrides) {
        if (overrides === void 0) { overrides = {}; }
        this.factory = factory;
        this.overrides = overrides;
    }
    FactoryBuilder.prototype.with = function (additionalOverrides) {
        return new FactoryBuilder(this.factory, __assign(__assign({}, this.overrides), additionalOverrides));
    };
    FactoryBuilder.prototype.build = function () {
        return this.factory.build({ overrides: this.overrides });
    };
    FactoryBuilder.prototype.buildList = function (count) {
        return this.factory.buildList(count, { overrides: this.overrides });
    };
    return FactoryBuilder;
}());
exports.FactoryBuilder = FactoryBuilder;
// Relationship manager for complex data graphs
var RelationshipManager = /** @class */ (function () {
    function RelationshipManager() {
        this.relationships = new Map();
    }
    RelationshipManager.prototype.register = function (key, factory) {
        this.relationships.set(key, factory);
    };
    RelationshipManager.prototype.build = function (key, options) {
        var factory = this.relationships.get(key);
        if (!factory) {
            throw new Error("Factory '".concat(key, "' not registered"));
        }
        return factory.build(options);
    };
    // Build interconnected data sets
    RelationshipManager.prototype.buildScenario = function (scenario) {
        var results = {};
        for (var _i = 0, _a = scenario.steps; _i < _a.length; _i++) {
            var step = _a[_i];
            var dependencies = this.resolveDependencies(step.dependencies, results);
            results[step.name] = this.build(step.factory, __assign(__assign({}, step.options), { relationships: dependencies }));
        }
        return new ScenarioResult(results);
    };
    RelationshipManager.prototype.resolveDependencies = function (dependencies, results) {
        if (!dependencies)
            return {};
        var resolved = {};
        for (var _i = 0, dependencies_1 = dependencies; _i < dependencies_1.length; _i++) {
            var dep = dependencies_1[_i];
            if (results[dep]) {
                resolved[dep] = results[dep];
            }
        }
        return resolved;
    };
    return RelationshipManager;
}());
exports.RelationshipManager = RelationshipManager;
var ScenarioResult = /** @class */ (function () {
    function ScenarioResult(data) {
        this.data = data;
    }
    ScenarioResult.prototype.get = function (key) {
        return this.data[key];
    };
    ScenarioResult.prototype.getAll = function () {
        return __assign({}, this.data);
    };
    return ScenarioResult;
}());
exports.ScenarioResult = ScenarioResult;
// Global factory registry
var FactoryRegistry = /** @class */ (function () {
    function FactoryRegistry() {
        this.factories = new Map();
        this.relationshipManager = new RelationshipManager();
    }
    FactoryRegistry.getInstance = function () {
        if (!FactoryRegistry.instance) {
            FactoryRegistry.instance = new FactoryRegistry();
        }
        return FactoryRegistry.instance;
    };
    FactoryRegistry.prototype.register = function (name, factory) {
        this.factories.set(name, factory);
        this.relationshipManager.register(name, factory);
    };
    FactoryRegistry.prototype.get = function (name) {
        var factory = this.factories.get(name);
        if (!factory) {
            throw new Error("Factory '".concat(name, "' not found"));
        }
        return factory;
    };
    FactoryRegistry.prototype.create = function (name, options) {
        return this.get(name).build(options);
    };
    FactoryRegistry.prototype.createMany = function (name, count, options) {
        return this.get(name).buildList(count, options);
    };
    FactoryRegistry.prototype.scenario = function (definition) {
        return this.relationshipManager.buildScenario(definition);
    };
    return FactoryRegistry;
}());
exports.FactoryRegistry = FactoryRegistry;
// Convenience function for accessing the registry
exports.Factory = FactoryRegistry.getInstance();
