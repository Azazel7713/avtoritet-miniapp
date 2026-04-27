const moveClasses = {
  guc: { name: "Guc", icon: "assets/moves/guc-sheet.png", focus: "hit" },
  krit: { name: "Krit", icon: "assets/moves/krit-sheet.png", focus: "crit" },
  tank: { name: "Tank", icon: "assets/moves/tank-sheet.png", focus: "rage" },
  uvorot: { name: "Uvorot", icon: "assets/moves/uvorot-sheet.png", focus: "dodge" },
  mag: { name: "Mag", icon: "assets/moves/mag-sheet.png", focus: "mana" },
};

const moveList = [
  { id: "guc-01", classId: "guc", name: "Kuce zerbesi", icon: "assets/moves/guc-sheet.png", frame: 0, req: { hits: 0 }, effect: { type: "damage", mult: 1.0 }, anti: "mag", desc: "Sabit fiziki zerbe." },
  { id: "guc-02", classId: "guc", name: "Guclu yumruq", icon: "assets/moves/guc-sheet.png", frame: 1, req: { hits: 3 }, effect: { type: "damage", mult: 1.45 }, anti: "uvorot", desc: "3 adi zerbeden sonra acilir." },
  { id: "guc-03", classId: "guc", name: "Ciyin zrbsi", icon: "assets/moves/guc-sheet.png", frame: 2, req: { hits: 4 }, effect: { type: "damage", mult: 1.6 }, anti: "tank", desc: "Bloka qarsi daha sert." },
  { id: "guc-04", classId: "guc", name: "Asfalt kombosu", icon: "assets/moves/guc-sheet.png", frame: 3, req: { hits: 6 }, effect: { type: "damage", mult: 1.85 }, anti: "mag", desc: "Uzun kombodan sonra guclenir." },
  { id: "guc-05", classId: "guc", name: "Qap sndran", icon: "assets/moves/guc-sheet.png", frame: 4, req: { rage: 35 }, effect: { type: "pierce", mult: 1.55 }, anti: "tank", desc: "Mudahifeni de deir." },
  { id: "guc-06", classId: "guc", name: "Dmir dirsk", icon: "assets/moves/guc-sheet.png", frame: 5, req: { hits: 5, rage: 20 }, effect: { type: "damage", mult: 1.75 }, anti: "krit", desc: "Krit sinfine tzyiq edir." },
  { id: "guc-07", classId: "guc", name: "Rayon pressi", icon: "assets/moves/guc-sheet.png", frame: 6, req: { hits: 7 }, effect: { type: "damage", mult: 2.0 }, anti: "mag", desc: "Maglari tez baglayir." },
  { id: "guc-08", classId: "guc", name: "Beton cza", icon: "assets/moves/guc-sheet.png", frame: 7, req: { rage: 55 }, effect: { type: "damage", mult: 2.15 }, anti: "tank", desc: "Yarisle vurulan agir zerbe." },
  { id: "guc-09", classId: "guc", name: "Kuce firtinasi", icon: "assets/moves/guc-sheet.png", frame: 8, req: { hits: 8, rage: 45 }, effect: { type: "damage", mult: 2.35 }, anti: "uvorot", desc: "Qacani tutmaq ucun." },
  { id: "guc-10", classId: "guc", name: "Avtoritet hukmu", icon: "assets/moves/guc-sheet.png", frame: 9, req: { hits: 9, rage: 70 }, effect: { type: "damage", mult: 2.75 }, anti: "mag", desc: "Guc sinfinin final zrbsi." },

  { id: "krit-01", classId: "krit", name: "Keskin ksik", icon: "assets/moves/krit-sheet.png", frame: 0, req: { crits: 0 }, effect: { type: "damage", mult: 1.0, critBoost: 8 }, anti: "guc", desc: "Krit sansini artiran zerbe." },
  { id: "krit-02", classId: "krit", name: "Sokurucu", icon: "assets/moves/krit-sheet.png", frame: 1, req: { crits: 5 }, effect: { type: "damage", mult: 2.0 }, anti: "tank", desc: "5 kritikden sonra novbeti zerbe x2." },
  { id: "krit-03", classId: "krit", name: "Qanli imza", icon: "assets/moves/krit-sheet.png", frame: 2, req: { crits: 2 }, effect: { type: "damage", mult: 1.45, critBoost: 12 }, anti: "mag", desc: "Maglara qarsi tehlikeli." },
  { id: "krit-04", classId: "krit", name: "Boyun acisi", icon: "assets/moves/krit-sheet.png", frame: 3, req: { crits: 3 }, effect: { type: "pierce", mult: 1.55 }, anti: "tank", desc: "Bloku delebilir." },
  { id: "krit-05", classId: "krit", name: "Cib ba", icon: "assets/moves/krit-sheet.png", frame: 4, req: { hits: 2, crits: 2 }, effect: { type: "damage", mult: 1.7 }, anti: "uvorot", desc: "Suretli bitiris." },
  { id: "krit-06", classId: "krit", name: "Qara sans", icon: "assets/moves/krit-sheet.png", frame: 5, req: { crits: 4 }, effect: { type: "damage", mult: 1.9, critBoost: 18 }, anti: "guc", desc: "Krit dalgasini boyudur." },
  { id: "krit-07", classId: "krit", name: "Sssiz yara", icon: "assets/moves/krit-sheet.png", frame: 6, req: { crits: 5, rage: 20 }, effect: { type: "damage", mult: 2.15 }, anti: "mag", desc: "Mana ustalarini susdurur." },
  { id: "krit-08", classId: "krit", name: "Qzl ksik", icon: "assets/moves/krit-sheet.png", frame: 7, req: { crits: 6 }, effect: { type: "pierce", mult: 2.2 }, anti: "tank", desc: "Zirehe qarsi." },
  { id: "krit-09", classId: "krit", name: "Bir nefes", icon: "assets/moves/krit-sheet.png", frame: 8, req: { crits: 7 }, effect: { type: "damage", mult: 2.4, critBoost: 22 }, anti: "guc", desc: "Qisa pencerede maksimum risk." },
  { id: "krit-10", classId: "krit", name: "Final kesim", icon: "assets/moves/krit-sheet.png", frame: 9, req: { crits: 8, rage: 50 }, effect: { type: "damage", mult: 2.85 }, anti: "tank", desc: "Krit sinfinin finali." },

  { id: "tank-01", classId: "tank", name: "Qalxan durusu", icon: "assets/moves/tank-sheet.png", frame: 0, req: { rage: 0 }, effect: { type: "guard", mult: 0.8 }, anti: "krit", desc: "Kritleri yumaldr." },
  { id: "tank-02", classId: "tank", name: "Dmir blok", icon: "assets/moves/tank-sheet.png", frame: 1, req: { rage: 15 }, effect: { type: "guardHit", mult: 1.05 }, anti: "krit", desc: "Mudafie + cavab." },
  { id: "tank-03", classId: "tank", name: "Sin zirehi", icon: "assets/moves/tank-sheet.png", frame: 2, req: { rage: 25 }, effect: { type: "guard", mult: 1.1 }, anti: "guc", desc: "Agir zerbeyi saxlayir." },
  { id: "tank-04", classId: "tank", name: "Da addim", icon: "assets/moves/tank-sheet.png", frame: 3, req: { rage: 30, hits: 2 }, effect: { type: "damage", mult: 1.3 }, anti: "uvorot", desc: "Qacan reqibi sxr." },
  { id: "tank-05", classId: "tank", name: "ks zrb", icon: "assets/moves/tank-sheet.png", frame: 4, req: { rage: 35 }, effect: { type: "guardHit", mult: 1.35 }, anti: "krit", desc: "Hucumu geri qaytarir." },
  { id: "tank-06", classId: "tank", name: "Qala nfsi", icon: "assets/moves/tank-sheet.png", frame: 5, req: { rage: 45 }, effect: { type: "heal", mult: 0.12 }, anti: "guc", desc: "Canin bir hissesi qayidir." },
  { id: "tank-07", classId: "tank", name: "Bulava basqisi", icon: "assets/moves/tank-sheet.png", frame: 6, req: { rage: 50, hits: 3 }, effect: { type: "damage", mult: 1.65 }, anti: "mag", desc: "Maga yaxin mesafe tezyiqi." },
  { id: "tank-08", classId: "tank", name: "Beton divar", icon: "assets/moves/tank-sheet.png", frame: 7, req: { rage: 60 }, effect: { type: "guard", mult: 1.7 }, anti: "krit", desc: "Krit sinfine anti." },
  { id: "tank-09", classId: "tank", name: "Ar hkm", icon: "assets/moves/tank-sheet.png", frame: 8, req: { rage: 70 }, effect: { type: "damage", mult: 2.05 }, anti: "uvorot", desc: "Az sans, agir netice." },
  { id: "tank-10", classId: "tank", name: "Qala yxan", icon: "assets/moves/tank-sheet.png", frame: 9, req: { rage: 85 }, effect: { type: "guardHit", mult: 2.25 }, anti: "guc", desc: "Tank finali." },

  { id: "uvorot-01", classId: "uvorot", name: "Yana qa", icon: "assets/moves/uvorot-sheet.png", frame: 0, req: { dodges: 0 }, effect: { type: "dodgeHit", mult: 0.95 }, anti: "tank", desc: "Uvorot ve yngl cavab." },
  { id: "uvorot-02", classId: "uvorot", name: "Klg addm", icon: "assets/moves/uvorot-sheet.png", frame: 1, req: { dodges: 2 }, effect: { type: "dodgeHit", mult: 1.2 }, anti: "guc", desc: "Gcllrin ritmini pozur." },
  { id: "uvorot-03", classId: "uvorot", name: "K salto", icon: "assets/moves/uvorot-sheet.png", frame: 2, req: { dodges: 3 }, effect: { type: "dodgeHit", mult: 1.35 }, anti: "krit", desc: "Krit pncrsindn xr." },
  { id: "uvorot-04", classId: "uvorot", name: "Arxa zrb", icon: "assets/moves/uvorot-sheet.png", frame: 3, req: { dodges: 3, hits: 2 }, effect: { type: "damage", mult: 1.45 }, anti: "mag", desc: "Arxadan suretli zerbe." },
  { id: "uvorot-05", classId: "uvorot", name: "Duman keidi", icon: "assets/moves/uvorot-sheet.png", frame: 4, req: { dodges: 4 }, effect: { type: "dodgeHit", mult: 1.55 }, anti: "guc", desc: "Agir zerbeden qacir." },
  { id: "uvorot-06", classId: "uvorot", name: "Kskin dn", icon: "assets/moves/uvorot-sheet.png", frame: 5, req: { dodges: 5 }, effect: { type: "damage", mult: 1.75 }, anti: "tank", desc: "Tankin arxasina kecir." },
  { id: "uvorot-07", classId: "uvorot", name: "Srtli czq", icon: "assets/moves/uvorot-sheet.png", frame: 6, req: { dodges: 5, crits: 1 }, effect: { type: "damage", mult: 1.9 }, anti: "mag", desc: "Mana ritmini kesir." },
  { id: "uvorot-08", classId: "uvorot", name: "Boluq ovu", icon: "assets/moves/uvorot-sheet.png", frame: 7, req: { dodges: 6 }, effect: { type: "dodgeHit", mult: 2.05 }, anti: "krit", desc: "Kritciye anti." },
  { id: "uvorot-09", classId: "uvorot", name: "Gec izi", icon: "assets/moves/uvorot-sheet.png", frame: 8, req: { dodges: 7, rage: 30 }, effect: { type: "damage", mult: 2.25 }, anti: "guc", desc: "Hedefi itirir." },
  { id: "uvorot-10", classId: "uvorot", name: "Xyal zrbsi", icon: "assets/moves/uvorot-sheet.png", frame: 9, req: { dodges: 8 }, effect: { type: "dodgeHit", mult: 2.65 }, anti: "tank", desc: "Uvorot finali." },

  { id: "mag-01", classId: "mag", name: "Mavi qlcm", icon: "assets/moves/mag-sheet.png", frame: 0, req: { mana: 18 }, effect: { type: "magic", mult: 1.0, manaCost: 18 }, anti: "tank", desc: "Mana ile sade sehr." },
  { id: "mag-02", classId: "mag", name: "Neon oxu", icon: "assets/moves/mag-sheet.png", frame: 1, req: { mana: 24 }, effect: { type: "magic", mult: 1.25, manaCost: 24 }, anti: "uvorot", desc: "Qacan reqibi izleyir." },
  { id: "mag-03", classId: "mag", name: "K tilsimi", icon: "assets/moves/mag-sheet.png", frame: 2, req: { mana: 30 }, effect: { type: "magic", mult: 1.4, manaCost: 30 }, anti: "guc", desc: "Fiziki gucu yumaldr." },
  { id: "mag-04", classId: "mag", name: "Mana sancagi", icon: "assets/moves/mag-sheet.png", frame: 3, req: { mana: 34 }, effect: { type: "magic", mult: 1.55, manaCost: 34 }, anti: "krit", desc: "Krit ritmini pozur." },
  { id: "mag-05", classId: "mag", name: "Mavi qalxan", icon: "assets/moves/mag-sheet.png", frame: 4, req: { mana: 38 }, effect: { type: "magicGuard", mult: 1.15, manaCost: 38 }, anti: "guc", desc: "Sehrli qoruma." },
  { id: "mag-06", classId: "mag", name: "Gec alovu", icon: "assets/moves/mag-sheet.png", frame: 5, req: { mana: 44 }, effect: { type: "magic", mult: 1.8, manaCost: 44 }, anti: "tank", desc: "Zirehi yandrr." },
  { id: "mag-07", classId: "mag", name: "Ayna hiylsi", icon: "assets/moves/mag-sheet.png", frame: 6, req: { mana: 50 }, effect: { type: "magic", mult: 1.95, manaCost: 50 }, anti: "krit", desc: "Kritciyi aldadr." },
  { id: "mag-08", classId: "mag", name: "Elektrik dairsi", icon: "assets/moves/mag-sheet.png", frame: 7, req: { mana: 58 }, effect: { type: "magic", mult: 2.15, manaCost: 58 }, anti: "uvorot", desc: "Qacan saheni tutur." },
  { id: "mag-09", classId: "mag", name: "Sirli partlay", icon: "assets/moves/mag-sheet.png", frame: 8, req: { mana: 66 }, effect: { type: "magic", mult: 2.4, manaCost: 66 }, anti: "tank", desc: "Agir sehr." },
  { id: "mag-10", classId: "mag", name: "Baki ayini", icon: "assets/moves/mag-sheet.png", frame: 9, req: { mana: 80 }, effect: { type: "magic", mult: 2.85, manaCost: 80 }, anti: "guc", desc: "Mag finali." },
];

moveList.forEach((move) => {
  move.icon = `assets/moves/${move.id}.png`;
  move.frame = 0;
});

function moveById(id) {
  return moveList.find((move) => move.id === id) || moveList[0];
}

function classFromEquipment(equipment = {}) {
  const score = {};
  Object.values(equipment || {}).forEach((id) => {
    const match = /^(guc|krit|tank|uvorot|mag)-/.exec(id || "");
    if (match) score[match[1]] = (score[match[1]] || 0) + 1;
  });
  return Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] || "guc";
}

function selectedMoveIds(state) {
  const classId = classFromEquipment(state.equipment || {});
  const ids = (state.selectedMoves || []).filter((id) => moveById(id).classId === classId).slice(0, 4);
  if (state.movesTouched) return ids;
  return ids.length ? ids : moveList.filter((move) => move.classId === classId).slice(0, 4).map((move) => move.id);
}
