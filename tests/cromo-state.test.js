"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  normalizeDuplicates,
  normalizeReservations,
  capReservations,
  reservedDuplicates,
  availableDuplicates
} = require("../lib/cromo-state");

test("normalizeDuplicates aceita apenas inteiros positivos", () => {
  assert.equal(normalizeDuplicates("3"), 3);
  assert.equal(normalizeDuplicates(2), 2);
  assert.equal(normalizeDuplicates("0"), 0);
  assert.equal(normalizeDuplicates("-4"), 0);
  assert.equal(normalizeDuplicates("abc"), 0);
});

test("reservas detalhadas têm prioridade sobre reservados legado", () => {
  const sticker = {
    repetidos: 4,
    reservados: 1,
    reservas: [
      { person: "Joao", count: 2 },
      { person: "Bino", count: 1 }
    ]
  };

  assert.equal(reservedDuplicates(sticker), 3);
  assert.equal(availableDuplicates(sticker), 1);
});

test("reservados nunca ultrapassam o total de repetidos", () => {
  assert.equal(reservedDuplicates({ repetidos: 2, reservados: 9 }), 2);
  assert.equal(availableDuplicates({ repetidos: 2, reservados: 9 }), 0);
});

test("capReservations corta reservas pela quantidade existente", () => {
  const capped = capReservations([
    { person: "Joao", count: 2 },
    { person: "Tiago", count: 4 }
  ], 3);

  assert.deepEqual(capped.map(item => ({ person: item.person, count: item.count })), [
    { person: "Joao", count: 2 },
    { person: "Tiago", count: 1 }
  ]);
});

test("normalizeReservations aceita JSON e ignora entradas sem quantidade", () => {
  const reservations = normalizeReservations('[{"person":"Joao","count":2},{"person":"Tiago","count":0}]');
  assert.deepEqual(reservations.map(item => ({ person: item.person, count: item.count })), [
    { person: "Joao", count: 2 }
  ]);
});
