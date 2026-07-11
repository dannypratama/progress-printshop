/* ============================================================= */

/* ---------------------- STORAGE KEYS & CONFIG ---------------- */
/* ============================================================= */
const KEYS = {
  autosave: "progress_autosave",
  history: "progress_costings",
  theme: "progress_theme",
  design_orders: "progress_design_orders",
  tasks: "progress_tasks",
  production_orders: "progress_production_orders",
};

const BAHAN = {
  milano: { nama: "Milano", kg: 0.35, harga: 60000, print: 12600 },
  emboss: { nama: "Emboss", kg: 0.34, harga: 60000, print: 12600 },
  airwalk: { nama: "Airwalk", kg: 0.4, harga: 71000, print: 12600 },
  rib: { nama: "Ribpoly", kg: 0.4, harga: 62000, print: 0 },
  lotto: { nama: "Lotto", kg: 0.4, harga: 62000, print: 12600 },
};

const CFG = {
  printPressRate: 12600,
  estimasiRatio: 0.7,
  toastDuration: 2800,
};
const DESIGN_STAGES = ["design", "revisi", "done"];
const PRODUCTION_STAGES = ["design", "printing", "jahit", "qc", "done"];

/* ============================================================= */

/* ---------------------- UTILITIES ---------------------------- */
/* ============================================================= */
function rupiah(n) {
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}
function angka(v) {
  return parseFloat(String(v).replace(/\./g, "")) || 0;
}
function formatRibuan(el) {
  el.value = el.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function titleCase(el) {
  el.value = el.value
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.innerText = val;
}
function getToday() {
  return new Date().toISOString().split("T")[0];
}

/* ============================================================= */

/* ---------------------- TOAST & MODAL ------------------------ */
/* ============================================================= */
let toastTimer = null;
function showToast(msg, type = "success") {
  const el = document.getElementById("toast");
  if (!el) return;
  document.getElementById("toast-msg").textContent = msg;
  el.className = `toast show ${type}`;
  const icon =
    type === "error"
      ? "ri-error-warning-fill"
      : type === "info"
        ? "ri-information-fill"
        : "ri-check-circle-fill";
  el.querySelector(".toast-icon").className = `toast-icon ${icon}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), CFG.toastDuration);
}

const originalOpenModal = window.openModal;

window.openModal = function (modalId) {
  originalOpenModal(modalId);

  if (modalId === "modal-invoice") {
    updateSaveButtonText();
  }
};
function openModal(id) {
  document.getElementById(id)?.classList.add("open");
}

function hasInvoiceDraft() {
  return (
    document.getElementById("invoice-customer")?.value ||
    document.querySelectorAll(".invoice-item-row").length > 0 ||
    document.getElementById("invoice-note")?.value
  );
}

function closeModal(id, force = false) {
  if (id === "modal-invoice" && !force) {
    if (hasInvoiceDraft()) {
      if (!confirm("Invoice belum disimpan. Yakin tutup?")) {
        return;
      }
    }
  }

  document.getElementById(id)?.classList.remove("open");
}

// =============================================================
// PROTECT MODAL INVOICE FROM BACKDROP CLICK
// =============================================================

document.addEventListener(
  "click",
  function (e) {
    const modal = e.target.closest(".modal");

    if (!modal) return;

    const isBackdrop = e.target === modal;

    if (!isBackdrop) return;

    if (modal.id === "modal-invoice") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    modal.classList.remove("open");
  },
  true,
);
/* ============================================================= */

/* ---------------------- THEME & RESET ------------------------ */
/* ============================================================= */
function toggleDark() {
  document.body.classList.toggle("dark");
  app.isDark = document.body.classList.contains("dark");
  localStorage.setItem(KEYS.theme, app.isDark ? "dark" : "light");
  document.getElementById("theme-icon").className = app.isDark
    ? "ri-sun-line"
    : "ri-contrast-2-line";
  if (app.chart) updateCharts();
}

function loadTheme() {
  if (localStorage.getItem(KEYS.theme) === "dark") {
    document.body.classList.add("dark");
    app.isDark = true;
    document.getElementById("theme-icon").className = "ri-sun-line";
  }
}
/* ===================================================== */
/* GLOBAL AVATAR PALETTE */
/* ===================================================== */

const avatarPalettes = [
  {
    bg: "rgba(37, 211, 102, 0.35)",
    text: "#25D366",
  },

  {
    bg: "rgba(18, 140, 126, 0.35)",
    text: "#128C7E",
  },

  {
    bg: "rgba(52, 183, 241, 0.35)",
    text: "#34B7F1",
  },

  {
    bg: "rgba(255, 167, 38, 0.35)",
    text: "#FFA726",
  },

  {
    bg: "rgba(171, 71, 188, 0.35)",
    text: "#AB47BC",
  },

  {
    bg: "rgba(236, 64, 122, 0.35)",
    text: "#EC407A",
  },

  {
    bg: "rgba(0, 172, 193, 0.35)",
    text: "#00ACC1",
  },

  {
    bg: "rgba(66, 165, 245, 0.35)",
    text: "#42A5F5",
  },

  {
    bg: "rgba(255, 82, 82, 0.35)",
    text: "#FF5252",
  },
];

const usedAvatarColors = new Map();

function getAvatarPalette(name = "") {
  if (usedAvatarColors.has(name)) {
    return usedAvatarColors.get(name);
  }

  const palette =
    avatarPalettes[Math.floor(Math.random() * avatarPalettes.length)];

  usedAvatarColors.set(name, palette);

  return palette;
}
/* ============================================================= */

/* ---------------------- HERO DASHBOARD ----------------------- */
/* ============================================================= */
function updateHero() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (document.getElementById("hero-date")) {
    document.getElementById("hero-date").textContent = now.toLocaleDateString(
      "id-ID",
      options,
    );
  }
  if (document.getElementById("hero-clock")) {
    document.getElementById("hero-clock").textContent =
      now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }) + " WIB";
  }

  // Mengambil data dari kedua workflow
  const designOrders =
    typeof getDesignOrders === "function" ? getDesignOrders() : [];
  const prodOrders =
    typeof getProductionOrders === "function" ? getProductionOrders() : [];
  const todayStr =
    typeof getToday === "function"
      ? getToday()
      : now.toISOString().split("T")[0];

  // 1. PESANAN AKTIF
  // Desain: stage === "design"
  // Produksi: stage === "design"
  const activeDesign = designOrders.filter((o) => o.stage === "design").length;
  const activeProd = prodOrders.filter((o) => o.stage === "design").length;
  setText("stat-active-orders", activeDesign + activeProd);

  // 2. DALAM PRODUKSI
  // Desain: stage === "revisi"
  // Produksi: stage === "printing" atau "jahit" atau "qc"
  const prodDesign = designOrders.filter((o) => o.stage === "revisi").length;
  const prodProd = prodOrders.filter((o) =>
    ["printing", "jahit", "qc"].includes(o.stage),
  ).length;
  setText("stat-production", prodDesign + prodProd);

  // 3. SELESAI
  // Desain: stage === "done"
  // Produksi: stage === "done"
  const doneDesign = designOrders.filter((o) => o.stage === "done").length;
  const doneProd = prodOrders.filter((o) => o.stage === "done").length;
  setText("stat-done-today", doneDesign + doneProd);

  // 4. TERLAMBAT
  // Digabung dari semua order (Desain + Produksi) yang melewati deadline dan belum selesai
  const overdueDesign = designOrders.filter(
    (o) => o.deadline && o.deadline < todayStr && o.stage !== "done",
  ).length;
  const overdueProd = prodOrders.filter(
    (o) => o.deadline && o.deadline < todayStr && o.stage !== "done",
  ).length;
  setText("stat-overdue", overdueDesign + overdueProd);
}

function toggleMobileNav() {
  document.getElementById("mobile-nav-menu").classList.toggle("show");
}
function toggleAddDropdown(e) { e.stopPropagation(); document.getElementById("nav-add-menu").classList.toggle("open"); }
document.addEventListener("click", function (e) { var m = document.getElementById("nav-add-menu"); if (m && !e.target.closest(".nav-add-dropdown")) m.classList.remove("open"); });

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
  });

  document.getElementById("mobile-nav-menu").classList.remove("show");
}

/* ============================================================= */

/* ---------------------- DESIGN ORDERS ------------------------ */
/* ============================================================= */
function getDesignOrders() {
  return window.firebaseDesignOrders || [];
}
function saveDesignOrders() {
  renderDesignOrders();

  updatePipeline();

  updateHero();

  updatePipelineChart();
}

async function saveDesignOrder() {
  const customer = document.getElementById("do-customer").value.trim();
  const design = document.getElementById("do-design").value.trim();

  if (!customer || !design) {
    return showToast("Lengkapi nama pelanggan dan desain", "error");
  }

  const data = {
    customer,
    design,
    jenis: document.getElementById("do-jenis").value,
    deadline: document.getElementById("do-deadline").value,
    notes: document.getElementById("do-notes").value,
  };

  try {
    if (app.editDesignId) {
      await updateDoc(doc(db, "design_orders", app.editDesignId), {
        ...data,
        updatedAt: serverTimestamp(),
      });

      showToast("Perubahan desain tersimpan");
    } else {
      await addDoc(collection(db, "design_orders"), {
        ...data,
        stage: "design",
        createdAt: serverTimestamp(),
      });

      showToast("Pesanan desain bertambah");
    }

    closeModal("modal-design");

    ["do-customer", "do-design", "do-jenis", "do-deadline", "do-notes"].forEach(
      (id) => {
        document.getElementById(id).value = "";
      },
    );

    app.editDesignId = null;
    saveDesignOrders();
  } catch (err) {
    console.error(err);
    showToast("Penyimpanan gagal, coba lagi", "error");
  }
}

async function advanceDesignStage(id) {
  const order = getDesignOrders().find((o) => o.id === id);

  if (!order) return;

  const currentIndex = DESIGN_STAGES.indexOf(order.stage);

  if (currentIndex < DESIGN_STAGES.length - 1) {
    const nextStage = DESIGN_STAGES[currentIndex + 1];

    await updateDoc(doc(db, "design_orders", id), {
      stage: nextStage,
    });

    showToast("Pindah ke tahap " + ["Desain", "Revisi", "Selesai"][["design", "revisi", "done"].indexOf(nextStage)]);
  }
}

async function prevDesignStage(id) {
  const order = getDesignOrders().find((o) => o.id === id);

  if (!order) return;

  const currentIndex = DESIGN_STAGES.indexOf(order.stage);

  if (currentIndex > 0) {
    const prevStage = DESIGN_STAGES[currentIndex - 1];

    await updateDoc(doc(db, "design_orders", id), {
      stage: prevStage,
    });

    showToast("Kembali ke tahap sebelumnya");
  }
}

async function markDesignDone(id) {
  await updateDoc(doc(db, "design_orders", id), {
    stage: "done",
  });

  showToast("Pesanan desain selesai");
}

async function deleteDesignOrder(id) {
  if (!confirm("Hapus pesanan desain ini?")) return;

  try {
    await deleteDoc(doc(db, "design_orders", id));

    showToast("Pesanan desain dihapus", "info");
  } catch (err) {
    console.error(err);

    showToast("Hapus gagal, coba lagi", "error");
  }
}

function openEditDesign(id) {
  const order = window.firebaseDesignOrders.find((o) => o.id === id);

  if (!order) return;

  app.editDesignId = id;

  document.getElementById("do-customer").value = order.customer || "";

  document.getElementById("do-design").value = order.design || "";

  document.getElementById("do-jenis").value = order.jenis || "";

  document.getElementById("do-deadline").value = order.deadline || "";

  document.getElementById("do-notes").value = order.notes || "";

  openModal("modal-design");
}

function setDesignFilter(filter) {
  app.designFilter = filter;
  renderDesignOrders();
}
function filterDesignStage(stage) {
  app.stageFilter = app.stageFilter === stage ? null : stage;

  renderDesignOrders();

  document
    .querySelectorAll("[data-stage]")
    .forEach((el) =>
      el.classList.toggle(
        "pipeline-selected",
        el.dataset.stage === app.stageFilter,
      ),
    );
}
function filterByStage(stage) {
  app.stageFilter = app.stageFilter === stage ? null : stage;
  renderDesignOrders();
  const steps = document.querySelectorAll("#pipeline-section .pipeline-step");
  const selectedIdx = DESIGN_STAGES.indexOf(app.stageFilter);
  steps.forEach((el, i) => {
    el.classList.toggle("pipeline-selected", el.dataset.stage === app.stageFilter);
    el.classList.toggle("line-active", selectedIdx >= 0 && i < selectedIdx);
  });
}

function updatePipeline() {
  const counts = DESIGN_STAGES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  getDesignOrders().forEach((o) => counts[o.stage]++);
  DESIGN_STAGES.forEach((s) => {
    setText("pipe-" + s, counts[s]);
    const step = document.querySelector(
      `#pipeline-section .pipeline-step[data-stage="${s}"]`,
    );
    if (step) {
      step.classList.remove("active", "done");
      if (counts[s] > 0) step.classList.add(s === "done" ? "done" : "active");
    }
  });
}

