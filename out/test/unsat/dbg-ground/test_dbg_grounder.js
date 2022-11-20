"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const chai_1 = require("chai");
const fs_1 = require("fs");
const debug_grounder_1 = require("../../../src/dbg-ground/debug_grounder");
let debug_program_test_cases = [{ input_encodings: ['test/unsat/dbg-ground/test_01.lp'],
        expected_ground: 'test/unsat/dbg-ground/test_01.smodels',
        debug_atoms_map: new Map([
            ['_debug1', new debug_grounder_1.DebugAtom('_debug1', 0, [], 'b :- a.')],
            ['_debug2', new debug_grounder_1.DebugAtom('_debug2', 0, [], 'c :- not a.')],
            ['_debug3', new debug_grounder_1.DebugAtom('_debug3', 0, [], ':- c.')]
        ]) },
    { input_encodings: ['test/unsat/dbg-ground/test_02.lp'],
        expected_ground: 'test/unsat/dbg-ground/test_02.smodels',
        debug_atoms_map: new Map() },
    { input_encodings: ['test/unsat/dbg-ground/col_test.lp', 'test/unsat/dbg-ground/col_test.in'],
        expected_ground: 'test/unsat/dbg-ground/col_test.smodels',
        debug_atoms_map: new Map([
            ['_debug1', new debug_grounder_1.DebugAtom('_debug1', 1, ['X'], 'node(X) :- arc(X, _).')],
            ['_debug2', new debug_grounder_1.DebugAtom('_debug2', 1, ['X'], 'node(X) :- arc(_, X).')],
            ['_debug3', new debug_grounder_1.DebugAtom('_debug3', 1, ['X'], 'col(X, blue) | col(X, red) | col(X, yellow) :- node(X).')],
            ['_debug4', new debug_grounder_1.DebugAtom('_debug4', 4, ['X', 'C1', 'Y', 'C2'], ':- col(X, C1), col(Y, C2), arc(X, Y), C1=C2.')]
        ]) }
];
mocha_1.describe('basic mocha usage', function () {
    mocha_1.it('asserts true is true and not false', function () {
        chai_1.expect(true).to.equal(true);
        chai_1.expect(true).to.not.equal(false);
    });
});
mocha_1.describe('building the debugging ASP program', function () {
    mocha_1.it('stores a single encoding', function () {
        let encoding_path = '/path/to/encoding.asp';
        let dbgGrounder = debug_grounder_1.DebugGrounder.createDefault(encoding_path);
        chai_1.expect(dbgGrounder.getEncodings()).to.eql([encoding_path]);
    });
    [[], ['path/to/enc.asp'], ['path/to/enc_1.asp', 'path/to/enc_2.asp']]
        .forEach(function (encoding_paths) {
        mocha_1.it('stores multiple encodings', function () {
            let dbgGrounder = debug_grounder_1.DebugGrounder.createDefault(encoding_paths);
            chai_1.expect(dbgGrounder.getEncodings()).to.eql(encoding_paths);
        });
    });
    debug_program_test_cases.forEach(function (test_case) {
        mocha_1.it('properly computes the adorned debugging ASP program', function () {
            let dbgGrounder = debug_grounder_1.DebugGrounder.createDefault(test_case.input_encodings);
            let expected = fs_1.readFileSync(test_case.expected_ground, 'utf-8');
            dbgGrounder.ground();
            const debugAtomsMap = dbgGrounder.getDebugAtomsMap();
            chai_1.expect(debugAtomsMap.size).to.eql(test_case.debug_atoms_map.size);
            for (var [key, val] of debugAtomsMap) {
                let expected_val = test_case.debug_atoms_map.get(key);
                chai_1.expect(val).to.eql(expected_val);
            }
        });
    });
    mocha_1.it('manages not existing file error', function () {
        let dbgGrounder = debug_grounder_1.DebugGrounder.createDefault('not/existing/file.lp');
        let ground = function () { dbgGrounder.ground(); };
        chai_1.expect(ground).to.throw(debug_grounder_1.DebugGrounderError);
    });
    mocha_1.it('manages invalid encoding error', function () {
        let dbgGrounder = debug_grounder_1.DebugGrounder.createDefault('test/unsat/dbg-ground/invalid_test.lp');
        let ground = function () { dbgGrounder.ground(); };
        chai_1.expect(ground).to.throw(debug_grounder_1.DebugGrounderError);
    });
});
//# sourceMappingURL=test_dbg_grounder.js.map