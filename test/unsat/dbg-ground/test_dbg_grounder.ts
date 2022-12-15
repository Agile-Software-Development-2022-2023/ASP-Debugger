import { describe, it } from "mocha";
import { expect } from 'chai';
import { readFileSync } from 'fs';

import { DebugGrounder } from '../../../src/dbg-ground/dbg_grounder';
import { DebugAtom } from "../../../src/dbg-ground/asp_core";
import {  AspGrounderError } from "../../../src/dbg-ground/grounder";


interface DebugProgramTestCase
{
    input_encodings: string[];
    expected_ground: string;
    debug_atoms_map: Map<string, DebugAtom>;
}
let debug_program_test_cases: DebugProgramTestCase[] =
    [ { input_encodings: ['test/unsat/dbg-ground/test_01.lp'],
        expected_ground: 'test/unsat/dbg-ground/test_01.smodels',
        debug_atoms_map: new Map<string, DebugAtom>( [
            ['_debug1', new DebugAtom('_debug1', 0, [], 'b :- a.')],
            ['_debug2', new DebugAtom('_debug2', 0, [], 'c :- not a.')],
            ['_debug3', new DebugAtom('_debug3', 0, [], ':- c.')] ] ) },
      { input_encodings: ['test/unsat/dbg-ground/test_02.lp'],
        expected_ground: 'test/unsat/dbg-ground/test_02.smodels',
        debug_atoms_map: new Map<string, DebugAtom>() },
      { input_encodings: ['test/unsat/dbg-ground/col_test.lp', 'test/unsat/dbg-ground/col_test.in'],
        expected_ground: 'test/unsat/dbg-ground/col_test.smodels',
        debug_atoms_map: new Map<string, DebugAtom>( [
        ['_debug1', new DebugAtom('_debug1', 1, ['X'], 'node(X) :- arc(X, _).')],
        ['_debug2', new DebugAtom('_debug2', 1, ['X'], 'col(X, blue) | col(X, red) | col(X, yellow) :- node(X).')],
        ['_debug3', new DebugAtom('_debug3', 4, ['X','C1','Y','C2'], ':- col(X, C1), col(Y, C2), arc(X, Y), C1=C2.')] ] ) }
    ]

describe('Basic mocha usage', function()
{
    it('asserts true is true and not false', function()
    {
        expect(true).to.equal(true);
        expect(true).to.not.equal(false);
    });
});