function renderDesignOrders() {
  let orders = window.firebaseDesignOrders || [];

  const tbody = document.getElementById("design-tbody");
  const mobileList = document.getElementById("design-mobile-list");

  if (!tbody) return;

  orders = [...orders].sort((a, b) => {
    if (a.stage === "done" && b.stage !== "done") return 1;
    if (a.stage !== "done" && b.stage === "done") return -1;

    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;

    return bTime - aTime;
  });

  const search = (
    document.getElementById("design-search")?.value || ""
  ).toLowerCase();

  const today = getToday();

  if (customerSortModes.designOrder === "az") {
    orders.sort((a, b) =>
      (a.customer || "").localeCompare(b.customer || "", "id", {
        sensitivity: "base",
      }),
    );
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        (o.customer || "").toLowerCase().includes(search) ||
        (o.design || "").toLowerCase().includes(search) ||
        (o.jenis || "").toLowerCase().includes(search),
    );
  }

  if (app.designFilter === "done")
    orders = orders.filter((o) => o.stage === "done");

  if (app.designFilter === "progress")
    orders = orders.filter((o) => o.stage !== "done");

  if (app.designFilter === "overdue")
    orders = orders.filter(
      (o) => o.deadline && o.deadline < today && o.stage !== "done",
    );

  if (app.designFilter === "urgent")
    orders = orders.filter((o) => {
      if (!o.deadline || o.stage === "done") return false;

      const diff = (new Date(o.deadline) - new Date(today)) / 86400000;

      return diff >= 0 && diff <= 2;
    });

  if (app.stageFilter)
    orders = orders.filter((o) => o.stage === app.stageFilter);

  if (search)
    orders = orders.filter(
      (o) =>
        (o.customer || "").toLowerCase().includes(search) ||
        (o.design || "").toLowerCase().includes(search),
    );

  const totalRows = orders.length;

  const p = paginate(orders, pagination.designOrders);

  const visibleOrders = p.items;

  if (!visibleOrders.length) {
    tbody.innerHTML = `
<tr>
<td colspan="6">
<div class="empty-state">
<i class="ri-check-double-line"></i>
Semua tugas desain selesai / kosong
</div>
</td>
</tr>`;

    if (mobileList) mobileList.innerHTML = "";

    renderPagination("design-pagination", 1, 1, "changeDesignPage", totalRows);

    return;
  }

  const statusBadge = {
    design: "badge-design",
    revisi: "badge-revisi",
    done: "badge-done",
  };

  const statusLabel = {
    design: "Desain",
    revisi: "Revisi",
    done: "Selesai",
  };

  tbody.innerHTML = visibleOrders
    .map((o, index) => {
      const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);

      const deadline = o.deadline || "";

      const diffDays = deadline
        ? (new Date(deadline) - new Date(today)) / 86400000
        : 999;

      const overdue = deadline && diffDays < 0 && o.stage !== "done";

      const urgent =
        deadline && diffDays >= 0 && diffDays <= 2 && o.stage !== "done";

      const avatar = getAvatarPalette(o.customer || "");

      return `
<tr>

<td class="table-number">
${rowNumber}
</td>

<td>

<div class="table-customer">

<div
class="table-avatar"
style="
background:${avatar.bg};
color:${avatar.text};
"
>
<i class="ri-user-3-fill"></i>
</div>

<div class="table-info">

<div class="table-title">
${o.customer}
</div>

<div class="table-subtitle">
${
  o.createdAt?.seconds
    ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("id-ID")
    : "-"
}
</div>

</div>

</div>

</td>

<td>

<div class="table-title">
${o.design}
</div>

</td>

<td>

<span class="table-tag">
${o.jenis || "-"}
</span>

</td>

<td>

<div
class="table-deadline"
style="
color:${overdue ? "var(--red)" : urgent ? "var(--yellow)" : ""};
"
>

<i
class="${
        overdue
          ? "ri-alarm-warning-fill"
          : urgent
            ? "ri-time-fill"
            : "ri-calendar-line"
      }"
></i>

${overdue ? "Terlambat" : deadline || "-"}

</div>

</td>

<td>

<span class="badge-status ${statusBadge[o.stage]}">
${statusLabel[o.stage]}
</span>

</td>

<td class="table-action">
  <div class="action-dropdown">
    <button class="btn btn-ghost btn-sm btn-icon-round dropdown-toggle" onclick="toggleActionDropdown(this, event)">
      <i class="ri-more-2-fill"></i>
    </button>
    <div class="dropdown-menu">
      <button class="btn btn-ghost btn-sm btn-icon-round" onclick="prevDesignStage('${o.id}')" title="Back">
        <i class="ri-arrow-left-line"></i>
      </button>
      ${
        o.stage !== "done"
          ? `
      <button class="btn btn-solid btn-sm btn-icon-round" onclick="advanceDesignStage('${o.id}')" title="Next">
        <i class="ri-arrow-right-line"></i>
      </button>
      `
          : ""
      }
      <button class="btn btn-green btn-sm btn-icon-round" onclick="markDesignDone('${o.id}')" title="Done">
        <i class="ri-check-line"></i>
      </button>
      <button class="btn btn-ghost btn-sm btn-icon-round" onclick="openEditDesign('${o.id}')" title="Edit">
        <i class="ri-edit-line"></i>
      </button>
      <button class="btn btn-red btn-sm btn-icon-round" onclick="deleteDesignOrder('${o.id}')" title="Delete">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  </div>
</td>

</tr>
`;
    })
    .join("");

  if (mobileList) {
    mobileList.innerHTML = visibleOrders
      .map((o) => {
        const deadline = o.deadline || "";

        const diffDays = deadline
          ? (new Date(deadline) - new Date(today)) / 86400000
          : 999;

        const overdue = deadline && diffDays < 0 && o.stage !== "done";

        const urgent =
          deadline && diffDays >= 0 && diffDays <= 2 && o.stage !== "done";

        return `

<div class="design-mobile-card">

<div class="design-mobile-head">

<div>

<div class="design-mobile-customer">
${o.customer}
</div>

<div class="design-mobile-title">
${o.design}
</div>

</div>

<span class="badge-status ${statusBadge[o.stage]}">
${statusLabel[o.stage]}
</span>

</div>

<div class="mobile-meta">

<div class="mobile-meta-item">
<i class="ri-price-tag-3-line"></i>
<span>${o.jenis || "-"}</span>
</div>

<div
class="mobile-meta-item ${
          overdue ? "mobile-meta-danger" : urgent ? "mobile-meta-warning" : ""
        }"
>

<i
class="${
          overdue
            ? "ri-alarm-warning-fill"
            : urgent
              ? "ri-error-warning-line"
              : "ri-calendar-line"
        }"
></i>

<span>
${overdue ? "Terlambat" : deadline || "-"}
</span>

</div>

</div>

<div class="design-actions">

<button
class="btn btn-ghost btn-sm btn-icon-round"
onclick="prevDesignStage('${o.id}')">
<i class="ri-arrow-left-line"></i>
</button>

${
  o.stage !== "done"
    ? `
<button
class="btn btn-solid btn-sm btn-icon-round"
onclick="advanceDesignStage('${o.id}')">
<i class="ri-arrow-right-line"></i>
</button>
`
    : ""
}

<button
class="btn btn-green btn-sm btn-icon-round"
onclick="markDesignDone('${o.id}')">
<i class="ri-check-line"></i>
</button>

<button
class="btn btn-ghost btn-sm btn-icon-round"
onclick="openEditDesign('${o.id}')">
<i class="ri-edit-line"></i>
</button>

<button
class="btn btn-red btn-sm btn-icon-round"
onclick="deleteDesignOrder('${o.id}')">
<i class="ri-delete-bin-line"></i>
</button>

</div>

</div>

`;
      })
      .join("");
  }

  renderPagination(
    "design-pagination",
    p.page,
    p.totalPages,
    "changeDesignPage",
    totalRows,
  );
}

/* ============================================================= */

/* ---------------- PRODUCTION ORDERS -------------------------- */
/* ============================================================= */
function getProductionOrders() {
  return window.firebaseProductionOrders || [];
}
function saveProductionOrders() {
  renderProductionOrders();

  updateProductionPipeline();

  updateHero();
}

async function saveProductionOrder() {
  const customer = document.getElementById("po-customer").value.trim();
  if (!customer) return showToast("Lengkapi nama pelanggan", "error");
  const items = window.collectProductionItems ? window.collectProductionItems() : [];
  const subtotal = Number(String(document.getElementById("po-subtotal")?.value || "0").replace(/[^\d]/g, "")) || 0;
  const discount = Number(document.getElementById("po-discount")?.value || 0);
  const total = Number(String(document.getElementById("po-total")?.value || "0").replace(/[^\d]/g, "")) || 0;
  const prodData = { customer, team: document.getElementById("po-team").value, qty: document.getElementById("po-qty").value, material: document.getElementById("po-material").value, deadline: document.getElementById("po-deadline").value, notes: document.getElementById("po-notes").value, items, subtotal, discount, total };
  try {
    if (app.editProductionId) {
      await updateDoc(doc(db, "production_orders", app.editProductionId), { ...prodData });
      if (window._prodLinkedInvoiceId) {
        await updateDoc(doc(db, "invoices", window._prodLinkedInvoiceId), { items, subtotal, discount, total, customer: prodData.customer, note: prodData.notes });
        showToast("Data produksi & invoice tersimpan");
      } else {
        showToast("Data produksi tersimpan");
      }
    } else {
      const docRef = await addDoc(collection(db, "production_orders"), { ...prodData, stage: "design", createdAt: serverTimestamp() });
      if (window._pendingProductionInvoiceId) {
        await updateDoc(doc(db, "invoices", window._pendingProductionInvoiceId), { productionId: docRef.id });
        window._pendingProductionInvoiceId = null;
      }
      showToast("Pesanan produksi bertambah");
    }
    closeModal("modal-production");
    ["po-customer", "po-team", "po-qty", "po-material", "po-deadline", "po-notes", "po-subtotal", "po-discount", "po-total"].forEach((id) => { const el = document.getElementById(id); if (el) el.value = ""; });
    const prodItems = document.getElementById("production-items");
    if (prodItems) prodItems.innerHTML = "";
    app.editProductionId = null;
    window._prodLinkedInvoiceId = null;
  } catch (err) { console.error(err); showToast("Penyimpanan gagal, coba lagi", "error"); }
}

async function nextProductionStage(id) {
  const order = getProductionOrders().find((o) => o.id === id);

  if (!order) return;

  const currentIndex = PRODUCTION_STAGES.indexOf(order.stage);

  if (currentIndex < PRODUCTION_STAGES.length - 1) {
    const nextStage = PRODUCTION_STAGES[currentIndex + 1];

    await updateDoc(doc(db, "production_orders", id), {
      stage: nextStage,
    });

    showToast("Status produksi diperbarui");
  }
}
async function prevProductionStage(id) {
  const order = getProductionOrders().find((o) => o.id === id);

  if (!order) return;

  const currentIndex = PRODUCTION_STAGES.indexOf(order.stage);

  if (currentIndex > 0) {
    const prevStage = PRODUCTION_STAGES[currentIndex - 1];

    await updateDoc(doc(db, "production_orders", id), {
      stage: prevStage,
    });

    showToast("Status produksi diperbarui");
  }
}
async function markProductionDone(id) {
  await updateDoc(doc(db, "production_orders", id), {
    stage: "done",
  });

  showToast("Pesanan produksi selesai");
}
async function deleteProductionOrder(id) {
  if (!confirm("Hapus pesanan produksi ini?")) return;

  try {
    await deleteDoc(doc(db, "production_orders", id));

    showToast("Berhasil dihapus", "info");
  } catch (err) {
    console.error(err);

    showToast("Hapus gagal, coba lagi", "error");
  }
}
function openEditProduction(id) {
  const order = window.firebaseProductionOrders.find((o) => o.id === id);
  if (!order) return;
  app.editProductionId = id;
  document.getElementById("po-customer").value = order.customer || "";
  document.getElementById("po-team").value = order.team || "";
  document.getElementById("po-qty").value = order.qty || "";
  document.getElementById("po-material").value = order.material || "";
  document.getElementById("po-deadline").value = order.deadline || "";
  document.getElementById("po-notes").value = order.notes || "";
  const disc = document.getElementById("po-discount");
  if (disc) disc.value = order.discount || 0;
  const sub = document.getElementById("po-subtotal");
  if (sub) sub.value = order.subtotal ? "Rp" + Number(order.subtotal).toLocaleString("id-ID") : "";
  const tot = document.getElementById("po-total");
  if (tot) tot.value = order.total ? "Rp" + Number(order.total).toLocaleString("id-ID") : "";
  if (order.items && order.items.length && window.renderProductionItems) {
    window.renderProductionItems(order.items);
  }
  if (order.invoiceId) window._prodLinkedInvoiceId = order.invoiceId;
  const title = document.getElementById("po-modal-title");
  if (title) title.textContent = "Edit Produksi";
  openModal("modal-production");
}

function filterProductionStage(stage) {
  app.productionStageFilter = app.productionStageFilter === stage ? null : stage;
  renderProductionOrders();
  const steps = document.querySelectorAll("[data-production-stage]");
  const selectedIdx = PRODUCTION_STAGES.indexOf(app.productionStageFilter);
  steps.forEach((el, i) => {
    el.classList.toggle("pipeline-selected", el.dataset.productionStage === app.productionStageFilter);
    el.classList.toggle("line-active", selectedIdx >= 0 && i < selectedIdx);
  });
}

function updateProductionPipeline() {
  const counts = PRODUCTION_STAGES.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  getProductionOrders().forEach((o) => counts[o.stage]++);
  PRODUCTION_STAGES.forEach((s) => {
    setText("prod-pipe-" + s, counts[s]);
    const step = document.querySelector(
      `.pipeline-step[data-production-stage="${s}"]`,
    );
    if (step) {
      step.classList.remove("active", "done");
      if (counts[s] > 0) step.classList.add(s === "done" ? "done" : "active");
    }
  });
}

window.openProductionNote = function (id) {
  const order = getProductionOrders().find((o) => o.id === id);
  if (!order) return;
  document.getElementById("production-note-id").value = id;
  document.getElementById("production-note-text").value = order.notes || "";
  openModal("modal-production-note");
};

