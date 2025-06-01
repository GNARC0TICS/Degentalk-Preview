// Usage: npx ts-node scripts/db-schema-summary.ts
// This script statically analyzes shared/schema.ts and prints a Markdown summary of all DB tables, columns, and foreign keys.
var schema = require('../shared/schema');
function getTableDefs(schemaObj) {
    // Only keep exported pgTable objects
    return Object.entries(schemaObj)
        .filter(function (_a) {
        var k = _a[0], v = _a[1];
        return v && v._ && v._.name && v._.columns;
    })
        .map(function (_a) {
        var name = _a[0], table = _a[1];
        return ({ name: table._.name, columns: table._.columns, table: table });
    });
}
function printTableMarkdown(tableDef) {
    var _a, _b, _c, _d;
    var name = tableDef.name, columns = tableDef.columns;
    console.log("\n### Table: `".concat(name, "`"));
    console.log('| Column | Type | Nullable | Default | Foreign Key |');
    console.log('|--------|------|----------|---------|-------------|');
    for (var _i = 0, _e = Object.entries(columns); _i < _e.length; _i++) {
        var _f = _e[_i], colName = _f[0], col = _f[1];
        var type = col.dataType || ((_a = col.config) === null || _a === void 0 ? void 0 : _a.dataType) || col.sqlName || 'unknown';
        var nullable = col.notNull === false || ((_b = col.config) === null || _b === void 0 ? void 0 : _b.notNull) === false ? 'YES' : 'NO';
        var def = col.default || ((_c = col.config) === null || _c === void 0 ? void 0 : _c.default) || '';
        var fk = '';
        if (col.foreignKeys && col.foreignKeys.length > 0) {
            fk = col.foreignKeys.map(function (fk) { return "".concat(fk.foreignTable, ".").concat(fk.foreignColumn); }).join(', ');
        }
        else if ((_d = col.config) === null || _d === void 0 ? void 0 : _d.references) {
            fk = typeof col.config.references === 'function' ? '[dynamic]' : String(col.config.references);
        }
        console.log("| ".concat(colName, " | ").concat(type, " | ").concat(nullable, " | ").concat(def, " | ").concat(fk, " |"));
    }
}
function printForeignKeys(tableDefs) {
    var _a;
    console.log('\n## Foreign Key Relationships');
    console.log('| Table | Column | References |');
    console.log('|-------|--------|------------|');
    for (var _i = 0, tableDefs_1 = tableDefs; _i < tableDefs_1.length; _i++) {
        var t = tableDefs_1[_i];
        for (var _b = 0, _c = Object.entries(t.columns); _b < _c.length; _b++) {
            var _d = _c[_b], colName = _d[0], col = _d[1];
            if (col.foreignKeys && col.foreignKeys.length > 0) {
                for (var _e = 0, _f = col.foreignKeys; _e < _f.length; _e++) {
                    var fk = _f[_e];
                    console.log("| ".concat(t.name, " | ").concat(colName, " | ").concat(fk.foreignTable, ".").concat(fk.foreignColumn, " |"));
                }
            }
            else if ((_a = col.config) === null || _a === void 0 ? void 0 : _a.references) {
                console.log("| ".concat(t.name, " | ").concat(colName, " | [dynamic] |"));
            }
        }
    }
}
function main() {
    var tableDefs = getTableDefs(schema);
    for (var _i = 0, tableDefs_2 = tableDefs; _i < tableDefs_2.length; _i++) {
        var t = tableDefs_2[_i];
        printTableMarkdown(t);
    }
    printForeignKeys(tableDefs);
}
main();
