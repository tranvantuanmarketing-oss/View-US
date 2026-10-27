import test from 'node:test';
import assert from 'node:assert/strict';
import {pilotPageNames,pageDisplayName} from '../pageIdentity.mjs';
import {countries,planSlots} from '../core.mjs';
test('five pilot identities use approved workspace labels without changing IDs',()=>{
 assert.equal(Object.keys(pilotPageNames).length,5);
 assert.equal(pageDisplayName('104625669131300','VanTuan Agency'),'Mroczne Dziedzictwo');
 assert.equal(pageDisplayName('783405241533648','Old name'),'Za Zamkniętymi Drzwiami');
 assert.equal(pageDisplayName('99999','Unrelated Page'),'Unrelated Page');
});
test('Poland defaults to Warsaw and follows winter offset',()=>{
 assert.deepEqual(countries.PL,['Ba Lan','Europe/Warsaw']);
 assert.equal(planSlots('Europe/Warsaw',['09:00'],1,Date.parse('2026-10-26T00:00:00Z'))[0],'2026-10-26T08:00:00.000Z');
});