window.saveProductionNote = function () {
  const id = Number(document.getElementById("production-note-id").value);
  const orders = getProductionOrders();
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.notes = document.getElementById("production-note-text").value.trim();
    saveProductionOrders(orders);
    closeModal("modal-production-note");
    showToast("Catatan tersimpan");
  }
};
function renderProductionOrders() {
  let orders = getProductionOrders();

  const tbody = document.getElementById("production-tbody");
  const mobileList = document.getElementById("production-mobile-list");

  if (!tbody) return;

  const today = getToday();

  // ===========================
  // SORT
  // ===========================
  orders = [...orders].sort((a, b) => {
    if (a.stage === "done" && b.stage !== "done") return 1;
    if (a.stage !== "done" && b.stage === "done") return -1;

    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;

    return bTime - aTime;
  });

  // ===========================
  // SEARCH
  // ===========================
  const search = (
    document.getElementById("production-search")?.value || ""
  ).toLowerCase();

  if (search) {
    orders = orders.filter(
      (o) =>
        (o.customer || "").toLowerCase().includes(search) ||
        (o.team || "").toLowerCase().includes(search) ||
        (o.material || "").toLowerCase().includes(search),
    );
  }

  // ===========================
  // FILTER
  // ===========================
  const filter = document.getElementById("production-filter")?.value || "all";

  if (filter === "progress") {
    orders = orders.filter((o) => o.stage !== "done");
  }

  if (filter === "done") {
    orders = orders.filter((o) => o.stage === "done");
  }

  if (filter === "overdue") {
    orders = orders.filter(
      (o) => o.deadline && o.deadline < today && o.stage !== "done",
    );
  }

  if (filter === "urgent") {
    orders = orders.filter((o) => {
      if (!o.deadline || o.stage === "done") return false;

      const diff = (new Date(o.deadline) - new Date(today)) / 86400000;

      return diff >= 0 && diff <= 2;
    });
  }

  if (app.productionStageFilter) {
    orders = orders.filter((o) => o.stage === app.productionStageFilter);
  }

  const totalRows = orders.length;

  const p = paginate(orders, pagination.productionOrders);

  const visibleOrders = p.items;

  // ===========================
  // EMPTY
  // ===========================
  if (!visibleOrders.length) {
    tbody.innerHTML = `
<tr>
<td colspan="7">
<div class="empty-state">
<i class="ri-inbox-line"></i>
Belum ada pesanan produksi
</div>
</td>
</tr>
`;

    if (mobileList) mobileList.innerHTML = "";

    return;
  }

  // ===========================
  // STATUS
  // ===========================
  const statusClass = {
    design: "badge-design",
    printing: "badge-revisi",
    jahit: "badge-revisi",
    qc: "badge-revisi",
    done: "badge-done",
  };

  const statusLabel = {
    design: "Desain",
    printing: "Printing",
    jahit: "Jahit",
    qc: "QC",
    done: "Selesai",
  };

  // ===========================
  // TABLE
  // ===========================
  tbody.innerHTML = visibleOrders
    .map((o, index) => {
      const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
      const deadline = o.deadline || "";

      const diff = deadline
        ? (new Date(deadline) - new Date(today)) / 86400000
        : 999;

      const overdue = deadline && diff < 0 && o.stage !== "done";

      const urgent = deadline && diff >= 0 && diff <= 2 && o.stage !== "done";

      const avatar = getAvatarPalette(o.customer || "");

      return `
<tr>

<td class="table-number">
${rowNumber}
</td>

  <td>

    <div class="table-customer">

      <div
        class="table-avatar"
        style="
          background:${avatar.bg};
          color:${avatar.text};
        "
      >
        <i class="ri-user-3-fill"></i>
      </div>

      <div class="table-info">

        <div class="table-title">
          ${o.customer}
        </div>

        <div class="table-subtitle">
${
  o.createdAt?.seconds
    ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("id-ID")
    : "-"
}
        </div>

      </div>

    </div>

  </td>

  <td>

    <div class="table-title">
      ${o.team || "-"}
    </div>

  </td>

  <td>

    <div class="table-title">
      ${o.qty || "-"}
    </div>

  </td>

  <td>

    <span class="table-tag">
      ${o.material || "-"}
    </span>

  </td>

  <td>

    <div
      class="table-deadline"
      style="
        color:${overdue ? "var(--red)" : urgent ? "var(--yellow)" : ""};
      "
    >

<i
  class="${
    overdue
      ? "ri-alarm-warning-fill"
      : urgent
        ? "ri-error-warning-line"
        : "ri-calendar-line"
  }"
></i>

      ${overdue ? "Terlambat" : deadline || "-"}

    </div>

  </td>

  <td>

    <span class="badge-status ${statusClass[o.stage]}">
      ${statusLabel[o.stage]}
    </span>

  </td>

  <td class="table-action">
  <div class="action-dropdown">
    <button class="btn btn-ghost btn-sm btn-icon-round dropdown-toggle" onclick="toggleActionDropdown(this, event)">
      <i class="ri-more-2-fill"></i>
    </button>
    <div class="dropdown-menu">
      <button class="btn btn-ghost btn-sm btn-icon-round" onclick="prevProductionStage('${o.id}')" title="Back">
        <i class="ri-arrow-left-line"></i>
      </button>
      <button class="btn btn-solid btn-sm btn-icon-round" onclick="nextProductionStage('${o.id}')" title="Next">
        <i class="ri-arrow-right-line"></i>
      </button>
      <button class="btn btn-green btn-sm btn-icon-round" onclick="markProductionDone('${o.id}')" title="Done">
        <i class="ri-check-line"></i>
      </button>
      <button class="btn btn-ghost btn-sm btn-icon-round" onclick="openEditProduction('${o.id}')" title="Edit">
        <i class="ri-edit-line"></i>
      </button>
      <button class="btn btn-red btn-sm btn-icon-round" onclick="deleteProductionOrder('${o.id}')" title="Delete">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  </div>
</td>

</tr>
`;
    })
    .join("");

  if (mobileList) {
    mobileList.innerHTML = visibleOrders
      .map((o, index) => {
        const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
        const deadline = o.deadline || "";

        const diff = deadline
          ? (new Date(deadline) - new Date(today)) / 86400000
          : 999;

        const overdue = deadline && diff < 0 && o.stage !== "done";

        const urgent = deadline && diff >= 0 && diff <= 2 && o.stage !== "done";

        return `

<div class="design-mobile-card">

  <div class="design-mobile-head">

    <div>

      <div class="design-mobile-customer">
        ${o.customer}
      </div>

      <div class="design-mobile-title">
        ${o.team || "-"}
      </div>

    </div>

    <span class="badge-status ${statusClass[o.stage]}">
      ${statusLabel[o.stage]}
    </span>

  </div>

  <div class="mobile-meta">

    <div class="mobile-meta-item">
      <i class="ri-t-shirt-2-line"></i>
      <span>${o.material || "-"}</span>
    </div>

    <div class="mobile-meta-item">
      <i class="ri-stack-line"></i>
      <span>${o.qty || "-"} pcs</span>
    </div>

    <div
      class="mobile-meta-item
      ${overdue ? "mobile-meta-danger" : urgent ? "mobile-meta-warning" : ""}"
    >
<i
  class="${
    overdue
      ? "ri-alarm-warning-fill"
      : urgent
        ? "ri-error-warning-line"
        : "ri-calendar-line"
  }"
></i>
      <span>${overdue ? "Terlambat" : deadline || "-"}</span>
    </div>

  </div>

  <div class="design-actions">

    <button
      class="btn btn-ghost btn-sm btn-icon-round"
      onclick="prevProductionStage('${o.id}')"
    >
      <i class="ri-arrow-left-line"></i>
    </button>

    ${
      o.stage !== "done"
        ? `
    <button
      class="btn btn-solid btn-sm btn-icon-round"
      onclick="nextProductionStage('${o.id}')"
    >
      <i class="ri-arrow-right-line"></i>
    </button>
    `
        : ""
    }

    <button
      class="btn btn-green btn-sm btn-icon-round"
      onclick="markProductionDone('${o.id}')"
    >
      <i class="ri-check-line"></i>
    </button>

    <button
      class="btn btn-ghost btn-sm btn-icon-round"
      onclick="openEditProduction('${o.id}')"
    >
      <i class="ri-edit-line"></i>
    </button>

    <button
      class="btn btn-red btn-sm btn-icon-round"
      onclick="deleteProductionOrder('${o.id}')"
    >
      <i class="ri-delete-bin-line"></i>
    </button>

  </div>

</div>

`;
      })
      .join("");
  }
  renderPagination(
    "production-pagination",
    p.page,
    p.totalPages,
    "changeProductionPage",
    totalRows,
  );
}
window.updateProductionPipeline = updateProductionPipeline;

window.renderProductionOrders = renderProductionOrders;

/* ============================================================= */

/* ---------------------- TASKS -------------------------------- */
/* ============================================================= */
function getTasks() {
  return JSON.parse(localStorage.getItem(KEYS.tasks) || "[]");
}
function saveTasks(tasks) {
  localStorage.setItem(KEYS.tasks, JSON.stringify(tasks));
  renderTasks();
}

function saveTask() {
  const text = document.getElementById("task-text").value.trim();
  if (!text) return showToast("Masukkan deskripsi", "error");
  const tasks = getTasks();
  tasks.unshift({
    id: Date.now(),
    text,
    priority: document.getElementById("task-priority").value,
    due: document.getElementById("task-due").value,
    done: false,
    created: new Date().toISOString(),
  });
  saveTasks(tasks);
  document.getElementById("task-text").value = "";
  document.getElementById("task-due").value = "";
  closeModal("modal-task");
  showToast("Tugas baru");
}

function toggleTask(id) {
  const tasks = getTasks();
  const t = tasks.find((x) => x.id === id);
  if (t) {
    t.done = !t.done;
    saveTasks(tasks);
  }
}
function deleteTask(id) {
  saveTasks(getTasks().filter((t) => t.id !== id));
  showToast("Tugas dihapus", "info");
}

function renderTasks() {
  const pending = getTasks().filter((t) => !t.done),
    done = getTasks().filter((t) => t.done);
  setText("task-pending-count", pending.length);
  setText("task-done-count", done.length);
  const renderList = (tasks, containerId, msg) => {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (!tasks.length)
      return (el.innerHTML = `<div class="empty-state"><i class="ri-${containerId.includes("done") ? "check-double" : "checkbox-blank-circle"}-line"></i>${msg}</div>`);
    const color = {
      urgent: "var(--red)",
      high: "var(--yellow)",
      normal: "var(--text-3)",
    };
    el.innerHTML = tasks
      .map(
        (t) => `
          <div class="task-item">
            <div class="task-check ${t.done ? "done" : ""}" onclick="toggleTask(${t.id})">${t.done ? '<i class="ri-check-line"></i>' : ""}</div>
            <div style="flex:1;">
              <div class="task-text ${t.done ? "done-text" : ""}">${t.text}</div>
              <div style="font-size:11px; color:var(--text-3); margin-top:4px;"><span style="color:${color[t.priority]}; font-weight:600">● ${t.priority.toUpperCase()}</span> ${t.due ? `· ${t.due}` : ""}</div>
            </div>
            <button class="btn btn-ghost btn-sm btn-icon-round" onclick="deleteTask(${t.id})"><i class="ri-delete-bin-line"></i></button>
          </div>
        `,
      )
      .join("");
  };
  renderList(pending, "task-list-pending", "Tidak ada tugas tertunda");
  renderList(done, "task-list-done", "Belum ada tugas selesai");
}

/* ============================================================= */

