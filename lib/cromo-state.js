"use strict";

function normalizeDuplicates(value) {
  const parsed = Number.parseInt(String(value ?? "0").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function normalizeReserved(value) {
  return normalizeDuplicates(value);
}

function normalizeReservationPerson(value) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, 80) || "Sem nome";
}

function normalizeReservations(value) {
  let raw = value;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      raw = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  const list = Array.isArray(raw) ? raw : (raw && typeof raw === "object" ? [raw] : []);
  return list.map(item => ({
    person: normalizeReservationPerson(item?.person || item?.name || item?.reservedFor || item?.para),
    count: normalizeDuplicates(item?.count ?? item?.quantity ?? item?.qty ?? item?.total ?? item?.value ?? 1),
    createdAt: String(item?.createdAt || item?.agreedDate || item?.date || "").slice(0, 40),
    tradeId: String(item?.tradeId || item?.trocaId || "").trim().slice(0, 80)
  })).filter(item => item.count > 0);
}

function reservationTotal(sticker) {
  return normalizeReservations(sticker?.reservas ?? sticker?.reservations)
    .reduce((sum, item) => sum + item.count, 0);
}

function capReservations(reservations, duplicateCount) {
  let remaining = normalizeDuplicates(duplicateCount);
  return normalizeReservations(reservations).map(item => {
    const count = Math.min(item.count, remaining);
    remaining -= count;
    return { ...item, count };
  }).filter(item => item.count > 0);
}

function reservedDuplicates(sticker) {
  const reservations = normalizeReservations(sticker?.reservas ?? sticker?.reservations);
  const raw = reservations.length
    ? reservationTotal({ reservas: reservations })
    : normalizeReserved(sticker?.reservados ?? sticker?.reserved);
  return Math.min(raw, normalizeDuplicates(sticker?.repetidos ?? sticker?.duplicates));
}

function availableDuplicates(sticker) {
  return Math.max(0, normalizeDuplicates(sticker?.repetidos ?? sticker?.duplicates) - reservedDuplicates(sticker));
}

module.exports = {
  normalizeDuplicates,
  normalizeReserved,
  normalizeReservationPerson,
  normalizeReservations,
  reservationTotal,
  capReservations,
  reservedDuplicates,
  availableDuplicates
};
