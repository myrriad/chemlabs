/// <reference path="../src/command.ts"/>

import { formulaTknr, NewAtomTracker } from "../src/command";

/*
 Test functions:

 */

function testFormulaTknr() {
    let atomt = new NewAtomTracker();
    formulaTknr('KMnO4', 0, atomt);
    test('atomt._atoms should be ["K", "Mn", "O"]', () => {
        expect(atomt._atoms).toBe(['K', 'Mn', 'O']);
        expect(atomt._qtys).toBe([1, 1, 4]);
    });

}