/* ---------------------- COST ESTIMATOR ---------------------- */
/* ============================================================= */
function resetCard(ids) {
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  hitung();
  showToast("Form direset", "info");
}
function resetFormCosting() {
  if (!confirm("Reset semua form estimasi biaya?")) return;
  [
    "customer",
    "team",
    "pcs",
    "hargaJualPcs",
    "milano",
    "emboss",
    "airwalk",
    "rib",
    "lotto",
    "jahitPcs",
    "jahitHarga",
    "ongkirNama",
    "ongkirHarga",
    "ongkirKet",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  hitung();
  showToast("Estimasi biaya direset", "info");
}
function hitungTambahan() {
  let total = 0;

  document.querySelectorAll(".extra-item").forEach((item) => {
    const inputs = item.querySelectorAll("input");

    const qty = parseFloat(inputs[1]?.value) || 0;

    const harga = angka(inputs[2]?.value || "");

    const subtotal = qty * harga;

    const totalEl = item.querySelector(".extra-total");

    if (totalEl) {
      totalEl.textContent = rupiah(subtotal);
    }

    total += subtotal;
  });

  return total;
}

let extraIndex = 0;

function tambahItem(data = {}) {
  extraIndex++;

  const wrap = document.createElement("div");

  wrap.className = "extra-item";

  wrap.innerHTML = `

    <div class="extra-grid">

      <input
        class="input extra-name"
        placeholder="Nama barang"
        value="${data.nama || ""}"
          oninput="titleCase(this); hitung()"
      />

      <input
        class="input extra-qty"
        type="number"
        placeholder="pcs"
        value="${data.qty || ""}"
        oninput="hitung()"
      />

      <input
        class="input extra-price"
        placeholder="Harga"
        value="${data.harga || ""}"
        oninput="
          formatRibuan(this);
          hitung();
        "
      />

      <div class="extra-total">
        Rp0
      </div>

            <button
       class="btn btn-danger"
      onclick="tambahItem()"
       >
<i class="ri-shopping-cart-2-line"></i>
       </button>

      <button
        class="btn btn-danger"
        onclick="hapusItem(this)"
      >
        <i class="ri-delete-bin-line"></i>
      </button>

    </div>

  `;

  document.getElementById("extraItems").appendChild(wrap);

  /* ---------------- SCROLL EFFECT ---------------- */

  requestAnimationFrame(() => {
    const rect = wrap.getBoundingClientRect();

    const target = window.scrollY + rect.top - window.innerHeight * 0.32;

    window.scrollTo({
      top: target,
      behavior: "smooth",
    });

    wrap.animate(
      [
        {
          opacity: 0,
          transform: "translateY(18px) scale(0.985)",
          filter: "blur(3px)",
        },
        {
          opacity: 1,
          transform: "translateY(0) scale(1)",
          filter: "blur(0px)",
        },
      ],
      {
        duration: 950,
        easing: "cubic-bezier(0.22,1,0.36,1)",
        fill: "both",
      },
    );
  });

  /* ----------------------------------------------------- */

  hitung();
}
function hapusItem(btn) {
  const item = btn.closest(".extra-item");

  if (!item) return;

  const target = item.nextElementSibling || item.previousElementSibling;

  const height = item.offsetHeight;

  item.style.height = height + "px";

  item.style.overflow = "hidden";

  requestAnimationFrame(() => {
    item.style.transition = `
      opacity 950ms cubic-bezier(0.22,1,0.36,1),
      transform 950ms cubic-bezier(0.22,1,0.36,1),
      height 1050ms cubic-bezier(0.22,1,0.36,1),
      margin 1050ms cubic-bezier(0.22,1,0.36,1),
      padding 1050ms cubic-bezier(0.22,1,0.36,1)
    `;

    item.style.opacity = "0";

    item.style.transform = "translateY(-18px) scale(0.985)";

    item.style.height = "0px";

    item.style.marginTop = "0";
    item.style.marginBottom = "0";

    item.style.paddingTop = "0";
    item.style.paddingBottom = "0";
  });

  /* ---------------- FOLLOW FOCUS ---------------- */

  if (target) {
    setTimeout(() => {
      const rect = target.getBoundingClientRect();

      const top = window.scrollY + rect.top - window.innerHeight * 0.32;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    }, 180);
  }

  /* ------------------------------------------------ */

  setTimeout(() => {
    item.remove();

    if (target) {
      target.animate(
        [
          {
            opacity: 0.92,
            transform: "scale(0.992)",
          },
          {
            opacity: 1,
            transform: "scale(1)",
          },
        ],
        {
          duration: 950,
          easing: "cubic-bezier(0.22,1,0.36,1)",
        },
      );
    }

    hitung();
  }, 1080);
}

function hitung() {
  const g = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const a = (id) => angka(document.getElementById(id)?.value || "");

  const pcs = g("pcs") || 1;
  const hargaJual = a("hargaJualPcs");
  const bahan = hitungBahan();
  const jahitTotal = g("jahitPcs") * a("jahitHarga");
  const ongkir = a("ongkirHarga");
  const tambahan = hitungTambahan();

  const grandTotal =
    Object.keys(BAHAN).reduce((s, k) => s + bahan[k + "Total"], 0) +
    bahan.customTotal +
    jahitTotal +
    ongkir +
    tambahan;

  const jualTotal = hargaJual * pcs;
  const profit = jualTotal - grandTotal;
  const totalKg =
    Object.keys(BAHAN).reduce((s, k) => s + bahan[k + "Kg"], 0) +
    bahan.customKg;
  const totalPrint =
    Object.keys(BAHAN).reduce((s, k) => s + bahan[k + "Print"], 0) +
    bahan.customPrint;

  Object.keys(BAHAN).forEach((k) => {
    setText(k + "Kg", bahan[k + "Kg"].toFixed(3) + " kg");
    setText(k + "Berat", rupiah(bahan[k + "Berat"]));
    if (k !== "rib") setText(k + "Print", rupiah(bahan[k + "Print"]));
    setText(k + "Total", rupiah(bahan[k + "Total"]));
  });

  // CUSTOM MATERIAL
  setText("customKgTotal", bahan.customKg.toFixed(3) + " kg");
  setText("customBerat", rupiah(bahan.customBerat));
  setText("customPrint", rupiah(bahan.customPrint));
  setText("customTotal", rupiah(bahan.customTotal));

  // LAINNYA
  setText("jahitTotalPcs", g("jahitPcs"));
  setText("jahitHargaView", rupiah(a("jahitHarga")));
  setText("jahitTotal", rupiah(jahitTotal));

  setText(
    "ongkirNamaView",
    document.getElementById("ongkirNama")?.value || "–",
  );
  setText("ongkirTotal", rupiah(ongkir));
  setText("allKg", totalKg.toFixed(3) + " kg");
  setText("allPrint", rupiah(totalPrint));
  setText("allJahit", rupiah(jahitTotal));
  setText("allOngkir", rupiah(ongkir));
  setText("grandTotal", rupiah(grandTotal));
  setText("jualTotal", rupiah(jualTotal));
  setText("hppPcs", rupiah(grandTotal / pcs));

  const pEl = document.getElementById("profitTotal");
  if (pEl) {
    pEl.textContent = rupiah(profit);
    pEl.className = "s-val " + (profit >= 0 ? "profit-pos" : "profit-neg");
  }

  updateCostChart([
    bahan.milanoTotal,
    bahan.embossTotal,
    bahan.airwalkTotal,
    bahan.ribTotal,
    bahan.lottoTotal,
    jahitTotal,
    ongkir,
    tambahan,
  ]);
  saveAuto();
}
function hitungBahan() {
  const g = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const a = (id) => angka(document.getElementById(id)?.value || "");

  const results = {};

  Object.keys(BAHAN).forEach((k) => {
    const m = g(k);
    const b = BAHAN[k];

    results[k + "Kg"] = m * b.kg;
    results[k + "Berat"] = m * b.kg * b.harga;
    results[k + "Print"] = m * b.print;
    results[k + "Total"] = results[k + "Berat"] + results[k + "Print"];
  });

  // ================= CUSTOM MATERIAL =================

  const customMeter = g("customMeter");
  const customKg = g("customKg");
  const customHarga = a("customHarga");

  results.customKg = customMeter * customKg;

  results.customBerat = results.customKg * customHarga;

  results.customPrint = customMeter * CFG.printPressRate;

  results.customTotal = results.customBerat + results.customPrint;

  // ===================================================

  return results;
}
console.log("Estimasi jalan");
function hitungEstimasi() {
  const g = (id) => parseFloat(document.getElementById(id)?.value) || 0;
  const a = (id) => angka(document.getElementById(id)?.value || "");
  const pcs = g("estimasiPcs");
  const bahan = document.getElementById("estimasiBahan")?.value;
  const hargaJ = a("estimasiHarga");
  const ratio = g("estimasiRatio") || CFG.estimasiRatio;

  if (!BAHAN[bahan]) {
    [
      "estimasiMeter",
      "estimasiModal",
      "estimasiJual",
      "estimasiProfit",
      "estimasiHpp",
    ].forEach((id) => setText(id, "Rp0"));
    setText("estimasiMeter", "0 m");
    return;
  }
  const b = BAHAN[bahan];
  const meter = pcs * ratio;
  const modal = meter * b.kg * b.harga + meter * b.print;
  const jual = pcs * hargaJ;
  const profit = jual - modal;
  const hpp = pcs ? modal / pcs : 0;

  setText("estimasiMeter", meter.toFixed(1) + " m");
  setText("estimasiModal", rupiah(modal));
  setText("estimasiJual", rupiah(jual));
  setText("estimasiHpp", rupiah(hpp));
  const pEl = document.getElementById("estimasiProfit");
  if (pEl) {
    pEl.textContent = rupiah(profit);
    pEl.style.color = profit >= 0 ? "var(--green)" : "var(--red)";
  }
}

/* ============================================================= */

/* ---------------------- CHARTS -------------------------------- */
/* ============================================================= */
function getChartTheme() {
  return {
    grid: app.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
    text: app.isDark ? "#64748b" : "#94a3b8",
  };
}
function updateCostChart(data) {
  const ctx = document.getElementById("chart-cost");
  if (!ctx) return;
  if (app.chart) app.chart.destroy();
  const t = getChartTheme();
  app.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [
        "Milano",
        "Emboss",
        "Airwalk",
        "Ribpoly",
        "Lotto",
        "Jahit",
        "Ongkir",
      ],
      datasets: [
        {
          data,
          backgroundColor: data.map((v) =>
            v > 0 ? "rgba(16, 185, 129, 0.8)" : "rgba(0,0,0,0.05)",
          ),
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: t.grid },
          ticks: { color: t.text, font: { size: 10 } },
        },
        y: {
          grid: { color: t.grid },
          ticks: {
            color: t.text,
            font: { size: 10 },
            callback: (v) => "Rp" + (v / 1000).toFixed(0) + "k",
          },
        },
      },
    },
  });
}
function updatePipelineChart() {
  const ctx = document.getElementById("chart-pipeline");
  if (!ctx) return;
  if (app.pipeChart) app.pipeChart.destroy();
  const orders = getDesignOrders();
  const counts = DESIGN_STAGES.map(
    (s) => orders.filter((o) => o.stage === s).length,
  );
  app.pipeChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Desain", "Revisi", "Selesai"],
      datasets: [
        {
          data: counts,
          backgroundColor: ["#3b82f6", "#f59e0b", "#10b981"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: { size: 11 },
            color: getChartTheme().text,
            usePointStyle: true,
            padding: 12,
          },
        },
      },
      cutout: "70%",
    },
  });
}
function updateCharts() {
  hitung();
  updatePipelineChart();
}

/* ============================================================= */

/* ---------------------- HISTORY & AUTOSAVE ------------------- */
/* ============================================================= */
let autoSaveTimer = null;
function saveAuto() {
  clearTimeout(autoSaveTimer);

  autoSaveTimer = setTimeout(async () => {
    const inputs = {};

    document
      .querySelectorAll("#estimator-section input, #estimator-section select")
      .forEach((el) => {
        if (el.id) {
          inputs[el.id] = el.value;
        }
      });

    /* ---------------- EXTRA ITEMS ---------------- */

    const extraItems = [];

    document.querySelectorAll(".extra-item").forEach((item) => {
      const nama = item.querySelector(".extra-name")?.value || "";

      const qty = parseFloat(item.querySelector(".extra-qty")?.value) || 0;

      const harga = angka(item.querySelector(".extra-price")?.value || "");

      if (!nama && !qty && !harga) return;

      extraItems.push({
        nama,
        qty,
        harga,
      });
    });

    /* ---------------- SAVE FIREBASE ---------------- */

    await setDoc(doc(db, "costing_autosave", "main"), {
      inputs,
      extraItems,

      updatedAt: serverTimestamp(),
    });
  }, 800);
}
async function loadAuto() {
  const snap = await getDoc(doc(db, "costing_autosave", "main"));

  if (!snap.exists()) return;

  const data = snap.data();

  /* ===================================================== */
  /* INPUTS */
  /* ===================================================== */

  Object.keys(data.inputs || {}).forEach((id) => {
    const el = document.getElementById(id);

    if (el) {
      el.value = data.inputs[id];
    }
  });

  /* ===================================================== */
  /* EXTRA ITEMS */
  /* ===================================================== */

  const extraWrap = document.getElementById("extraItems");

  if (extraWrap) {
    extraWrap.innerHTML = "";
  }

  if (extraWrap && Array.isArray(data.extraItems)) {
    data.extraItems.forEach((x) => {
      tambahItem({
        nama: x.nama || "",
        qty: x.qty || "",
        harga: x.harga || "",
      });
    });
  }

  /* ===================================================== */
  /* RECALCULATE */
  /* ===================================================== */

  hitung();
}

async function saveHistory() {
  /* ===================================================== */
  /* EXTRA ITEMS */
  /* ===================================================== */

  const extraItems = [];

  document.querySelectorAll(".extra-item").forEach((item) => {
    const nama = item.querySelector(".extra-name")?.value || "";

    const qtyExtra = parseFloat(item.querySelector(".extra-qty")?.value) || 0;

    const harga = angka(item.querySelector(".extra-price")?.value || "");

    if (!nama && !qtyExtra && !harga) return;

    extraItems.push({
      nama,
      qty: qtyExtra,
      harga,
      total: qtyExtra * harga,
    });
  });

  /* ===================================================== */
  /* INPUTS */
  /* ===================================================== */

  const inputs = {};

  document
    .querySelectorAll("#estimator-section input, #estimator-section select")
    .forEach((el) => {
      if (el.id) {
        inputs[el.id] = el.value;
      }
    });

  /* ===================================================== */
  /* DATA */
  /* ===================================================== */

  const qty = parseFloat(document.getElementById("pcs")?.value) || 0;

  const hargaJual = angka(
    document.getElementById("hargaJualPcs")?.value || "0",
  );

  const grandTotal =
    parseFloat(
      (document.getElementById("grandTotal")?.textContent || "0").replace(
        /[^\d]/g,
        "",
      ),
    ) || 0;

  const hppPcs = qty ? Math.round(grandTotal / qty) : 0;

  const jualTotal = hargaJual * qty;

  const profit = jualTotal - grandTotal;

  /* ===================================================== */
  /* SAVE FIREBASE */
  /* ===================================================== */

  await addDoc(collection(db, "costing_history"), {
    customer: document.getElementById("customer")?.value || "Tanpa Nama",

    team: document.getElementById("team")?.value || "-",

    qty,

    hppPcs,

    hargaJual,

    grandTotal,

    totalProfit: profit,

    extraItems,

    inputs,

    created: new Date().toISOString(),

    createdAt: serverTimestamp(),
  });

  /* ===================================================== */
  /* RENDER */
  /* ===================================================== */

  renderCostingHistory();

  showToast("Estimasi tersimpan");

  /* ===================================================== */
  /* RESET FORM */
  /* ===================================================== */

  document
    .querySelectorAll("#estimator-section input, #estimator-section select")
    .forEach((el) => {
      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = false;
      } else {
        el.value = "";
      }
    });

  await setDoc(doc(db, "costing_autosave", "main"), {
    inputs: {},
    extraItems: [],
    updatedAt: serverTimestamp(),
  });

  /* ---------------- EXTRA ITEMS ---------------- */

  const extraWrap = document.getElementById("extraItems");

  if (extraWrap) {
    extraWrap.innerHTML = "";
  }

  /* ---------------- RECALCULATE ---------------- */

  hitung();
}

