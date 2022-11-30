import { describe, it } from "mocha";
import { expect } from 'chai';
import { readFileSync } from 'fs';

import { DebugGrounder, DebugGrounderError } from '../../../src/dbg-ground/debug_grounder';
import { DebugAtom } from "../../../src/dbg-ground/asp_core";


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
        ['_debug2', new DebugAtom('_debug2', 1, ['X'], 'node(X) :- arc(_, X).')],
        ['_debug3', new DebugAtom('_debug3', 1, ['X'], 'col(X, blue) | col(X, red) | col(X, yellow) :- node(X).')],
        ['_debug4', new DebugAtom('_debug4', 4, ['X','C1','Y','C2'], ':- col(X, C1), col(Y, C2), arc(X, Y), C1=C2.')] ] ) }
    ]

describe('basic mocha usage', function()
{
    it('asserts true is true and not false', function()
    {
        expect(true).to.equal(true);
        expect(true).to.not.equal(false);
    });
});

describe('building the debugging ASP program', function()
{
    it('stores a single encoding', function()
    {
        let encoding_path: string = '/path/to/encoding.asp';
        let dbgGrounder: DebugGrounder = DebugGrounder.createDefault(encoding_path);
        expect(dbgGrounder.getEncodings()).to.eql([encoding_path]);
    });

    [ [], ['path/to/enc.asp'], ['path/to/enc_1.asp', 'path/to/enc_2.asp'] ]
    .forEach( function(encoding_paths: string[])
    {
        it('stores multiple encodings', function()
        {
            let dbgGrounder: DebugGrounder = DebugGrounder.createDefault(encoding_paths);
            expect(dbgGrounder.getEncodings()).to.eql(encoding_paths);
        });
    });

    
    debug_program_test_cases.forEach( function(test_case: DebugProgramTestCase)
    {
        it('properly computes the adorned debugging ASP program', function()
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

    it('manages not existing file error', function()
    {
        let dbgGrounder: DebugGrounder = DebugGrounder.createDefault('not/existing/file.lp');
        let ground = function() { dbgGrounder.ground(); }
        expect(ground).to.throw(DebugGrounderError);
    });

    it('manages invalid encoding error', function()
    {
        let dbgGrounder: DebugGrounder = DebugGrounder.createDefault('test/unsat/dbg-ground/invalid_test.lp');
        let ground = function() { dbgGrounder.ground(); }
        expect(ground).to.throw(DebugGrounderError);
    });
    
});