const standardVal = {
  kabel: [
    { namn: "N1XE-AS 4G240", diameter: 0.054 },
    { namn: "N1XE-AS 4G150", diameter: 0.044 },
    { namn: "N1XE-AS 4G95", diameter: 0.034 },
    { namn: "N1XE-AS 4G50", diameter: 0.028 },
    { namn: "N1XE-AR 4G25", diameter: 0.025 },
    { namn: "AXAL-TT 3X300/50", diameter: 0.074 },
    { namn: "AXAL-TT 3X240/5", diameter: 0.070 },
    { namn: "AXAL-TT 3X150/35", diameter: 0.062 },
    { namn: "AXAL-TT 3X95/35", diameter: 0.055 },
    { namn: "AXAL-TT 3X50/25", diameter: 0.048 },
    { namn: "AXAL-TT 3X25/25", diameter: 0.044 },
    { namn: "OPTO Kabel", diameter: 0.040 }
  ],
  ror: [
    { namn: "160", diameter: 0.160 },
    { namn: "125", diameter: 0.125 },
    { namn: "110", diameter: 0.110 },
    { namn: "75", diameter: 0.075 },
    { namn: "50", diameter: 0.050 },
    { namn: "OPTO RÖR", diameter: 0.040 }
  ]
};

const rorTyper = ["SRN", "SRS", "SRE"];

const kabelFarger = [
  { namn: "Svart", value: "svart", rgb: "rgb(0,0,0)" },
  { namn: "Röd", value: "rod", rgb: "rgb(255,0,0)" },
  { namn: "Lila", value: "lila", rgb: "rgb(191,0,255)" },
  { namn: "Grön", value: "gron", rgb: "rgb(0,165,0)" }
];

let lista = [];
let draggedIndex = null;
function getValdTyp() {
  return document.querySelector('input[name="typ"]:checked').value;
}

function getBerakningslage() {
  return document.querySelector('input[name="berakningslage"]:checked').value;
}

function anvandSidoutrymme() {
  const el = document.getElementById("sidoutrymmeToggle");
  return el ? el.checked : true;
}

function getSidoutrymme() {
  return anvandSidoutrymme() ? 0.1 : 0;
}

function uppdateraSidoutrymmeText() {
  const btn = document.getElementById("sidoutrymmeBtn");
  const toggle = document.getElementById("sidoutrymmeToggle");
  const notice = document.getElementById("sideSpaceNotice");
  if (!toggle) return;

  if (btn) {
    btn.textContent = toggle.checked ? "Sidoutrymme: På" : "Sidoutrymme: Av";
  }

  if (notice) {
    notice.style.display = toggle.checked ? "none" : "inline-flex";
    notice.textContent = "Sidoutrymme ej räknat med";
  }
}

function toggleSidoutrymme() {
  const toggle = document.getElementById("sidoutrymmeToggle");
  if (!toggle) return;
  toggle.checked = !toggle.checked;
  uppdateraSidoutrymmeText();
  uppdatera();
}

function getValdKabelFargTop() {
  const el = document.getElementById("kabelFargTop");
  return el ? el.value : "svart";
}

function typNamn(typ) {
  return typ === "ror" ? "Rör" : "Kabel";
}

function avrundaUppTillTiondel(varde) {
  return Math.ceil(varde * 10) / 10;
}

function arOpto(item) {
  if (!item || !item.namn) return false;
  const namn = String(item.namn).trim().toUpperCase();
  return namn === "OPTO" || namn === "OPTO KABEL" || namn === "OPTO RÖR";
}

function hamtaSchaktBokstav(varde) {
  const steg = Math.round(varde * 10);
  const bokstaver = [
    "A–A","B–B","C–C","D–D","E–E","F–F","G–G","H–H","I–I","J–J",
    "K–K","L–L","M–M","N–N","O–O","P–P","Q–Q","R–R","S–S","T–T",
    "U–U","V–V","W–W","X–X","Y–Y","Z–Z"
  ];

  if (steg >= 1 && steg <= bokstaver.length) {
    return bokstaver[steg - 1];
  }

  return "-";
}