function loadHistory() {
  const keyword = (
    document.getElementById("searchHistory")?.value || ""
  ).toLowerCase();
  const hist = JSON.parse(localStorage.getItem(KEYS.history) || "[]");
  const el = document.getElementById("historyList");
  if (!el) return;
  const filtered = hist.filter((h) =>
    h.customer.toLowerCase().includes(keyword),
  );
  if (!filtered.length)
    return (el.innerHTML = `<div class="empty-state"><i class="ri-history-line"></i>Belum ada riwayat tersimpan</div>`);

  el.innerHTML = filtered
    .map(
      (h, i) => `
        <div style="display:flex; align-items:center; gap:12px; padding:16px 0; border-bottom:1px solid var(--border);">
          <div style="width:36px; height:36px; border-radius:50%; background:var(--input-bg); display:flex; align-items:center; justify-content:center; font-weight:700;">${h.customer.charAt(0).toUpperCase()}</div>
          <div style="flex:1;"><div style="font-weight:600; font-size:14px;">${h.customer}</div><div style="font-size:12px; color:var(--text-3);">${h.team} · ${h.date}</div></div>
          <div style="font-weight:600; color:var(--green);">${h.total}</div>
          <div style="display:flex; gap:6px;">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="loadHistoryData(${i})"><i class="ri-download-line"></i></button>
            <button class="btn btn-red btn-sm btn-icon" onclick="deleteHistory(${i})"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>
      `,
    )
    .join("");
}
async function deleteHistory(id) {
  if (!confirm("Hapus riwayat ini?")) return;

  await deleteDoc(doc(db, "costing_history", id));

  showToast("Riwayat dihapus", "info");
}
function loadHistoryData(id) {
  const histories = window.firebaseCostingOrders || [];
  const data = histories.find((x) => x.id === id);

  if (!data) return;

  /* ===================================================== */
  /* RESET EXTRA ITEMS */
  /* ===================================================== */

  const extraWrap = document.getElementById("extraItems");

  if (extraWrap) {
    extraWrap.innerHTML = "";
  }

  /* ===================================================== */
  /* RESTORE EXTRA ITEMS */
  /* ===================================================== */

  if (extraWrap && Array.isArray(data.extraItems)) {
    data.extraItems.forEach((x) => {
      tambahItem({
        nama: x.nama || "",
        qty: x.qty || "",
        harga: x.harga || "",
      });
    });
  }

  /* ===================================================== */
  /* RESTORE INPUTS */
  /* ===================================================== */

  Object.keys(data.inputs || {}).forEach((id) => {
    if (id.includes("extra")) return;

    const el = document.getElementById(id);

    if (el) {
      el.value = data.inputs[id];
    }
  });

  /* ===================================================== */
  /* RECALCULATE */
  /* ===================================================== */

  hitung();

  showToast("Riwayat dimuat · " + data.customer);

  document.getElementById("estimator-section")?.scrollIntoView({
    behavior: "smooth",
  });
}
let customerSortMode = "default";
/* ===================================================== */
/* CUSTOMER SORT MODE */
/* ===================================================== */

const customerSortModes = {
  designOrder: "default",
  costing: "default",
  design: "default",
  production: "default",
};

function toggleCustomerSort(type) {
  customerSortModes[type] =
    customerSortModes[type] === "default" ? "az" : "default";

  if (type === "designOrder") {
    renderDesignOrders();
  }

  if (type === "costing") {
    renderCostingHistory();
  }

  if (type === "design") {
    renderDesignHistory();
  }

  if (type === "production") {
    renderProductionHistory();
  }
}

function renderCostingHistory() {
  const tbody = document.getElementById("costing-history-tbody");
  const mobileList = document.getElementById("costing-history-mobile-list");

  if (!tbody) return;

  let histories = [...(window.firebaseCostingOrders || [])];

  /* ---------------- DEFAULT = TERBARU ---------------- */

  if (customerSortModes.costing === "default") {
    histories.sort(
      (a, b) => new Date(b.created || 0) - new Date(a.created || 0),
    );
  }

  /* ---------------- ALPHABET ---------------- */

  if (customerSortModes.costing === "az") {
    histories.sort((a, b) =>
      (a.customer || "").localeCompare(b.customer || "", "id", {
        sensitivity: "base",
      }),
    );
  }
  // ---------------- SEARCH ----------------

  const search = (
    document.getElementById("costing-history-search")?.value || ""
  ).toLowerCase();

  if (search) {
    histories = histories.filter(
      (o) =>
        (o.customer || "").toLowerCase().includes(search) ||
        (o.team || "").toLowerCase().includes(search) ||
        (o.bahan || "").toLowerCase().includes(search),
    );
  }

  const totalRows = histories.length;

  const p = paginate(histories, pagination.costingHistory);

  const visibleHistories = p.items;

  // ---------------- EMPTY ----------------

  if (!visibleHistories.length) {
    tbody.innerHTML = `
      <tr>

        <td colspan="8">

          <div class="empty-state">

            <i class="ri-file-list-3-line"></i>

            Belum ada riwayat costing

          </div>

        </td>

      </tr>
    `;

    return;
  }

  // ---------------- RENDER ----------------
  /* ===================================================== */

  tbody.innerHTML = visibleHistories
    .map((o, index) => {
      const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
      const profit = Number(o.totalProfit || 0);
      const avatar = getAvatarPalette(o.customer || "");
      return `

<tr>

<td class="table-number">
${rowNumber}
</td>

  <td>

    <div class="table-customer">

      <div
        class="table-avatar"
        style="
          background:${avatar.bg};
          color:${avatar.text};
        "
      >
        <i class="ri-user-3-fill"></i>
      </div>

      <div class="table-info">

        <div class="table-title">
          ${o.customer || "-"}
        </div>

      </div>

    </div>

  </td>

  <td>

    <div class="table-title">
      ${o.team || "-"}
    </div>

  </td>

  <td>

    <div class="table-title">
      ${o.qty || 0} pcs
    </div>

  </td>

  <td>

    <div class="table-title">
      Rp${Number(o.hppPcs || 0).toLocaleString("id-ID")}
    </div>

  </td>

  <td>

    <div class="table-title">
      Rp${Number(o.hargaJual || 0).toLocaleString("id-ID")}
    </div>

  </td>

  <td>

    <div
      class="table-title"
      style="
        color:${profit >= 0 ? "var(--green)" : "var(--red)"};
      "
    >
      Rp${profit.toLocaleString("id-ID")}
    </div>

  </td>

  <td>

    <div class="table-subtitle">
      ${o.created ? new Date(o.created).toLocaleDateString("id-ID") : "-"}
    </div>

  </td>

  <td class="table-action">
  <div class="action-dropdown">
    <button type="button" class="btn btn-ghost btn-sm btn-icon-round dropdown-toggle" onclick="toggleActionDropdown(this, event)">
      <i class="ri-more-2-fill"></i>
    </button>
    <div class="dropdown-menu">
      <button type="button" class="btn btn-ghost btn-sm btn-icon-round" onclick="loadHistoryData('${o.id}')" title="Load Data">
        <i class="ri-upload-2-line"></i>
      </button>
      <button type="button" class="btn btn-red btn-sm btn-icon-round" onclick="deleteHistory('${o.id}')" title="Hapus">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  </div>
</td>

</tr>

`;
    })
    .join("");
  if (mobileList) {
    mobileList.innerHTML = visibleHistories
      .map((o, index) => {
        const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
        const profit = Number(o.totalProfit || 0);

        return `

<div class="history-mobile-item">

<div class="history-mobile-head">

<div>

<div class="history-mobile-customer">
${o.customer || "-"}
</div>

<div class="history-mobile-title">
${o.team || "-"}
</div>

</div>

<div class="history-mobile-actions">

<button
class="btn btn-ghost btn-sm btn-icon-round"
onclick="loadHistoryData('${o.id}')">
<i class="ri-upload-2-line"></i>
</button>

<button
class="btn btn-red btn-sm btn-icon-round"
onclick="deleteHistory('${o.id}')">
<i class="ri-delete-bin-line"></i>
</button>

</div>

</div>

<div class="mobile-meta">

<div class="mobile-meta-item">
<i class="ri-stack-line"></i>
${o.qty || 0} pcs
</div>

<div class="mobile-meta-item">
<i class="ri-money-dollar-circle-line"></i>
Rp${Number(o.hppPcs || 0).toLocaleString("id-ID")}
</div>

<div class="mobile-meta-item">
<i class="ri-line-chart-line"></i>
<span class="${profit >= 0 ? "mobile-meta-success" : "mobile-meta-danger"}">
Rp${profit.toLocaleString("id-ID")}
</span>
</div>

<div class="mobile-meta-item">
<i
  class="mobile-meta-item"
  }"
></i>
${o.created ? new Date(o.created).toLocaleDateString("id-ID") : "-"}
</div>

</div>

</div>

`;
      })
      .join("");
  }
  renderPagination(
    "costing-history-pagination",
    p.page,
    p.totalPages,
    "changeCostingHistoryPage",
    totalRows,
  );
}

function renderDesignHistory() {
  const tbody = document.getElementById("design-history-tbody");
  const mobileList = document.getElementById("design-history-mobile-list");

  if (!tbody) return;
  let orders = [...(window.firebaseDesignOrders || [])];
  orders = orders.filter((o) => o.stage === "done");
  const search = (
    document.getElementById("design-history-search")?.value || ""
  ).toLowerCase();

  if (customerSortModes.design === "az") {
    orders.sort((a, b) =>
      (a.customer || "").localeCompare(b.customer || "", "id", {
        sensitivity: "base",
      }),
    );
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        (o.customer || "").toLowerCase().includes(search) ||
        (o.design || "").toLowerCase().includes(search) ||
        (o.jenis || "").toLowerCase().includes(search),
    );
  }

  const totalRows = orders.length;

  const p = paginate(orders, pagination.designHistory);

  const visibleOrders = p.items;

  // ---------------- EMPTY ----------------

  if (!visibleOrders.length) {
    tbody.innerHTML = `
    <tr>
      <td colspan="5">
        <div class="empty-state">
          <i class="ri-file-list-3-line"></i>
          Belum ada riwayat desain
        </div>
      </td>
    </tr>
  `;

    if (mobileList) {
      mobileList.innerHTML = `
      <div class="empty-state">
        <i class="ri-file-list-3-line"></i>
        Belum ada riwayat desain
      </div>
    `;
    }

    return;
  }

  // ---------------- RENDER ----------------
  tbody.innerHTML = visibleOrders
    .map((o, index) => {
      const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
      const avatar = getAvatarPalette(o.customer || "");

      return `

<tr>

<td class="table-number">
${rowNumber}
</td>

  <td>

    <div class="table-customer">

      <div
        class="table-avatar"
        style="
          background:${avatar.bg};
          color:${avatar.text};
        "
      >
        <i class="ri-user-3-fill"></i>
      </div>

      <div class="table-info">

        <div class="table-title">
          ${o.customer || "-"}
        </div>

      </div>

    </div>

  </td>

  <td>

    <div class="table-title">
      ${o.design || "-"}
    </div>

  </td>

  <td>

    <span class="table-tag">
      ${o.jenis || "-"}
    </span>

  </td>

  <td>

    <div class="table-subtitle">
      ${
        o.createdAt?.seconds
          ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("id-ID")
          : "-"
      }
    </div>

  </td>

  <td class="table-action">
  <div class="action-dropdown">
    <button type="button" class="btn btn-ghost btn-sm btn-icon-round dropdown-toggle" onclick="toggleActionDropdown(this, event)">
      <i class="ri-more-2-fill"></i>
    </button>
    <div class="dropdown-menu">
      <button class="btn btn-ghost btn-sm btn-icon-round" onclick="openEditDesign('${o.id}')" title="Edit">
        <i class="ri-edit-line"></i>
      </button>
      <button class="btn btn-red btn-sm btn-icon-round" onclick="deleteDesignOrder('${o.id}')" title="Delete">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  </div>
</td>

</tr>

`;
    })
    .join("");
  if (mobileList) {
    mobileList.innerHTML = visibleOrders
      .map((o, index) => {
        const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
        return `

<div class="history-mobile-item">

  <div class="history-mobile-head">

    <div>

      <div class="history-mobile-customer">
        ${o.customer || "-"}
      </div>

      <div class="history-mobile-title">
        ${o.design || "-"}
      </div>

    </div>

      <div class="history-mobile-actions">

    <button
      class="btn btn-ghost btn-sm btn-icon-round"
      onclick="openEditDesign('${o.id}')"
    >
      <i class="ri-edit-line"></i>
    </button>

    <button
      class="btn btn-red btn-sm btn-icon-round"
      onclick="deleteDesignOrder('${o.id}')"
    >
      <i class="ri-delete-bin-line"></i>
    </button>

  </div>

  </div>

  <div class="mobile-meta">

    <div class="mobile-meta-item">
      <i class="ri-price-tag-3-line"></i>
      <span>${o.jenis || "-"}</span>
    </div>

    <div class="mobile-meta-item">
      <i
        class="${
          o.overdue
            ? "ri-alarm-warning-fill"
            : o.urgent
              ? "ri-error-warning-line"
              : "ri-calendar-line"
        }"
      ></i>
      <span>
        ${
          o.createdAt?.seconds
            ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("id-ID")
            : "-"
        }
      </span>
    </div>

  </div>

</div>

`;
      })
      .join("");
  }
  renderPagination(
    "design-history-pagination",
    p.page,
    p.totalPages,
    "changeDesignHistoryPage",
    totalRows,
  );
}