describe('Building the debugging ASP program [dbg-integration tests]', function()
{
    it('Stores a single encoding', function()
    {
        let encoding_path: string = '/path/to/encoding.asp';
        let dbgGrounder: DebugGrounder = DebugGrounder.createDefault(encoding_path);
        expect(dbgGrounder.getEncodings()).to.eql([encoding_path]);
    });

    [ [], ['path/to/enc.asp'], ['path/to/enc_1.asp', 'path/to/enc_2.asp'] ]
    .forEach( function(encoding_paths: string[])
    {
        it('Stores multiple encodings', function()
        {
            let dbgGrounder: DebugGrounder = DebugGrounder.createDefault(encoding_paths);
            expect(dbgGrounder.getEncodings()).to.eql(encoding_paths);
        });
    });

    
    debug_program_test_cases.forEach( function(test_case: DebugProgramTestCase)
    {
        it('Properly computes the adorned debugging ASP program', function()
        {
            let dbgGrounder: DebugGrounder = DebugGrounder.createDefault(test_case.input_encodings);
            let expected: string = readFileSync(test_case.expected_ground, 'utf-8');
            dbgGrounder.ground();

            const debugAtomsMap: Map<string, DebugAtom> = dbgGrounder.getDebugAtomsMap();
            expect(debugAtomsMap.size).to.eql(test_case.debug_atoms_map.size);

            for ( var [key, val] of debugAtomsMap )
            {
                let expected_val: DebugAtom|undefined = test_case.debug_atoms_map.get(key);
                expect(val).to.eql(expected_val);
            }
        });
    });

    it('Manages not existing file error', function()
    {
        let dbgGrounder: DebugGrounder = DebugGrounder.createDefault('not/existing/file.lp');
        let ground = function() { dbgGrounder.ground(); }
        expect(ground).to.throw(AspGrounderError);
    });

    it('Manages invalid encoding error', function()
    {
        let dbgGrounder: DebugGrounder = DebugGrounder.createDefault('test/unsat/dbg-ground/invalid_test.lp');
        let ground = function() { dbgGrounder.ground(); }
        expect(ground).to.throw(AspGrounderError);
    });
    

    //
    // debug directives and annotations.
    //
    const annotation_test_path: string = 'test/unsat/dbg-ground/annotation_tests/annotation_test.lp';
    [ 
        {
        default_policy: 'rules_only',
        default_policy_path: "test/unsat/dbg-ground/annotation_tests/directive_rules_only.lp",
        debug_atoms_map: new Map<string, DebugAtom>( [
            ['_debug1', new DebugAtom('_debug1', 1, ['X'], 'b(X) :- p(X,_), not q(X).')],
            ['_debug2', new DebugAtom('_debug2', 1, ['X'], 'adorn_it(X) :- q(X).')],
            ['_debug3', new DebugAtom('_debug3', 1, ['X'], ':- a(_,X), not b(X).')],
            ['_debug4', new DebugAtom('_debug4', 1, ['X'], ':- adorn_it(X).')]/*,
            ['_debug5', new DebugAtom('_debug5', 1, ['X'], ':~ p(X,_), q(X). [2@3]')],
        ['_debug6', new DebugAtom('_debug6', 1, ['X'], ':~ adorn_it(X). [X@4]')]*/ ] )
        },

        {
        default_policy: 'facts_only',
        default_policy_path: "test/unsat/dbg-ground/annotation_tests/directive_facts_only.lp",
        debug_atoms_map: new Map<string, DebugAtom>( [
            ['_debug1', new DebugAtom('_debug1', 0, [], 'q(1).')],
            ['_debug2', new DebugAtom('_debug2', 0, [], 'q(2).')],
            ['_debug3', new DebugAtom('_debug3', 0, [], 'q(3).')],
            ['_debug4', new DebugAtom('_debug4', 0, [], 'q(4).')],
            ['_debug5', new DebugAtom('_debug5', 0, [], 'p(1,4).')],
            ['_debug6', new DebugAtom('_debug6', 0, [], 'p(2,1).')],
            ['_debug7', new DebugAtom('_debug7', 0, [], 'p(2,2).')],
            ['_debug8', new DebugAtom('_debug8', 0, [], 'p(2,3).')] ] )
        },

        {
        default_policy: 'all',
        default_policy_path: "test/unsat/dbg-ground/annotation_tests/directive_all.lp",
        debug_atoms_map: new Map<string, DebugAtom>( [
            ['_debug1', new DebugAtom('_debug1', 0, [], 'q(1).')],
            ['_debug2', new DebugAtom('_debug2', 0, [], 'q(2).')],
            ['_debug3', new DebugAtom('_debug3', 0, [], 'q(3).')],
            ['_debug4', new DebugAtom('_debug4', 0, [], 'q(4).')],
            ['_debug5', new DebugAtom('_debug5', 0, [], 'p(1,4).')],
            ['_debug6', new DebugAtom('_debug6', 0, [], 'p(2,1).')],
            ['_debug7', new DebugAtom('_debug7', 0, [], 'p(2,2).')],
            ['_debug8', new DebugAtom('_debug8', 0, [], 'p(2,3).')],

            ['_debug9' , new DebugAtom('_debug9',  1, ['X'], 'b(X) :- p(X,_), not q(X).')],
            ['_debug10', new DebugAtom('_debug10', 1, ['X'], 'adorn_it(X) :- q(X).')],
            ['_debug11', new DebugAtom('_debug11', 1, ['X'], ':- a(_,X), not b(X).')],
            ['_debug12', new DebugAtom('_debug12', 1, ['X'], ':- adorn_it(X).')]/*,
            ['_debug13', new DebugAtom('_debug13', 1, ['X'], ':~ p(X,_), q(X). [2@3]')],
        ['_debug14', new DebugAtom('_debug14', 1, ['X'], ':~ adorn_it(X). [X@4]')]*/ ] )
        },

        {
        default_policy: 'none',
        default_policy_path: "test/unsat/dbg-ground/annotation_tests/directive_none.lp",
        debug_atoms_map: new Map<string, DebugAtom>( [
            ['_debug1', new DebugAtom('_debug1', 0, [], 'q(3).')],
            ['_debug2', new DebugAtom('_debug2', 0, [], 'p(2,2).')],
            ['_debug3', new DebugAtom('_debug3', 0, [], 'p(2,3).')],

            ['_debug4', new DebugAtom('_debug4',  1, ['X'], 'b(X) :- p(X,_), not q(X).')],
            ['_debug5', new DebugAtom('_debug5', 1, ['X'], ':- a(_,X), not b(X).')]/*,
        ['_debug6', new DebugAtom('_debug6', 1, ['X'], ':~ p(X,_), q(X). [2@3]')]*/ ] )
        }
    ]
    .forEach( function(test_case)
    {
        it('Properly computes the adorned debugging ASP program [' + test_case.default_policy + '+annotations]', function()
        {
            let dbgGrounder: DebugGrounder = DebugGrounder.createDefault([annotation_test_path, test_case.default_policy_path]);
            dbgGrounder.ground();

            const debugAtomsMap: Map<string, DebugAtom> = dbgGrounder.getDebugAtomsMap();
            expect(debugAtomsMap.size).to.eql(test_case.debug_atoms_map.size);

            for ( var [key, val] of debugAtomsMap )
            {
                let expected_val: DebugAtom|undefined = test_case.debug_atoms_map.get(key);
                expect(val).to.eql(expected_val);
            }
        });
    });
});