function uppdateraAntalTotalt() {
  document.getElementById("antalTotalt").innerText = lista.length;
}

function fyllKabelFargTop() {
  const wrap = document.getElementById("kabelFargTopWrap");
  const select = document.getElementById("kabelFargTop");
  const typ = getValdTyp();

  if (!wrap || !select) return;

  if (typ !== "kabel") {
    wrap.style.display = "none";
    select.innerHTML = "";
    return;
  }

  wrap.style.display = "block";
  const vald = select.value || "svart";

  select.innerHTML = "";
  kabelFarger.forEach(f => {
    const option = document.createElement("option");
    option.value = f.value;
    option.textContent = f.namn;
    if (f.value === vald) option.selected = true;
    select.appendChild(option);
  });
}

function fyllStandardVal() {
  const typ = getValdTyp();
  const select = document.getElementById("standardValjare");
  const listaVal = standardVal[typ];

  select.innerHTML = "";

  listaVal.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${item.namn} (${(item.diameter * 1000).toFixed(0)} mm)`;
    select.appendChild(option);
  });

  if (listaVal.length > 0) {
    document.getElementById("diameter").value = (listaVal[0].diameter * 1000).toFixed(0);
  }

  fyllKabelFargTop();
}

function valjStandard() {
  const typ = getValdTyp();
  const index = document.getElementById("standardValjare").value;
  const vald = standardVal[typ][index];

  if (vald) {
    document.getElementById("diameter").value = (vald.diameter * 1000).toFixed(0);
  }
}

function laggTill() {
  const dMm = parseFloat(document.getElementById("diameter").value);
  const antal = parseInt(document.getElementById("antal").value, 10);
  const typ = getValdTyp();
  const index = document.getElementById("standardValjare").value;
  const vald = standardVal[typ][index];
  const kabelFargTop = getValdKabelFargTop();

  if (!dMm || dMm <= 0) {
    alert("Fel värde på diameter");
    return;
  }

  if (!antal || antal <= 0) {
    alert("Fel värde på antal");
    return;
  }

  for (let i = 0; i < antal; i++) {
    lista.push({
      diameter: dMm / 1000,
      typ: typ,
      namn: vald ? vald.namn : "",
      rorTyp: typ === "ror" ? "SRN" : "",
      kabelFarg: typ === "kabel" ? kabelFargTop : "",
      avstandEfter: null
    });
  }

  uppdatera();
}

function rensa() {
  lista = [];
  document.getElementById("antal").value = 1;
  uppdatera();
}

function taBort(index) {
  lista.splice(index, 1);
  uppdatera();
}

function andraDiameter(index, value) {
  const d = parseFloat(value) / 1000;
  if (d > 0) {
    lista[index].diameter = d;
    uppdatera();
  }
}

function andraTyp(index, value) {
  lista[index].typ = value;
  lista[index].namn = "";
  lista[index].rorTyp = value === "ror" ? "SRN" : "";
  lista[index].kabelFarg = value === "kabel" ? "svart" : "";
  uppdatera();
}

function andraRorTyp(index, value) {
  lista[index].rorTyp = value;
  uppdatera();
}

function andraKabelFarg(index, value) {
  lista[index].kabelFarg = value;
  uppdatera();
}

function andraAvstandEfter(index, value) {
  if (!lista[index]) return;
  if (value === "" || value === null) {
    lista[index].avstandEfter = null;
    uppdatera();
    return;
  }
  const mm = parseFloat(value);
  if (!Number.isFinite(mm) || mm < 0) {
    alert("Avstånd måste vara 0 mm eller större");
    return;
  }
  lista[index].avstandEfter = mm / 1000;
  uppdatera();
}

function aterstallAvstandEfter(index) {
  if (!lista[index]) return;
  lista[index].avstandEfter = null;
  uppdatera();
}

function flyttaItem(fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex == null || toIndex == null) return;
  const item = lista.splice(fromIndex, 1)[0];
  lista.splice(toIndex, 0, item);
  uppdatera();
}

function hamtaKabelFarg(item) {
  if (!item || item.typ !== "kabel") return "rgb(0,0,0)";

  switch (item.kabelFarg) {
    case "rod":
      return "rgb(255,0,0)";
    case "lila":
      return "rgb(191,0,255)";
    case "gron":
      return "rgb(0,165,0)";
    case "svart":
    default:
      return "rgb(0,0,0)";
  }
}

function hamtaKabelFargNamn(value) {
  const hittad = kabelFarger.find(f => f.value === value);
  return hittad ? hittad.namn : "";
}

function renderLista() {
  const wrap = document.getElementById("lista");
  wrap.innerHTML = lista.length > 1 ? `<div class="gap-help">Tips: lämna “Avstånd till nästa” tomt för automatisk regel, eller skriv eget avstånd i mm.</div>` : "";

  lista.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "drag-item";
    row.setAttribute("draggable", "true");
    row.dataset.index = i;

    row.innerHTML = `
      <span class="drag-handle" title="Dra för att flytta">⋮⋮</span>
      <span class="item-number">${i + 1}.</span>

      <select onchange="andraTyp(${i}, this.value)">
        <option value="ror" ${item.typ === "ror" ? "selected" : ""}>Rör</option>
        <option value="kabel" ${item.typ === "kabel" ? "selected" : ""}>Kabel</option>
      </select>

      ${item.typ === "ror" ? `
        <select onchange="andraRorTyp(${i}, this.value)">
          ${rorTyper.map(t => `
            <option value="${t}" ${item.rorTyp === t ? "selected" : ""}>${t}</option>
          `).join("")}
        </select>
      ` : ""}

      ${item.typ === "kabel" ? `
        <select onchange="andraKabelFarg(${i}, this.value)">
          ${kabelFarger.map(f => `
            <option value="${f.value}" ${item.kabelFarg === f.value ? "selected" : ""}>${f.namn}</option>
          `).join("")}
        </select>
      ` : ""}

      <input type="text" class="readonly-name" value="${item.namn || ""}" readonly>

      <input type="number"
             value="${(item.diameter * 1000).toFixed(0)}"
             onchange="andraDiameter(${i}, this.value)"
             style="width:80px"> mm

      ${i < lista.length - 1 ? `
        <span class="gap-editor" title="Tomt fält använder automatiskt avstånd enligt regeln. Skriv eget värde för att styra avståndet.">
          Avstånd till nästa:
          <input type="number"
                 min="0"
                 placeholder="auto"
                 value="${item.avstandEfter !== null && item.avstandEfter !== undefined ? Math.round(item.avstandEfter * 1000) : ''}"
                 onchange="andraAvstandEfter(${i}, this.value)"> mm
          <button class="gap-reset-btn" onclick="aterstallAvstandEfter(${i})" type="button">Auto</button>
        </span>
      ` : ""}

      <button onclick="taBort(${i})" style="color:white; font-weight:bold;">×</button>
    `;

    row.addEventListener("dragstart", (e) => {
      draggedIndex = i;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", i);
    });

    row.addEventListener("dragend", () => {
      draggedIndex = null;
      document.querySelectorAll(".drag-item").forEach(el => {
        el.classList.remove("dragging", "drag-over");
      });
    });

    row.addEventListener("dragover", (e) => {
      e.preventDefault();
      row.classList.add("drag-over");
    });

    row.addEventListener("dragleave", () => {
      row.classList.remove("drag-over");
    });

    row.addEventListener("drop", (e) => {
      e.preventDefault();
      row.classList.remove("drag-over");
      const targetIndex = parseInt(row.dataset.index, 10);
      flyttaItem(draggedIndex, targetIndex);
    });

    wrap.appendChild(row);
  });
}

function beraknaMellanrum(a, b) {
  if (a && a.avstandEfter !== null && a.avstandEfter !== undefined) {
    return {
      avstand: a.avstandEfter,
      text: `eget avstånd (${Math.round(a.avstandEfter * 1000)} mm)`
    };
  }

  const aOpto = arOpto(a);
  const bOpto = arOpto(b);

  if (aOpto && bOpto) {
    return {
      avstand: 0,
      text: "OPTO till OPTO (0 mm)"
    };
  }

  if (aOpto || bOpto) {
    return {
      avstand: 0.05,
      text: "OPTO till annat (50 mm)"
    };
  }

  const storsta = Math.max(a.diameter, b.diameter);

  if (a.typ === "ror" && b.typ === "ror") {
    return {
      avstand: storsta / 2,
      text: `½ av största (${(storsta * 1000).toFixed(0)} mm)`
    };
  }

  return {
    avstand: storsta,
    text: `hela största (${(storsta * 1000).toFixed(0)} mm)`
  };
}

function sattResultat(bredd) {
  const avrundad = avrundaUppTillTiondel(bredd);
  const text = `${bredd.toFixed(3)} m ~ ${avrundad.toFixed(1)} m`;

  document.getElementById("result").innerText = text;
  document.getElementById("resultBadge").innerText = text;
  document.getElementById("schaktTabell").innerText = hamtaSchaktBokstav(avrundad);
}

function tomtResultat() {
  document.getElementById("result").innerText = "0.000 m ~ 0.0 m";
  document.getElementById("resultBadge").innerText = "0.000 m ~ 0.0 m";
  document.getElementById("schaktTabell").innerText = "-";
  document.getElementById("utrakning").innerHTML = "";
  document.getElementById("utrakningSimple").innerHTML = "";
  const scaleInfoTom = document.getElementById("scaleInfo"); if (scaleInfoTom) scaleInfoTom.innerText = "";
}

function byggUtrakning(visningsLista, luckor) {
  const sidoutrymme = getSidoutrymme();
  let bredd = sidoutrymme;
  let text = "";
  const delar = [];

  if (sidoutrymme > 0) {
    text = `0.1 <span style="color:gray">(sidoutrymme vänster)</span>`;
    delar.push("0.1");
  } else {
    text = `<span class="no-side-space">Sidoutrymme ej räknat med:</span> `;
  }

  for (let i = 0; i < visningsLista.length; i++) {
    bredd += visningsLista[i].diameter;
    delar.push(visningsLista[i].diameter.toFixed(3));

    const extraInfo = [
      visningsLista[i].namn || "",
      visningsLista[i].typ === "ror" ? visningsLista[i].rorTyp || "" : "",
      visningsLista[i].typ === "kabel" && visningsLista[i].kabelFarg
        ? hamtaKabelFargNamn(visningsLista[i].kabelFarg)
        : ""
    ].filter(Boolean).join(", ");

    text += `${i === 0 && sidoutrymme === 0 ? "" : " + "}${visningsLista[i].diameter.toFixed(3)} <span style="color:gray">(${typNamn(visningsLista[i].typ)}, ${(visningsLista[i].diameter * 1000).toFixed(0)} mm${extraInfo ? ", " + extraInfo : ""})</span>`;

    if (i < visningsLista.length - 1) {
      const m = beraknaMellanrum(visningsLista[i], visningsLista[i + 1]);
      luckor.push(m.avstand);
      bredd += m.avstand;
      delar.push(m.avstand.toFixed(3));
      text += ` + ${m.avstand.toFixed(3)} <span style="color:gray">(${m.text})</span>`;
    }
  }

  if (sidoutrymme > 0) {
    bredd += sidoutrymme;
    delar.push("0.1");
    text += ` + 0.1 <span style="color:gray">(sidoutrymme höger)</span>`;
  }

  return {
    bredd,
    text,
    textSimple: delar.join(" + ")
  };
}

function beraknaStandard() {
  if (lista.length === 0) {
    tomtResultat();
    return {
      totalBredd: 0,
      visningsLista: [],
      luckor: []
    };
  }

  const visningsLista = [...lista].sort((a, b) => {
    const aOpto = arOpto(a);
    const bOpto = arOpto(b);

    if (aOpto && bOpto) return 0;
    if (aOpto && !bOpto) return -1;
    if (bOpto && !aOpto) return 1;

    return a.diameter - b.diameter;
  });

  const luckor = [];
  const byggd = byggUtrakning(visningsLista, luckor);

  sattResultat(byggd.bredd);
  document.getElementById("utrakning").innerHTML = byggd.text;
  document.getElementById("utrakningSimple").innerText = byggd.textSimple;

  return {
    totalBredd: byggd.bredd,
    visningsLista,
    luckor
  };
}

function beraknaFriOrdning() {
  if (lista.length === 0) {
    tomtResultat();
    return {
      totalBredd: 0,
      visningsLista: [],
      luckor: []
    };
  }

  const visningsLista = [...lista];
  const luckor = [];
  const byggd = byggUtrakning(visningsLista, luckor);

  sattResultat(byggd.bredd);
  document.getElementById("utrakning").innerHTML = byggd.text;
  document.getElementById("utrakningSimple").innerText = byggd.textSimple;

  return {
    totalBredd: byggd.bredd,
    visningsLista,
    luckor
  };
}

function berakna() {
  const lage = getBerakningslage();
  if (lage === "fri") return beraknaFriOrdning();
  return beraknaStandard();
}

function ritaSchakt(data) {
  const svg = document.getElementById("schaktSvg");
  svg.innerHTML = "";

  const wrap = svg.parentElement;
  const wrapWidth = Math.max(320, wrap.clientWidth - 20);
  const antalObjekt = data && data.visningsLista ? data.visningsLista.length : 0;
  const extraBredd = Math.max(0, antalObjekt - 4) * 130;
  let W = Math.max(900, wrapWidth, 1050 + extraBredd);

  const marginLeft = 70;
  const marginRight = 70;
  let innerWidth = W - marginLeft - marginRight;

  if (!data || data.visningsLista.length === 0) {
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", 420);
    svg.setAttribute("viewBox", `0 0 ${W} 420`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.dataset.exportWidth = W;
    svg.dataset.exportHeight = 420;

    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.setAttribute("x", 40);
    t.setAttribute("y", 140);
    t.setAttribute("fill", "#666");
    t.setAttribute("font-size", "16");
    t.textContent = "Ingen illustration ännu";
    svg.appendChild(t);

    const scaleInfoTom = document.getElementById("scaleInfo"); if (scaleInfoTom) scaleInfoTom.innerText = "";
    return;
  }

  const totalM = data.totalBredd;
  const maxDiameterM = Math.max(...data.visningsLista.map(item => item.diameter));
  const basePxPerM = innerWidth / totalM;
  const minLargestDiameterPx = 120;
  const minPxPerM = minLargestDiameterPx / maxDiameterM;
  const pxPerM = Math.max(basePxPerM, minPxPerM);

  innerWidth = totalM * pxPerM;
  W = innerWidth + marginLeft + marginRight;

  const maxRadiusPx = (maxDiameterM * pxPerM) / 2;

  const topPadding = 70;
  const sideMeasureY = topPadding + Math.max(40, maxRadiusPx * 0.25);
  // Ge plats för stora dimensioner (t.ex. 160 mm) så cirklar inte klipps upptill.
  const baseY = topPadding + (maxRadiusPx * 2) + 20;
  const dimY = baseY + 130;
  const H = dimY + 60;

  svg.setAttribute("width", "100%");
  svg.setAttribute("height", H);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.dataset.exportWidth = W;
  svg.dataset.exportHeight = H;

  const scaleInfo = document.getElementById("scaleInfo");
  if (scaleInfo) scaleInfo.innerText = "";

  const ns = "http://www.w3.org/2000/svg";

  function line(x1, y1, x2, y2, color = "#1e73ff", width = 2, dash = "") {
    const el = document.createElementNS(ns, "line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    el.setAttribute("stroke", color);
    el.setAttribute("stroke-width", width);
    if (dash) el.setAttribute("stroke-dasharray", dash);
    svg.appendChild(el);
  }

  function text(x, y, value, color = "#1e73ff", size = 18, weight = "normal", anchor = "middle") {
    const el = document.createElementNS(ns, "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("fill", color);
    el.setAttribute("font-size", size);
    el.setAttribute("font-family", "Arial, sans-serif");
    el.setAttribute("font-weight", weight);
    el.setAttribute("text-anchor", anchor);
    el.setAttribute("dominant-baseline", "middle");
    el.textContent = value;
    svg.appendChild(el);
  }

  function circle(cx, cy, r, item) {
    const el = document.createElementNS(ns, "circle");
    el.setAttribute("cx", cx);
    el.setAttribute("cy", cy);
    el.setAttribute("r", r);

    if (item.typ === "ror") {
      el.setAttribute("fill", "white");
      el.setAttribute("stroke", "#1e73ff");
      el.setAttribute("stroke-width", "2");
    } else {
      const kabelFarg = hamtaKabelFarg(item);
      el.setAttribute("fill", kabelFarg);
      el.setAttribute("stroke", kabelFarg);
      el.setAttribute("stroke-width", "2");
    }

    svg.appendChild(el);
  }

  function rect(x, y, w, h, fill, stroke = "none", rx = 0) {
    const el = document.createElementNS(ns, "rect");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("width", w);
    el.setAttribute("height", h);
    el.setAttribute("fill", fill);
    el.setAttribute("stroke", stroke);
    if (rx) el.setAttribute("rx", rx);
    svg.appendChild(el);
  }

  line(marginLeft, baseY, W - marginRight, baseY);

  let xMeter = getSidoutrymme();
  const positioner = [];

  data.visningsLista.forEach((item, i) => {
    const diameterPx = item.diameter * pxPerM;
    const radiusPx = diameterPx / 2;
    const leftPx = marginLeft + (xMeter * pxPerM);
    const cx = leftPx + radiusPx;
    const cy = baseY - radiusPx;

    positioner.push({
      item,
      index: i,
      leftPx,
      centerPx: cx,
      rightPx: leftPx + diameterPx,
      radiusPx,
      cy
    });

    circle(cx, cy, radiusPx, item);

    const mm = Math.round(item.diameter * 1000);
    const fontSize = Math.max(12, Math.min(28, radiusPx * 0.55));

    if (radiusPx > 18) {
      if (item.typ === "ror") {
        text(cx, cy - 8, mm, "#1e73ff", fontSize, "normal");
      } else {
        text(cx, cy - 8, mm, "white", fontSize, "bold");
      }
    }

    const namnText = item.typ === "ror"
      ? `${item.namn}${item.rorTyp ? " " + item.rorTyp : ""}`
      : item.namn;

    const namnStorlek = data.visningsLista.length > 8 ? 9 : 11;

    text(
      cx,
      cy + radiusPx + 16,
      namnText,
      "#333",
      namnStorlek,
      "normal"
    );

    xMeter += item.diameter;
    if (i < data.visningsLista.length - 1) xMeter += data.luckor[i];
  });

  for (let i = 0; i < positioner.length - 1; i++) {
    const a = positioner[i];
    const b = positioner[i + 1];
    const gapM = data.luckor[i];
    const gapMm = Math.round(gapM * 1000);

    const x1 = a.rightPx;
    const x2 = b.leftPx;
    const gapPx = x2 - x1;

    line(x1, sideMeasureY, x2, sideMeasureY, "#888", 1.5);
    line(x1, sideMeasureY - 8, x1, sideMeasureY + 8, "#888", 1.5);
    line(x2, sideMeasureY - 8, x2, sideMeasureY + 8, "#888", 1.5);

    if (gapPx > 26) {
      const boxW = Math.min(70, Math.max(34, gapPx - 6));
      rect((x1 + x2) / 2 - boxW / 2, sideMeasureY - 12, boxW, 20, "#f7f7f7");
      text((x1 + x2) / 2, sideMeasureY - 1, `${gapMm}`, "#444", Math.max(9, Math.min(12, gapPx * 0.22)), "bold");
    }
  }

  if (anvandSidoutrymme()) {
    const x1 = marginLeft;
    const x2 = marginLeft + (0.1 * pxPerM);
    line(x1, sideMeasureY, x2, sideMeasureY, "#999", 1.2, "4 3");
    line(x1, sideMeasureY - 7, x1, sideMeasureY + 7, "#999", 1.2);
    line(x2, sideMeasureY - 7, x2, sideMeasureY + 7, "#999", 1.2);
    text((x1 + x2) / 2, sideMeasureY - 12, "100", "#666", 11, "bold");

    const x3 = W - marginRight - (0.1 * pxPerM);
    const x4 = W - marginRight;
    line(x3, sideMeasureY, x4, sideMeasureY, "#999", 1.2, "4 3");
    line(x3, sideMeasureY - 7, x3, sideMeasureY + 7, "#999", 1.2);
    line(x4, sideMeasureY - 7, x4, sideMeasureY + 7, "#999", 1.2);
    text((x3 + x4) / 2, sideMeasureY - 12, "100", "#666", 11, "bold");
  } else {
    text(W / 2, Math.max(28, sideMeasureY - 42), "Sidoutrymme ej räknat med", "#b45309", 13, "bold");
  }

  const avrundad = avrundaUppTillTiondel(data.totalBredd);

  line(marginLeft, dimY, W - marginRight, dimY, "#888", 1.5);
  line(marginLeft, dimY - 8, marginLeft, dimY + 8, "#888", 1.5);
  line(W - marginRight, dimY - 8, W - marginRight, dimY + 8, "#888", 1.5);
  text(W / 2, dimY - 16, `Total bredd: ${data.totalBredd.toFixed(3)} m ~ ${avrundad.toFixed(1)} m`, "#444", 14, "bold");
}

function exportPNG() {
  const svg = document.getElementById("schaktSvg");
  const serializer = new XMLSerializer();
  let svgStr = serializer.serializeToString(svg);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const exportWidth = parseFloat(svg.dataset.exportWidth || svg.viewBox.baseVal.width || 1200);
  const exportHeight = parseFloat(svg.dataset.exportHeight || svg.viewBox.baseVal.height || 700);

  canvas.width = exportWidth;
  canvas.height = exportHeight;

  svgStr = svgStr.replace(/width="100%"/, `width="${canvas.width}"`);
  svgStr = svgStr.replace(/height="[^"]+"/, `height="${canvas.height}"`);

  const img = new Image();
  const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  img.onload = function () {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);

    const link = document.createElement("a");
    link.download = "schaktbredd-pro.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  img.src = url;
}

function uppdatera() {
  renderLista();
  uppdateraAntalTotalt();
  const data = berakna();
  ritaSchakt(data);
}

document.getElementById("standardValjare").addEventListener("change", valjStandard);

const kabelFargTop = document.getElementById("kabelFargTop");
if (kabelFargTop) {
  kabelFargTop.addEventListener("change", () => {});
}

document.querySelectorAll('input[name="typ"]').forEach(radio => {
  radio.addEventListener("change", fyllStandardVal);
});

document.querySelectorAll('input[name="berakningslage"]').forEach(radio => {
  radio.addEventListener("change", uppdatera);
});

window.addEventListener("resize", uppdatera);


fyllStandardVal();
uppdateraSidoutrymmeText();
uppdatera();