function renderProductionHistory() {
  const tbody = document.getElementById("production-history-tbody");
  const mobileList = document.getElementById("production-history-mobile-list");

  if (!tbody) return;

  let orders = [...(window.firebaseProductionOrders || [])];
  orders = orders.filter((o) => o.stage === "done");

  const search = (
    document.getElementById("design-history-search")?.value || ""
  ).toLowerCase();

  if (customerSortModes.production === "default") {
    orders.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  }

  if (customerSortModes.production === "az") {
    orders.sort((a, b) =>
      (a.customer || "").localeCompare(b.customer || "", "id", {
        sensitivity: "base",
      }),
    );
  }

  if (search) {
    orders = orders.filter(
      (o) =>
        (o.customer || "").toLowerCase().includes(search) ||
        (o.team || "").toLowerCase().includes(search) ||
        (o.material || "").toLowerCase().includes(search),
    );
  }
  const totalRows = orders.length;

  const p = paginate(orders, pagination.productionHistory);

  const visibleOrders = p.items;

  // ---------------- EMPTY ----------------

  if (!visibleOrders.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <i class="ri-archive-stack-line"></i>
            Belum ada riwayat produksi
          </div>
        </td>
      </tr>
    `;

    if (mobileList) {
      mobileList.innerHTML = "";
    }

    return;
  }

  // ---------------- DESKTOP ----------------

  tbody.innerHTML = visibleOrders
    .map((o, index) => {
      const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
      const avatar = getAvatarPalette(o.customer || "");

      return `

<tr>

<td class="table-number">
${rowNumber}
</td>

  <td>

    <div class="table-customer">

      <div
        class="table-avatar"
        style="
          background:${avatar.bg};
          color:${avatar.text};
        "
      >
        <i class="ri-user-3-fill"></i>
      </div>

      <div class="table-info">

        <div class="table-title">
          ${o.customer || "-"}
        </div>

      </div>

    </div>

  </td>

  <td>

    <div class="table-title">
      ${o.team || "-"}
    </div>

  </td>

  <td>

    <span class="table-tag">
      ${o.material || "-"}
    </span>

  </td>

  <td>

    <div class="table-title">
      ${o.qty || "-"}
    </div>

  </td>

  <td>

    <div class="table-subtitle">
      ${
        o.createdAt?.seconds
          ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("id-ID")
          : "-"
      }
    </div>

  </td>

  <td class="table-action">
  <div class="action-dropdown">
    <button type="button" class="btn btn-ghost btn-sm btn-icon-round dropdown-toggle" onclick="toggleActionDropdown(this, event)">
      <i class="ri-more-2-fill"></i>
    </button>
    <div class="dropdown-menu">
      <button class="btn btn-ghost btn-sm btn-icon-round" onclick="openEditProduction('${o.id}')" title="Edit">
        <i class="ri-edit-line"></i>
      </button>
      <button class="btn btn-red btn-sm btn-icon-round" onclick="deleteProductionOrder('${o.id}')" title="Delete">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  </div>
</td>

</tr>

`;
    })
    .join("");

  // ---------------- MOBILE ----------------

  if (mobileList) {
    mobileList.innerHTML = visibleOrders
      .map((o, index) => {
        const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
        return `

<div class="history-mobile-item">

  <div class="history-mobile-head">

    <div>

      <div class="history-mobile-customer">
        ${o.customer || "-"}
      </div>

      <div class="history-mobile-title">
        ${o.team || "-"}
      </div>

    </div>

  <div class="history-mobile-actions">

    <button
      class="btn btn-ghost btn-sm btn-icon-round"
      onclick="openEditProduction('${o.id}')"
    >
      <i class="ri-edit-line"></i>
    </button>

    <button
      class="btn btn-red btn-sm btn-icon-round"
      onclick="deleteProductionOrder('${o.id}')"
    >
      <i class="ri-delete-bin-line"></i>
    </button>

  </div>

  </div>

  <div class="mobile-meta">

    <div class="mobile-meta-item">
      <i class="ri-t-shirt-2-line"></i>
      <span>${o.material || "-"}</span>
    </div>

    <div class="mobile-meta-item">
      <i class="ri-stack-line"></i>
      <span>${o.qty || "-"} pcs</span>
    </div>

    <div class="mobile-meta-item">
      <i
        class="${
          o.overdue
            ? "ri-alarm-warning-fill"
            : o.urgent
              ? "ri-error-warning-line"
              : "ri-calendar-line"
        }"
      ></i>
      <span>
        ${
          o.createdAt?.seconds
            ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("id-ID")
            : "-"
        }
      </span>
    </div>

  </div>

</div>

`;
      })
      .join("");
    renderPagination(
      "production-history-pagination",
      p.page,
      p.totalPages,
      "changeProductionHistoryPage",
      totalRows,
    );
  }
}


/* ============================================================= */

/* ---------------------- PAGINATION ---------------------------- */
/* ============================================================= */

const PAGE_SIZE = 5;

const pagination = {
  designOrders: 1,
  productionOrders: 1,
  designHistory: 1,
  productionHistory: 1,
  costingHistory: 1,
  invoices: 1,
};

function paginate(data, page) {
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));

  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  const start = (page - 1) * PAGE_SIZE;

  return {
    page,
    totalPages,
    start,
    end: start + PAGE_SIZE,
    items: data.slice(start, start + PAGE_SIZE),
  };
}

function renderPagination(
  containerId,
  page,
  totalPages,
  callback,
  totalItems = 0,
) {
  const el = document.getElementById(containerId);

  if (!el) return;

  if (totalPages <= 1) {
    el.innerHTML = "";
    return;
  }

  const startItem = (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalItems);

  let html = `<div class="pagination-wrap">`;

  // PREV
  html += `
<button
class="btn btn-ghost btn-sm"
${page === 1 ? "disabled" : ""}
onclick="${callback}(${page - 1})">
&lt;
</button>
`;

  // PAGE NUMBER
  for (let i = 1; i <= totalPages; i++) {
    html += `
<button
class="btn ${i === page ? "btn-solid" : "btn-ghost"} btn-sm"
onclick="${callback}(${i})">
${i}
</button>
`;
  }

  // NEXT
  html += `
<button
class="btn btn-ghost btn-sm"
${page === totalPages ? "disabled" : ""}
onclick="${callback}(${page + 1})">
&gt;
</button>
`;

  html += `
</div>

<div class="pagination-info">
Menampilkan ${startItem}–${endItem} dari ${totalItems} data
</div>
`;

  el.innerHTML = html;
}

window.changeDesignPage = function (page) {
  pagination.designOrders = page;

  renderDesignOrders();

  document.getElementById("design-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
window.changeProductionPage = function (page) {
  pagination.productionOrders = page;

  renderProductionOrders();

  document.getElementById("production-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
window.changeCostingHistoryPage = function (page) {
  pagination.costingHistory = page;

  renderHistory();

  document.getElementById("history-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
window.changeDesignHistoryPage = function (page) {
  pagination.designHistory = page;

  renderDesignHistory();

  document.getElementById("design-history-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
window.changeProductionHistoryPage = function (page) {
  pagination.productionHistory = page;

  renderProductionHistory();

  document.getElementById("production-history-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

window.toggleSection = function (header) {
  const section = header.closest(".collapsible-section");

  if (!section) return;

  section.classList.toggle("collapsed");

  saveSectionState();

  const y = section.getBoundingClientRect().top + window.scrollY - 80;

  window.scrollTo({
    top: y,
    behavior: "smooth",
  });
};

window.saveSectionState = function () {
  const states = {};

  document.querySelectorAll(".collapsible-section").forEach((section) => {
    states[section.id] = section.classList.contains("collapsed");
  });

  localStorage.setItem("sectionStates", JSON.stringify(states));
};

window.restoreSectionState = function () {
  const defaults = {
    "design-section": false,
    "production-section": false,
    "tasks-section": false,
    "invoice-section": false,

    "history-section": true,
    "design-history-section": true,
    "production-history-section": true,
    "report-section": true,
  };

  const saved = JSON.parse(localStorage.getItem("sectionStates") || "{}");

  document.querySelectorAll(".collapsible-section").forEach((section) => {
    const collapsed = Object.prototype.hasOwnProperty.call(saved, section.id)
      ? saved[section.id]
      : (defaults[section.id] ?? true);

    section.classList.toggle("collapsed", collapsed);
  });
};

window.collectInvoiceItems = function () {
  const items = [];

  document.querySelectorAll(".invoice-item-row").forEach((row) => {
    const product = row.querySelector(".invoice-product")?.value.trim() || "";

    const size = row.querySelector(".invoice-size")?.value.trim() || "";

    const qty = Number(row.querySelector(".invoice-qty")?.value) || 0;

    const price = Number(row.querySelector(".invoice-price")?.value) || 0;

    const total = qty * price;

    if (!product) return;

    items.push({
      product,

      size,

      qty,

      // harga final yang tampil di nota
      price,

      total,

      // =================================
      // PRICE ENGINE STATE
      // =================================

      priceMode: row.dataset.priceMode || "auto",

      autoPrice: Number(row.dataset.autoPrice) || price,

      manualPrice: Number(row.dataset.manualPrice) || 0,
    });
  });

  return items;
};

window.changeInvoicePage = function (page) {
  pagination.invoices = page;

  renderInvoices();

  document.getElementById("invoice-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};
window.deleteInvoice = async function (id) {
  if (!confirm("Hapus invoice ini?")) return;

  try {
    await deleteDoc(doc(db, "invoices", id));

    showToast("Invoice dihapus");
  } catch (err) {
    console.error(err);

    showToast("Hapus gagal, coba lagi", "error");
  }
};

window.renderInvoices = function () {
  let invoices = window.firebaseInvoices || [];
  const tbody = document.getElementById("invoice-tbody");
  const mobileList = document.getElementById("invoice-mobile-list"); // Hook container mobile

  if (!tbody) return;

  const search = (
    document.getElementById("invoice-search")?.value || ""
  ).toLowerCase();
  const filter = document.getElementById("invoice-filter")?.value || "all";

  if (search) {
    invoices = invoices.filter(
      (i) =>
        (i.customer || "").toLowerCase().includes(search) ||
        (i.invoiceNo || "").toLowerCase().includes(search),
    );
  }

  if (filter !== "all") {
    invoices = invoices.filter((i) => i.status === filter);
  }

  const totalRows = invoices.length;
  const p = paginate(invoices, pagination.invoices);
  const visibleInvoices = p.items;

  // Kondisi Kosong
  if (!visibleInvoices.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <i class="ri-file-list-3-line"></i>
            Belum ada Invoice
          </div>
        </td>
      </tr>
    `;

    if (mobileList) mobileList.innerHTML = ""; // Bersihkan list mobile
    renderPagination("invoice-pagination", 1, 1, "changeInvoicePage", 0);
    return;
  }

  // Render Desktop Table
  tbody.innerHTML = visibleInvoices
    .map((o, index) => {
      const rowNumber = totalRows - ((p.page - 1) * PAGE_SIZE + index);
      const avatar = getAvatarPalette(o.customer || "");

      return `
      <tr>
        <td class="table-number">${rowNumber}</td>
        <td>
          <div class="table-customer">
            <div class="table-avatar" style="background:${avatar.bg}; color:${avatar.text};">
              <i class="ri-user-3-fill"></i>
            </div>
            <div class="table-info">
              <div class="table-title">${o.customer}</div>
              <div class="table-subtitle">${o.invoiceNo}</div>
            </div>
          </div>
        </td>
        <td><div class="table-title">${o.invoiceNo}</div></td>
        <td><div class="table-title">${o.date || "-"}</div></td>
        <td><div class="table-title">${formatRupiah(o.total)}</div></td>
        <td>
          <span class="badge-status ${o.status === "paid" ? "badge-done" : "badge-design"}">
            ${o.status === "paid" ? "LUNAS" : "DP"}
          </span>
        </td>
        <td class="table-action">
  <div class="action-dropdown">
    <button type="button" class="btn btn-ghost btn-sm btn-icon-round dropdown-toggle" onclick="toggleActionDropdown(this, event)">
      <i class="ri-more-2-fill"></i>
    </button>
    <div class="dropdown-menu">
      <button type="button" class="btn btn-ghost btn-sm btn-icon-round" onclick="openInvoicePreview('${o.id}')" title="Preview">
        <i class="ri-eye-line"></i>
      </button>
      <button type="button" class="btn btn-ghost btn-sm btn-icon-round" onclick="openEditInvoice('${o.id}')" title="Edit">
        <i class="ri-edit-line"></i>
      </button>
      <button type="button" class="btn btn-red btn-sm btn-icon-round" onclick="deleteInvoice('${o.id}')" title="Hapus">
        <i class="ri-delete-bin-line"></i>
      </button>
    </div>
  </div>
</td>
      </tr>
    `;
    })
    .join("");

  // Render Mobile Cards (UI konsisten dengan history section)
  if (mobileList) {
    mobileList.innerHTML = visibleInvoices
      .map((o) => {
        return `
        <div class="history-mobile-item">
          <div class="history-mobile-head">
            <div>
              <div class="history-mobile-customer">${o.customer}</div>
              <div class="history-mobile-title">${o.invoiceNo}</div>
            </div>
            <span class="badge-status ${o.status === "paid" ? "badge-done" : "badge-design"}">
              ${o.status === "paid" ? "LUNAS" : "DP"}
            </span>
          </div>
          
          <div class="mobile-meta">
            <div class="mobile-meta-item">
              <i class="ri-calendar-line"></i>
              <span>${o.date || "-"}</span>
            </div>
            <div class="mobile-meta-item">
              <i class="ri-money-dollar-circle-line"></i>
              <span>${formatRupiah(o.total)}</span>
            </div>
          </div>
          
          <div class="history-mobile-actions" style="margin-top: 12px;">
            <button class="btn btn-ghost btn-sm btn-icon-round" onclick="openInvoicePreview('${o.id}')">
              <i class="ri-eye-line"></i>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon-round" onclick="openEditInvoice('${o.id}')">
              <i class="ri-edit-line"></i>
            </button>
            <button class="btn btn-red btn-sm btn-icon-round" onclick="deleteInvoice('${o.id}')">
              <i class="ri-delete-bin-line"></i>
            </button>
          </div>
        </div>
      `;
      })
      .join("");
  }

  renderPagination(
    "invoice-pagination",
    p.page,
    p.totalPages,
    "changeInvoicePage",
    totalRows,
  );
};
window.currentPreviewInvoice = null;

window.invoiceZoom = 1;

window.previewInvoice = function () {
  openModal("modal-preview-invoice");

  requestAnimationFrame(() => {
    window.invoiceZoom = 1; // Force 100%
    updateInvoiceZoom();
    autoFitInvoice();

    const canvas = document.querySelector(".invoice-canvas");
    if (!canvas) return;

    canvas.scrollLeft = (canvas.scrollWidth - canvas.clientWidth) / 2;
    canvas.scrollTop = (canvas.scrollHeight - canvas.clientHeight) / 2;
  });
};

window.updateInvoiceZoom = function () {
  const paper = document.getElementById("invoice-paper");
  if (!paper) return;

  paper.style.transform = `scale(${window.invoiceZoom})`;
  paper.style.transformOrigin = "center";

  document.getElementById("invoice-zoom-value").textContent =
    Math.round(window.invoiceZoom * 100) + "%";
};

window.zoomInInvoice = function () {
  window.invoiceZoom = Math.min(window.invoiceZoom + 0.1, 2);
  updateInvoiceZoom();
};

window.zoomOutInvoice = function () {
  window.invoiceZoom = Math.max(window.invoiceZoom - 0.1, 0.3);
  updateInvoiceZoom();
};

window.fitInvoiceWidth = function () {
  autoFitInvoice();
};

window.autoFitInvoice = function () {
  const canvas = document.querySelector(".invoice-canvas");
  const paper = document.getElementById("invoice-paper");

  if (!canvas || !paper) return;

  const paperH = paper.scrollHeight || 1123;
  const availableWidth = canvas.clientWidth - 40;

  const scaleByHeight = (canvas.clientHeight - 40) / paperH;
  const scaleByWidth = availableWidth / 794;

  window.invoiceZoom = Math.min(scaleByHeight, scaleByWidth, 0.95);

  updateInvoiceZoom();
};

window.printPreviewInvoice = function () {
  const paper = document.getElementById("invoice-paper");

  if (!paper) return;

  const original = document.body.innerHTML;

  document.body.innerHTML = paper.outerHTML;

  window.print();

  document.body.innerHTML = original;

  location.reload();
};
window.addEventListener("resize", autoFitInvoice);

window.generateInvoiceHTML = function (invoiceData) {
  const customer = invoiceData?.customer || "-";
  const invoiceNo = invoiceData?.invoiceNo || "-";
  const date = invoiceData?.date ? formatInvoiceDate(invoiceData.date) : "-";
  const items = invoiceData?.items || [];
  const subtotal = invoiceData?.subtotal || 0;
  const discount = invoiceData?.discount || 0;
  const total = invoiceData?.total || 0;
  const note = invoiceData?.note || "";

  // ======================================================
  // TABEL BARANG (RENDER ENGINE NOTA / PREVIEW)
  // ======================================================

  let tableRows = items
    .map((item, index) => {
      // Ambil data string produk asli
      const originalProduct = item.product || "-";

      let displayTitle = originalProduct;
      let displaySubtitle = "";

      // Jika string produk memiliki pemisah '|', pecah strukturnya
      if (originalProduct.includes("|")) {
        const parts = originalProduct.split("|");
        displayTitle = parts[0].trim(); // Nama Utama / Desain (e.g. JERSEY JAKARTA FC)
        displaySubtitle = parts[1].trim(); // Spesifikasi Teknis Tersembunyi (e.g. setelan pendek o-neck emboss)
      }

      return `
      <tr>
        <td class="col-no">
          ${index + 1}
        </td>
        <td class="col-product">
          <div class="table-title">${displayTitle}</div>
          ${displaySubtitle ? `<div class="table-subtitle">${displaySubtitle}</div>` : ""}
        </td>
        <td class="col-size">
          ${item.size || "-"}
        </td>
        <td class="col-qty">
          ${item.qty || 0}
        </td>
        <td class="col-price">
          ${formatRupiah(item.price || 0)}
        </td>
        <td class="col-total">
          ${formatRupiah((item.qty || 0) * (item.price || 0))}
        </td>
      </tr>
    `;
    })
    .join("");

  if (items.length < 5) {
    tableRows += `<tr class="empty-row"><td colspan="6"></td></tr>`;
  }

  return `
<div class="invoice">

  <!-- ====================================================== -->
  <!-- HEADER -->
  <!-- ====================================================== -->
  <header class="invoice-header">

    <div class="invoice-header__label">
        <img
          class="text-vertical"
          src="/text-invoice.svg"
          alt="Invoice"
          onerror="this.style.display='none'"
        >
       </div>
    
    <!-- KIRI: BRANDING & KONTAK -->
    <div class="invoice-header__left-group">
      <div class="invoice-header__company">
        <img
          class="company-logo"
          src="/logo-progress.svg"
          alt="Progress Logo"
          onerror="this.style.display='none'"
        >
        <div class="company-info">
          <h1 class="company-name">PROGRESS PRINTSHOP</h1>
          <p class="company-tagline">ISOLATED PRINT STUDIO IN THE WILD</p>
        </div>
      </div>

      <div class="invoice-header__contact">
        <div class="contact-item"> Pacul Village, Talang, Tegal, Central Java, Indonesia</div>
        <div class="contact-item"><i class="ri-instagram-line"></i> @progressprintshop | <i class="ri-whatsapp-line"></i> +62 882 3254 8532</div>
      </div>
    </div>

    <!-- KANAN: TOTAL CARD MONOLITIK -->
    <div class="invoice-header__right-group">
      <div class="total-card">
        <div class="total-card__inner">
          <span class="total-card__label">TOTAL TAGIHAN</span>
          <span class="total-card__value">${formatRupiah(total)}</span>
        </div>
        <div class="total-card__client">
          <span class="total-card__customer-label">CUSTOMER</span>
          <span class="total-card__customer">${customer.toUpperCase()}</span>
        </div>
      </div>
    </div>

  </header>

  <!-- ====================================================== -->
  <!-- INFORMASI UTAMA -->
  <!-- ====================================================== -->
  <section class="invoice-info">
    <div class="info-item">
      <div class="info-label">NO. ORDER</div>
      <div class="info-value">${invoiceNo}</div>
    </div>
    <div class="info-item">
      <div class="info-label">TANGGAL</div>
      <div class="info-value">${date}</div>
    </div>
  </section>

<!-- ====================================================== -->
  <!-- TABEL BARANG -->
  <!-- ====================================================== -->
  <section class="invoice-items">
    <table class="items-table">
      <thead>
        <tr>
          <th class="col-no">NO</th>
          <th class="col-product">DESKRIPSI PRODUK</th>
          <th class="col-size">UKURAN</th>
          <th class="col-qty">JUMLAH</th>
          <th class="col-price">HARGA SATUAN</th>
          <th class="col-total">TOTAL</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>
  </section>

  <!-- ====================================================== -->
  <!-- RINGKASAN & FOOTER -->
  <!-- ====================================================== -->
  <section class="invoice-summary-inv">

    <!-- KIRI: INFORMASI PEMBAYARAN & CATATAN -->
    <div class="summary-left">
      <div class="summary-block-inv">
        <div class="summary-title">INFO PEMBAYARAN</div>
        <div class="summary-text">
          <strong>BNI / 1147 337 270</strong><br>
          An. DANNY PRATAMA FIRMANSYAH
        </div>
      </div>

      <div class="summary-block-inv">
        <div class="summary-title">SYARAT & KETENTUAN</div>
        <div class="summary-text">
          Kami menjamin bahwa setiap produk yang kami kerjakan adalah produk terbaik,
          penuh dengan nilai historis dan dedikasi tinggi. Gunakanlah dengan bangga. Terima kasih!
        </div>
      </div>

      <div class="summary-block-inv">
        <div class="summary-title">CATATAN TAMBAHAN</div>
        <div class="summary-text">${note || "Tidak ada catatan"}</div>
      </div>
    </div>

   <!-- KANAN: TOTAL & TANDA TANGAN -->
    <div class="summary-right">
      <div class="totals">
        <div class="total-row">
          <span class="total-label">Sub Total</span>
          
          <span class="total-value">${formatRupiah(subtotal)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Diskon</span>
          <span class="total-value">-${formatRupiah(discount)}</span>
        </div>
        <div class="grand-total">
          <span class="grand-total-label">TOTAL KESELURUHAN</span>
          <span class="grand-total-value">${formatRupiah(total)}</span>
        </div>
      </div>

      <div class="signature-area">
        <div class="signature">
          <!-- Gambar Tanda Tangan ditaruh di atas garis -->
          <img 
            class="signature-image" 
            src="https://i.ibb.co.com/5XyQZCyD/SIGNATURE-PROGRESS.png" 
            alt="Tanda Tangan Progress"
            onerror="this.style.display='none'"
          >
          <div class="signature-line"></div>
          <div class="signature-title">
            <strong>Danny Pratama</strong><br>
            <span>Founder & Graphic Designer</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
  `;
};

function formatInvoiceDate(dateString) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

window.renderInvoiceToPaper = function (invoiceData) {
  const paper = document.getElementById("invoice-paper");
  if (!paper) {
    console.error("invoice-paper element not found");
    return;
  }

  const html = generateInvoiceHTML(invoiceData);
  paper.innerHTML = html;
};

// ============================================================
// 1. FIX: GENERATE NOMOR INVOICE OTOMATIS
// ============================================================

window.generateNextInvoiceNumber = async function () {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const prefix = `INV-${mm}${yy}-`;

  try {
    const invoiceRef = collection(db, "invoices");
    const q = query(
      invoiceRef,
      where("invoiceNo", ">=", prefix),
      where("invoiceNo", "<=", prefix + "\uf8ff"),
    );
    const querySnapshot = await getDocs(q);

    let maxCount = 0;
    querySnapshot.forEach((doc) => {
      const invNum = doc.data().invoiceNo;
      if (invNum && invNum.startsWith(prefix)) {
        const countPart = parseInt(invNum.replace(prefix, ""), 10);
        if (!isNaN(countPart) && countPart > maxCount) {
          maxCount = countPart;
        }
      }
    });

    const nextCount = String(maxCount + 1).padStart(2, "0"); // UBAH dari 3 ke 2
    return `${prefix}${nextCount}`;
  } catch (error) {
    console.error("Gagal generate nomor invoice:", error);
    return `${prefix}01`; // Fallback juga jadi 2 digit
  }
};

//FIX

// ============================================================
// 2. FIX: PREPARE MODAL - RESET & GENERATE NOMOR OTOMATIS
// ============================================================
async function prepareInvoiceModal() {
  // Reset form
  const form = document.getElementById("invoiceForm");
  if (form) form.reset();

  // Reset mode edit
  app.editInvoiceId = null;

  // Update modal title
  const modalTitle = document.querySelector("#modal-invoice .modal-title");
  if (modalTitle) {
    modalTitle.innerHTML = '<i class="ri-file-add-line"></i> Tambah Invoice';
  }

  // Reset semua field
  document.getElementById("invoice-customer").value = "";
  document.getElementById("invoice-date").value = new Date()
    .toISOString()
    .split("T")[0]; // Hari ini
  document.getElementById("invoice-status").value = "draft";
  document.getElementById("invoice-discount").value = "0";
  document.getElementById("invoice-note").value = "";

  // Kosongkan item list
  const wrap = document.getElementById("invoice-items");
  if (wrap) wrap.innerHTML = "";

  // Generate & set nomor invoice otomatis
  const nextInvNumber = await generateNextInvoiceNumber();
  const invInput = document.getElementById("invoice-number");
  if (invInput) {
    invInput.value = nextInvNumber;
    invInput.readOnly = true;
  }

  // Reset totals
  updateInvoiceTotals();
}
// ============================================================
// 3. OPEN ADD INVOICE MODAL
// ============================================================

window.openAddInvoiceModal = async function () {
  await prepareInvoiceModal();

  const wrap = document.getElementById("invoice-items");

  if (wrap) {
    wrap.innerHTML = "";
  }

  addInvoiceItem();

  const nextInvNumber = await generateNextInvoiceNumber();

  const invInput = document.getElementById("invoice-number");

  if (invInput) {
    invInput.value = nextInvNumber;
    invInput.readOnly = true;
  }

  openModal("modal-invoice");
};

// ============================================================
// 4. SAVE INVOICE
// ============================================================

window.saveInvoice = async function () {
  const customer = document.getElementById("invoice-customer").value.trim();

  if (!customer) {
    return showToast("Lengkapi nama customer", "error");
  }

  const items = collectInvoiceItems();

  if (!items.length) {
    return showToast("Minimal 1 item", "error");
  }

  const subtotal =
    Number(
      document.getElementById("invoice-subtotal").value.replace(/[^\d]/g, ""),
    ) || 0;

  const discount =
    Number(document.getElementById("invoice-discount").value) || 0;

  const total =
    Number(
      document.getElementById("invoice-total").value.replace(/[^\d]/g, ""),
    ) || 0;

  const priceAdjustment =
    Number(document.getElementById("invoice-price-adjustment")?.value) || 0;

  try {
    const invoiceData = {
      customer,

      invoiceNo: document.getElementById("invoice-number").value,

      date: document.getElementById("invoice-date").value,

      status: document.getElementById("invoice-status").value,

      items,

      subtotal,

      discount,

      priceAdjustment,

      total,

      note: document.getElementById("invoice-note").value,
    };

    if (app.editInvoiceId) {
      await updateDoc(doc(db, "invoices", app.editInvoiceId), {
        ...invoiceData,
        updatedAt: serverTimestamp(),
      });

      showToast("Invoice tersimpan");
    } else {
      await addDoc(collection(db, "invoices"), {
        ...invoiceData,
        createdAt: serverTimestamp(),
      });

      showToast("Invoice baru tersimpan");
    }

    closeModal("modal-invoice", true);

    prepareInvoiceModal();

    renderInvoices();
  } catch (err) {
    console.error(err);

    showToast("Penyimpanan gagal, coba lagi", "error");
  }
};

// ============================================================
// 5. OPEN EDIT INVOICE
// ============================================================

window.openEditInvoice = function (id) {
  const invoice = window.firebaseInvoices.find((i) => i.id === id);

  if (!invoice) return;

  app.editInvoiceId = id;

  const modalTitle = document.querySelector("#modal-invoice .modal-title");

  if (modalTitle) {
    modalTitle.innerHTML = '<i class="ri-file-edit-line"></i> Edit Invoice';
  }

  document.getElementById("invoice-customer").value = invoice.customer || "";

  document.getElementById("invoice-number").value = invoice.invoiceNo || "";

  document.getElementById("invoice-number").readOnly = true;

  document.getElementById("invoice-date").value = invoice.date || "";

  document.getElementById("invoice-status").value = invoice.status || "draft";

  document.getElementById("invoice-discount").value = invoice.discount || 0;

  document.getElementById("invoice-note").value = invoice.note || "";

  const adjustmentInput = document.getElementById("invoice-price-adjustment");

  if (adjustmentInput) {
    adjustmentInput.value = invoice.priceAdjustment || 0;
  }

  const wrap = document.getElementById("invoice-items");

  wrap.innerHTML = "";

  (invoice.items || []).forEach((item) => {
    addInvoiceItem();

    const group = wrap.lastElementChild;

    const row = group.querySelector(".invoice-item-row");

    group.querySelector(".invoice-product").value = item.product || "";

    row.querySelector(".invoice-size").value = item.size || "";

    row.querySelector(".invoice-qty").value = item.qty || 1;

    row.dataset.priceMode = item.priceMode || "auto";

    row.dataset.autoPrice = item.autoPrice || item.price || 0;

    row.dataset.manualPrice = item.manualPrice || "";

    row.querySelector(".invoice-price").value = item.price || 0;
  });

  updateInvoiceTotals();

  openModal("modal-invoice");
};

// ============================================================
// 6. HELPER: UPDATE BUTTON TEXT BASED ON MODE
// ============================================================
function updateSaveButtonText() {
  const saveBtn = document.querySelector(
    '#modal-invoice button[onclick="saveInvoice()"]',
  );
  if (saveBtn) {
    if (app.editInvoiceId) {
      saveBtn.innerHTML = '<i class="ri-save-line"></i> Perbarui Invoice';
    } else {
      saveBtn.innerHTML = '<i class="ri-save-line"></i> Simpan Invoice';
    }
  }
}

window.openInvoicePreview = function (invoiceId) {
  const invoice = (window.firebaseInvoices || []).find(
    (i) => i.id === invoiceId,
  );

  if (!invoice) {
    showToast("Invoice tidak ditemukan", "error");
    return;
  }

  window.currentPreviewInvoice = invoice;

  renderInvoiceToPaper(invoice);

  previewInvoice();
};

window.previewCurrentInvoice = function () {
  const customer = document.getElementById("invoice-customer")?.value || "";
  const invoiceNo = document.getElementById("invoice-number")?.value || "";
  const date = document.getElementById("invoice-date")?.value || "";
  const items = collectInvoiceItems();
  const subtotal = Number(
    document.getElementById("invoice-subtotal")?.value.replace(/[^\d]/g, "") ||
      0,
  );
  const discount = Number(
    document.getElementById("invoice-discount")?.value || 0,
  );
  const total = Number(
    document.getElementById("invoice-total")?.value.replace(/[^\d]/g, "") || 0,
  );
  const note = document.getElementById("invoice-note")?.value || "";

  const invoiceData = {
    customer,
    invoiceNo,
    date,
    items,
    subtotal,
    discount,
    total,
    note,
  };

  renderInvoiceToPaper(invoiceData);
  previewInvoice();
};

window.downloadInvoiceAsImage = function () {
  const originalElement = document.getElementById("invoice-paper");
  if (!originalElement) {
    alert("Area cetak invoice tidak ditemukan!");
    return;
  }

  // Ambil nomor invoice dari div .info-value di section .invoice-info
  const invoiceNumberElement = document.querySelector(
    ".invoice-info .info-value",
  );
  const invoiceNumber = invoiceNumberElement?.innerText?.trim() || "";

  if (!invoiceNumber) {
    alert("Nomor invoice tidak ditemukan!");
    return;
  }

  // Format: PROGRESS-{nomor}
  const fileName = `PROGRESS-${invoiceNumber}.png`;

  const downloadBtn = document.querySelector(
    '[onclick="downloadInvoiceAsImage()"]',
  );
  const originalBtnHtml = downloadBtn.innerHTML;
  downloadBtn.disabled = true;
  downloadBtn.innerHTML = `<i class="ri-loader-4-line animate-spin text-lg"></i> RENDERING IMAGE...`;

  const cloneElement = originalElement.cloneNode(true);
  cloneElement.style.transform = "none";
  cloneElement.style.transformOrigin = "unset";
  cloneElement.style.position = "fixed";
  cloneElement.style.top = "-9999px";
  cloneElement.style.left = "-9999px";
  document.body.appendChild(cloneElement);

  const opt = {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    width: originalElement.offsetWidth,
    height: originalElement.offsetHeight,
  };

  html2canvas(cloneElement, opt)
    .then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.href = imgData;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      document.body.removeChild(cloneElement);

      downloadBtn.disabled = false;
      downloadBtn.innerHTML = originalBtnHtml;
    })
    .catch((err) => {
      console.error("Gagal merender gambar:", err);
      alert("Terjadi kesalahan saat memproses gambar invoice.");
      if (document.body.contains(cloneElement)) {
        document.body.removeChild(cloneElement);
      }
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = originalBtnHtml;
    });
};

// RESET

window.toggleActionDropdown = function (btn, event) {
  event.stopPropagation();
  const currentDropdown = btn.closest(".action-dropdown");

  // Tutup semua dropdown aktif lainnya terlebih dahulu
  document.querySelectorAll(".action-dropdown.active").forEach((dropdown) => {
    if (dropdown !== currentDropdown) {
      dropdown.classList.remove("active");
    }
  });

  // Toggle dropdown yang sedang diklik
  currentDropdown.classList.toggle("active");
};

// Global event listener untuk menutup dropdown saat klik di luar area menu
document.addEventListener("click", function () {
  document.querySelectorAll(".action-dropdown.active").forEach((dropdown) => {
    dropdown.classList.remove("active");
  });
});

// =====================================================
// IMPORT FIREBASE
// =====================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  getDoc,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {
  apiKey: "AIzaSyCeExsNmeo1KcIEeCQJI4TMPVOzxNhrmYI",
  authDomain: "progress-workspace.firebaseapp.com",
  projectId: "progress-workspace",
  storageBucket: "progress-workspace.firebasestorage.app",
  messagingSenderId: "386467300617",
  appId: "1:386467300617:web:dd56ccc21ee0abd3cdbfd8",
  measurementId: "G-9GXHTCGMQ3",
};

// =====================================================
// INIT FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.db = db;
window.addDoc = addDoc;
window.collection = collection;
window.serverTimestamp = serverTimestamp;
window.deleteDoc = deleteDoc;
window.doc = doc;
window.updateDoc = updateDoc;
window.firebaseDesignOrders = [];
window.firebaseInvoices = [];
window.firebaseProductionOrders = [];
window.firebaseCostingOrders = [];
window.firebaseProductionOrders = [];
console.log("Firebase Connected");

const q = query(collection(db, "design_orders"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
  window.firebaseDesignOrders = [];

  snapshot.forEach((doc) => {
    window.firebaseDesignOrders.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  renderDesignOrders();

  renderDesignHistory();

  updatePipeline();

  updateHero();

  updatePipelineChart();

  console.log("Realtime Firebase Update");
});

const productionQuery = query(
  collection(db, "production_orders"),
  orderBy("createdAt", "desc"),
);

onSnapshot(productionQuery, (snapshot) => {
  window.firebaseProductionOrders = [];
  /* ===================================================== */
  /* COSTING HISTORY */
  /* ===================================================== */

  const costingQuery = query(
    collection(db, "costing_history"),
    orderBy("created", "desc"),
  );

  onSnapshot(costingQuery, (snapshot) => {
    window.firebaseCostingOrders = [];

    snapshot.forEach((doc) => {
      window.firebaseCostingOrders.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    renderCostingHistory();
  });

  snapshot.forEach((doc) => {
    window.firebaseProductionOrders.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  renderProductionOrders();

  renderProductionHistory();

  updateProductionPipeline();

  updateHero();

  console.log("Realtime Production Update");
});

const invoiceQuery = query(
  collection(db, "invoices"),
  orderBy("createdAt", "desc"),
);

onSnapshot(invoiceQuery, (snapshot) => {
  window.firebaseInvoices = [];

  snapshot.forEach((doc) => {
    window.firebaseInvoices.push({
      id: doc.id,

      ...doc.data(),
    });
  });

  renderInvoices();

  console.log("Realtime Invoice Update");
});

/* ============================================================= */

/* ---------------------- INIT --------------------------------- */
/* ============================================================= */
function init() {
  loadTheme();
  loadAuto();
  loadHistory();
  renderDesignOrders();
  renderProductionOrders();
  renderTasks();
  updatePipeline();
  updateProductionPipeline();
  updateHero();
  hitung();
  updatePipelineChart();
  renderCostingHistory();
  restoreSectionState();
  renderInvoices();

  const doDeadline = document.getElementById("do-deadline");
  if (doDeadline) doDeadline.value = getToday();
  const poDeadline = document.getElementById("po-deadline");
  if (poDeadline) poDeadline.value = getToday();

  setInterval(updateHero, 60000);
}

init();

// =====================================================
// GLOBAL WINDOW FUNCTIONS
// =====================================================

// ---------------- MODAL ----------------

window.openModal = openModal;
window.closeModal = closeModal;

// ---------------- UI ----------------

window.toggleDark = toggleDark;
window.toggleMobileNav = toggleMobileNav;
window.toggleAddDropdown = toggleAddDropdown;

window.scrollToSection = scrollToSection;

// ---------------- FILTER ----------------

window.filterByStage = filterByStage;
window.setDesignFilter = setDesignFilter;

window.filterDesignStage = filterDesignStage;
window.filterProductionStage = filterProductionStage;

// ---------------- DESIGN ----------------

window.renderDesignOrders = renderDesignOrders;

window.saveDesignOrder = saveDesignOrder;
window.deleteDesignOrder = deleteDesignOrder;

window.openEditDesign = openEditDesign;

window.advanceDesignStage = advanceDesignStage;
window.prevDesignStage = prevDesignStage;
window.markDesignDone = markDesignDone;

window.renderDesignHistory = renderDesignHistory;

// ---------------- PRODUCTION ----------------

window.renderProductionOrders = renderProductionOrders;

window.saveProductionOrder = saveProductionOrder;
window.nextProductionStage = nextProductionStage;
window.prevProductionStage = prevProductionStage;
window.markProductionDone = markProductionDone;

window.deleteProductionOrder = deleteProductionOrder;
window.openEditProduction = openEditProduction;
window.createInvoiceFromProduction = async function (id) {
  const order = (window.firebaseProductionOrders || []).find((o) => o.id === id);
  if (!order) return showToast("Pesanan produksi tidak ditemukan", "error");
  if (order.invoiceId) { window.openEditInvoice(order.invoiceId); return; }
  document.getElementById("invoice-customer").value = order.customer || "";
  document.getElementById("invoice-number").value = "";
  document.getElementById("invoice-number").readOnly = false;
  document.getElementById("invoice-date").value = getToday();
  document.getElementById("invoice-status").value = "draft";
  document.getElementById("invoice-discount").value = order.discount || 0;
  document.getElementById("invoice-note").value = order.notes || "";
  document.getElementById("invoice-items").innerHTML = "";
  window.editInvoiceId = null;
  window._pendingProductionId = id;
  if (order.items && order.items.length && window.loadInvoiceItems) {
    window.loadInvoiceItems(order.items);
    document.getElementById("invoice-subtotal").value = order.subtotal ? "Rp" + Number(order.subtotal).toLocaleString("id-ID") : "";
    document.getElementById("invoice-total").value = order.total ? "Rp" + Number(order.total).toLocaleString("id-ID") : "";
  } else if (window.addInvoiceItem) {
    addInvoiceItem();
  }
  const invInput = document.getElementById("invoice-number");
  if (invInput && window.generateNextInvoiceNumber) { invInput.value = await window.generateNextInvoiceNumber(); invInput.readOnly = true; }
  const modalTitle = document.querySelector("#modal-invoice .modal-title");
  if (modalTitle) modalTitle.innerHTML = '<i class="ri-file-add-line"></i> Invoice dari Produksi';
  openModal("modal-invoice");
};

window.openProductionNote = openProductionNote;

window.renderProductionHistory = renderProductionHistory;

// ---------------- COSTING ----------------

window.hitung = hitung;
window.titleCase = titleCase;
window.hitungTambahan = hitungTambahan;

window.resetFormCosting = resetFormCosting;
window.saveHistory = saveHistory;
window.deleteHistory = deleteHistory;
window.loadHistory = loadHistory;
window.loadHistoryData = loadHistoryData;
window.toggleCustomerSort = toggleCustomerSort;
window.tambahItem = tambahItem;
window.hapusItem = hapusItem;

window.resetCard = resetCard;

window.setDoc = setDoc;
window.getDoc = getDoc;

// ---------------- QUICK ESTIMATE ----------------

window.hitungEstimasi = hitungEstimasi;
window.formatRibuan = formatRibuan;
window.renderCostingHistory = renderCostingHistory;

// ---------------- TASKS ----------------

window.saveTask = saveTask;
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;

console.log("Global Functions Ready");
