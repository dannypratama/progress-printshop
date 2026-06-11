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
const PRODUCTION_STAGES = ["desain", "printing", "jahit", "qc", "selesai"];

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

function openModal(id) {
  document.getElementById(id).classList.add("open");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay"))
    e.target.classList.remove("open");
});

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
  document.getElementById("hero-date").textContent = now.toLocaleDateString(
    "id-ID",
    options,
  );
  document.getElementById("hero-clock").textContent =
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }) + " WIB";

  const orders = getDesignOrders();
  setText(
    "stat-active-orders",
    orders.filter((o) => o.stage !== "done").length,
  );
  setText(
    "stat-production",
    getProductionOrders().filter((o) => o.stage !== "done").length,
  );
  setText("stat-done-today", orders.filter((o) => o.stage === "done").length);
  setText(
    "stat-overdue",
    orders.filter(
      (o) => o.deadline && o.deadline < getToday() && o.stage !== "done",
    ).length,
  );
}

function toggleMobileNav() {
  document.getElementById("mobile-nav-menu").classList.toggle("show");
}

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
    return showToast("Pelanggan & desain wajib diisi", "error");
  }

  try {
    await addDoc(collection(db, "design_orders"), {
      customer,
      design,
      jenis: document.getElementById("do-jenis").value,
      deadline: document.getElementById("do-deadline").value,
      notes: document.getElementById("do-notes").value,
      stage: "design",
      createdAt: serverTimestamp(),
    });

    showToast("Desain ditambahkan");

    closeModal("modal-design");

    ["do-customer", "do-design", "do-jenis", "do-deadline", "do-notes"].forEach(
      (id) => {
        document.getElementById(id).value = "";
      },
    );
  } catch (err) {
    console.error(err);

    showToast("Gagal menyimpan", "error");
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

    showToast("Dipindah ke " + nextStage.toUpperCase());
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

    showToast("Dipindah mundur");
  }
}

async function markDesignDone(id) {
  await updateDoc(doc(db, "design_orders", id), {
    stage: "done",
  });

  showToast("Desain selesai");
}

async function deleteDesignOrder(id) {
  if (!confirm("Hapus pesanan desain ini?")) return;

  try {
    await deleteDoc(doc(db, "design_orders", id));

    showToast("Desain dihapus", "info");
  } catch (err) {
    console.error(err);

    showToast("Gagal menghapus", "error");
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
  document
    .querySelectorAll("#pipeline-section .pipeline-step")
    .forEach((el) =>
      el.classList.toggle(
        "pipeline-selected",
        el.dataset.stage === app.stageFilter,
      ),
    );
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
  orders = [...orders].sort((a, b) => {
    if (a.stage === "done" && b.stage !== "done") {
      return 1;
    }

    if (a.stage !== "done" && b.stage === "done") {
      return -1;
    }

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
        o.customer.toLowerCase().includes(search) ||
        o.design.toLowerCase().includes(search),
    );

  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="ri-check-double-line"></i>Semua tugas desain selesai / kosong</div></td></tr>`;
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

  tbody.innerHTML = orders
    .map((o) => {
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

  <td>

    <div
      style="
        display:flex;
        align-items:center;
        gap:12px;
      "
    >

<div
  style="
    width:38px;
    height:38px;
    border-radius:50%;
    background:${avatar.bg};
    color:${avatar.text};
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:16px;
    font-weight:700;
    flex-shrink:0;
    backdrop-filter:blur(10px);
    border:1px solid rgba(255,255,255,0.06);
  "
>
  <i class="ri-user-3-fill"></i>
</div>

      <div
        style="
          display:flex;
          flex-direction:column;
          gap:2px;
        "
      >

        <div
          style="
            font-size:13px;
            font-weight:600;
            color:var(--text-1);
            line-height:1.2;
          "
        >
          ${o.customer}
        </div>

        <div
          style="
            font-size:13px;
            font-weight:700;
            color:var(--text-3);
            line-height:1;
          "
        >
          ${new Date(o.created).toLocaleDateString("id-ID")}
        </div>

      </div>

    </div>

  </td>

  <td>

    <div
      style="
        font-size:13px;
        font-weight:700;
        color:var(--text-1);
        line-height:1.3;
      "
    >
      ${o.design}
    </div>

  </td>

  <td>

    <span
      style="
        background:var(--input-bg);
        padding:5px 10px;
        border-radius:12px;
        font-size:13px;
        font-weight:700;
        color:var(--text-2);
        display:inline-flex;
        align-items:center;
      "
    >
      ${o.jenis || "-"}
    </span>

  </td>

  <td>

    <div
      style="
        display:inline-flex;
        align-items:center;
        gap:6px;
        font-size:13px;
        font-weight:700;
        color:${
          overdue ? "var(--red)" : urgent ? "var(--yellow)" : "var(--text-2)"
        };
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
        style="font-size:14px;"
      ></i>

      ${overdue ? "Terlambat" : deadline || "-"}

    </div>

  </td>

  <td>

    <span
      class="badge-status ${statusBadge[o.stage]}"
      style="
        font-size:13px;
        font-weight:700;
      "
    >
      ${statusLabel[o.stage]}
    </span>

  </td>

  <td style="text-align:right;">

    <div class="design-actions">

      <button
        class="btn btn-ghost btn-sm btn-icon-round"
        onclick="prevDesignStage('${o.id}')"
      >
        <i class="ri-arrow-left-line"></i>
      </button>

      ${
        o.stage !== "done"
          ? `
        <button
          class="btn btn-solid btn-sm btn-icon-round"
          onclick="advanceDesignStage('${o.id}')"
        >
          <i class="ri-arrow-right-line"></i>
        </button>
      `
          : ""
      }

      <button
        class="btn btn-green btn-sm btn-icon-round"
        onclick="markDesignDone('${o.id}')"
      >
        <i class="ri-check-line"></i>
      </button>

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

  </td>

</tr>`;
    })
    .join("");
  if (mobileList) {
    mobileList.innerHTML = orders
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

  <span
    class="badge-status ${statusBadge[o.stage]}"
  >
    ${statusLabel[o.stage]}
  </span>

</div>



          <div class="design-mobile-meta">

            <div class="design-mobile-meta-item">
              <i class="ri-price-tag-3-line"></i>
              ${o.jenis || "-"}
            </div>

            <div
              class="design-mobile-meta-item"
              style="
                color:${
                  overdue
                    ? "var(--red)"
                    : urgent
                      ? "var(--yellow)"
                      : "var(--text-2)"
                };
              "
            >
              <i class="ri-calendar-line"></i>

              ${overdue ? "Terlambat" : deadline || "-"}

            </div>

          </div>

          <div class="design-actions">

            <button
              class="btn btn-ghost btn-sm btn-icon-round"
              onclick="prevDesignStage('${o.id}')"
            >
              <i class="ri-arrow-left-line"></i>
            </button>

            ${
              o.stage !== "done"
                ? `
                <button
                  class="btn btn-solid btn-sm btn-icon-round"
                  onclick="advanceDesignStage('${o.id}')"
                >
                  <i class="ri-arrow-right-line"></i>
                </button>
              `
                : ""
            }

            <button
              class="btn btn-green btn-sm btn-icon-round"
              onclick="markDesignDone('${o.id}')"
            >
              <i class="ri-check-line"></i>
            </button>

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

      `;
      })
      .join("");
  }
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

  if (!customer) {
    return showToast("Nama pelanggan wajib diisi", "error");
  }

  try {
    // ============================================
    // EDIT
    // ============================================

    if (app.editProductionId) {
      await updateDoc(doc(db, "production_orders", app.editProductionId), {
        customer,

        team: document.getElementById("po-team").value,

        qty: document.getElementById("po-qty").value,

        material: document.getElementById("po-material").value,

        deadline: document.getElementById("po-deadline").value,

        notes: document.getElementById("po-notes").value,
      });

      showToast("Pesanan produksi diperbarui");
    }

    // ============================================
    // CREATE
    // ============================================
    else {
      await addDoc(collection(db, "production_orders"), {
        customer,

        team: document.getElementById("po-team").value,

        qty: document.getElementById("po-qty").value,

        material: document.getElementById("po-material").value,

        deadline: document.getElementById("po-deadline").value,

        stage: "design",

        notes: document.getElementById("po-notes").value,

        createdAt: serverTimestamp(),
      });

      showToast("Pesanan produksi dibuat");
    }

    closeModal("modal-production");

    [
      "po-customer",
      "po-team",
      "po-qty",
      "po-material",
      "po-deadline",
      "po-notes",
    ].forEach((id) => {
      document.getElementById(id).value = "";
    });

    app.editProductionId = null;
  } catch (err) {
    console.error(err);

    showToast("Gagal menyimpan produksi", "error");
  }
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

    showToast("Tahap diperbarui");
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

    showToast("Tahap diperbarui");
  }
}
async function markProductionDone(id) {
  await updateDoc(doc(db, "production_orders", id), {
    stage: "done",
  });

  showToast("Produksi selesai");
}
async function deleteProductionOrder(id) {
  if (!confirm("Hapus pesanan produksi ini?")) return;

  try {
    await deleteDoc(doc(db, "production_orders", id));

    showToast("Dihapus", "info");
  } catch (err) {
    console.error(err);

    showToast("Gagal menghapus", "error");
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

  openModal("modal-production");
}

function filterProductionStage(stage) {
  app.productionStageFilter =
    app.productionStageFilter === stage ? null : stage;
  renderProductionOrders();
  document
    .querySelectorAll("[data-production-stage]")
    .forEach((el) =>
      el.classList.toggle(
        "pipeline-selected",
        el.dataset.productionStage === app.productionStageFilter,
      ),
    );
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
    showToast("Catatan diperbarui");
  }
};
function renderProductionOrders() {
  let orders = getProductionOrders();
  orders = [...orders].sort((a, b) => {
    if (a.stage === "done" && b.stage !== "done") {
      return 1;
    }

    if (a.stage !== "done" && b.stage === "done") {
      return -1;
    }
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });
  if (app.productionStageFilter)
    orders = orders.filter((o) => o.stage === app.productionStageFilter);
  const filter = document.getElementById("production-filter")?.value || "all";
  const today = getToday();

  if (filter === "done") orders = orders.filter((o) => o.stage === "done");
  if (filter === "progress") orders = orders.filter((o) => o.stage !== "done");
  if (filter === "urgent")
    orders = orders.filter(
      (o) =>
        o.deadline &&
        (new Date(o.deadline) - new Date(today)) / 86400000 <= 2 &&
        new Date(o.deadline) - new Date(today) >= 0 &&
        o.stage !== "done",
    );
  if (filter === "overdue")
    orders = orders.filter(
      (o) => o.deadline && o.deadline < today && o.stage !== "done",
    );

  const grid = document.getElementById("production-grid");
  if (!orders.length) {
    grid.innerHTML = `<div class="card card-solid" style="grid-column:1/-1"><div class="empty-state"><i class="ri-tools-line"></i>Tidak ada pesanan produksi</div></div>`;
    return;
  }

  grid.innerHTML = orders
    .map((o) => {
      const progress = Math.round(
        (PRODUCTION_STAGES.indexOf(o.stage) / (PRODUCTION_STAGES.length - 1)) *
          100,
      );
      const diff = o.deadline
        ? (new Date(o.deadline) - new Date(today)) / 86400000
        : 999;
      const overdue = diff < 0 && o.stage !== "done";
      const urgent = diff >= 0 && diff <= 2 && o.stage !== "done";
      const cardClass =
        o.stage === "done"
          ? "done-card"
          : overdue
            ? "overdue"
            : urgent
              ? "urgent"
              : "normal";

      return `
        <div class="production-card ${cardClass}">
          <div class="production-head">
            <div><div class="production-name">${o.customer}</div><div class="production-team">${o.team || "Tidak ada tim"}</div></div>
            <div style="font-size:11px; font-weight:600; padding:4px 10px; border-radius:12px; background:var(--input-bg);">${o.stage.toUpperCase()}</div>
          </div>
          <div class="production-meta">
            <div class="production-meta-item"><i class="ri-stack-line"></i>${o.qty || 0} pcs</div>
            <div class="production-meta-item"><i class="ri-t-shirt-2-line"></i>${(
              o.material || "-"
            )
              .toString()
              .replace(/^./, (c) => c.toUpperCase())}</div>
            <div class="production-meta-item" style="color: ${overdue ? "var(--red)" : urgent ? "var(--yellow)" : "inherit"}; font-weight:${overdue || urgent ? "600" : "normal"}"><i class="${overdue ? "ri-alarm-warning-fill" : "ri-calendar-line"}"></i>${overdue ? "Terlambat · " : urgent ? "Mendesak · " : ""}${o.deadline || "-"}</div>
          </div>
          <div class="production-progress-wrap">
            <div class="production-progress-head"><div class="production-progress-label">Progres Produksi</div><div font-weight:600; font-size:12px;">${progress}%</div></div>
            <div class="production-progress-bar"><div class="production-progress-fill ${urgent || overdue ? "warn" : ""}" style="width:${progress}%"></div></div>
          </div>
          <div style="background:var(--input-bg); border-radius:var(--r-sm); padding:10px; font-size:12px;">
            ${o.notes ? `<div style="color:var(--text-1)">${o.notes}</div>` : `<div style="color:var(--text-3)">Tidak ada catatan produksi</div>`}
          </div>
          <div class="production-actions">
            <button class="btn btn-ghost btn-sm btn-icon-round" onclick="prevProductionStage('${o.id}')"><i class="ri-arrow-left-line"></i></button>
            <button class="btn btn-solid btn-sm btn-icon-round" onclick="nextProductionStage('${o.id}')"><i class="ri-arrow-right-line"></i></button>
            <button class="btn btn-green btn-sm btn-icon-round" onclick="markProductionDone('${o.id}')"><i class="ri-check-line"></i></button>
            <button class="btn btn-yellow btn-sm btn-icon-round" onclick="openProductionNote('${o.id}')"><i class="ri-sticky-note-line"></i></button>
            <button class="btn btn-ghost btn-sm btn-icon-round" onclick="openEditProduction('${o.id}')"><i class="ri-edit-line"></i></button>
            <button class="btn btn-red btn-sm btn-icon-round" onclick="deleteProductionOrder('${o.id}')"><i class="ri-delete-bin-line"></i></button>
          </div>
        </div>`;
    })
    .join("");
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
  if (!text) return showToast("Masukkan deskripsi tugas", "error");
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
  showToast("Tugas ditambahkan");
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

  showToast("Draft estimasi dipulihkan", "info");
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

  showToast("Estimasi berhasil disimpan");

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

  // ---------------- EMPTY ----------------

  if (!histories.length) {
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

  tbody.innerHTML = histories
    .map((o, i) => {
      const profit = Number(o.totalProfit || 0);
      const avatar = getAvatarPalette(o.customer || "");
      return `

  <tr>

  <td>

    <div
      style="
        display:flex;
        align-items:center;
        gap:12px;
      "
    >

      <div
        style="
          width:34px;
          height:34px;
          border-radius:50%;
          background:${avatar.bg};
          color:${avatar.text};

          display:flex;
          align-items:center;
          justify-content:center;

          flex-shrink:0;

          font-size:14px;
          font-weight:600;

          backdrop-filter:blur(10px);

          border:1px solid rgba(255,255,255,0.06);
        "
      >
        <i class="ri-user-3-fill"></i>
      </div>

      <div
        style="
          font-size:12px;
          font-weight:600;
          line-height:1.2;
          color:var(--text-1);
        "
      >
        ${o.customer || "-"}
      </div>

    </div>

  </td>

  <td>

    <div
      style="
        font-size:12px;
        font-weight:600;
        line-height:1.2;
      "
    >
      ${o.team || "-"}
    </div>

  </td>

  <td>

    <div
      style="
        font-size:12px;
        font-weight:600;
        line-height:1.2;
      "
    >
      ${o.qty || 0} pcs
    </div>

  </td>

  <td>

    <div
      style="
        font-size:12px;
        font-weight:600;
        line-height:1.2;
      "
    >
      Rp${Number(o.hppPcs || 0).toLocaleString("id-ID")}
    </div>

  </td>

  <td>

    <div
      style="
        font-size:12px;
        font-weight:600;
        line-height:1.2;
      "
    >
      Rp${Number(o.hargaJual || 0).toLocaleString("id-ID")}
    </div>

  </td>

  <td>

    <div
      style="
        font-size:12px;
        font-weight:700;
        line-height:1.2;
        color:${profit >= 0 ? "var(--green)" : "var(--red)"};
      "
    >
      Rp${profit.toLocaleString("id-ID")}
    </div>

  </td>

  <td>

    <div
      style="
        font-size:12px;
        font-weight:500;
        line-height:1.2;
        color:var(--text-3);
      "
    >
      ${o.created ? new Date(o.created).toLocaleDateString("id-ID") : "-"}
    </div>

  </td>

  <td style="text-align:right;">

    <div
      style="
        display:flex;
        justify-content:flex-end;
        align-items:center;
        gap:8px;
      "
    >

      <button
        class="btn btn-ghost btn-sm btn-icon-round"
        onclick="loadHistoryData('${o.id}')"
      >
        <i class="ri-upload-2-line"></i>
      </button>

      <button
        class="btn btn-red btn-sm btn-icon-round"
        onclick="deleteHistory('${o.id}')"
      >
        <i class="ri-delete-bin-line"></i>
      </button>

    </div>

  </td>

</tr>

  `;
    })
    .join("");
}

function renderDesignHistory() {
  const tbody = document.getElementById("design-history-tbody");

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

  // ---------------- EMPTY ----------------

  if (!orders.length) {
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

    return;
  }

  // ---------------- RENDER ----------------
  tbody.innerHTML = orders
    .map((o) => {
      const avatar = getAvatarPalette(o.customer || "");

      return `

      <tr>

        <td>

          <div
            style="
              display:flex;
              align-items:center;
              gap:12px;
            "
          >

<div
  style="
    width:34px;
    height:34px;
    border-radius:50%;
    background:${avatar.bg};
    color:${avatar.text};

    display:flex;
    align-items:center;
    justify-content:center;

    flex-shrink:0;

    font-size:16px;
    font-weight:600;

    backdrop-filter:blur(10px);

    border:1px solid rgba(255,255,255,0.06);
  "
>
  <i class="ri-user-3-fill"></i>
</div>

            <div
              style="
                font-size:13px;
                font-weight:600;
              "
            >
              ${o.customer || "-"}
            </div>

          </div>

        </td>

        <td>

          <div
            style="
              font-size:13px;
              font-weight:600;
            "
          >
            ${o.design || "-"}
          </div>

        </td>

        <td>

          <span
            style="
              background:var(--input-bg);
              padding:5px 10px;
              border-radius:12px;
              font-size:11px;
              font-weight:600;
            "
          >
            ${o.jenis || "-"}
          </span>

        </td>

<td>

  <div
    style="
      font-size:12px;
      color:var(--text-3);
      font-weight:500;
    "
  >
    ${
      o.createdAt?.seconds
        ? new Date(o.createdAt.seconds * 1000).toLocaleDateString("id-ID")
        : "-"
    }
  </div>

</td>

        <td style="text-align:right;">

          <div
            style="
              display:flex;
              justify-content:flex-end;
              gap:8px;
            "
          >

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

        </td>

      </tr>

`;
    })
    .join("");
}

function renderProductionHistory() {
  const tbody = document.getElementById("production-history-tbody");

  if (!tbody) return;

  let orders = [...(window.firebaseProductionOrders || [])];
  orders = orders.filter((o) => o.stage === "done");
  const search = (
    document.getElementById("design-history-search")?.value || ""
  ).toLowerCase();

  if (customerSortModes.production === "default") {
    orders.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
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
        (o.design || "").toLowerCase().includes(search) ||
        (o.jenis || "").toLowerCase().includes(search),
    );
  }

  // ---------------- EMPTY ----------------

  if (!orders.length) {
    tbody.innerHTML = `
      <tr>

        <td colspan="5">

          <div class="empty-state">

            <i class="ri-archive-stack-line"></i>

            Belum ada riwayat produksi

          </div>

        </td>

      </tr>
    `;

    return;
  }

  // ---------------- RENDER ----------------
  tbody.innerHTML = orders
    .map((o) => {
      const avatar = getAvatarPalette(o.customer || "");

      return `

      <tr>

        <td>

          <div
            style="
              display:flex;
              align-items:center;
              gap:12px;
            "
          >

<div
  style="
    width:34px;
    height:34px;
    border-radius:50%;
    background:${avatar.bg};
    color:${avatar.text};

    display:flex;
    align-items:center;
    justify-content:center;

    flex-shrink:0;

    font-size:16px;
    font-weight:600;

    backdrop-filter:blur(10px);

    border:1px solid rgba(255,255,255,0.06);
  "
>
  <i class="ri-user-3-fill"></i>
</div>

            <div
              style="
                font-size:13px;
                font-weight:600;
              "
            >
              ${o.customer || "-"}
            </div>

          </div>

        </td>

        <td>

          <div
            style="
              font-size:13px;
              font-weight:600;
            "
          >
            ${o.product || o.design || "-"}
          </div>

        </td>

        <td>

          <span
            style="
              background:var(--input-bg);
              padding:5px 10px;
              border-radius:12px;
              font-size:11px;
              font-weight:600;
            "
          >
            ${o.jenis || "-"}
          </span>

        </td>

        <td>

          <div
            style="
              font-size:12px;
              color:var(--text-3);
              font-weight:500;
            "
          >
            ${
              o.createdAt?.seconds
                ? new Date(o.createdAt.seconds * 1000).toLocaleDateString(
                    "id-ID",
                  )
                : "-"
            }
          </div>

        </td>

        <td style="text-align:right;">

          <div
            style="
              display:flex;
              justify-content:flex-end;
              gap:8px;
            "
          >

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

        </td>

      </tr>

`;
    })
    .join("");
}
function exportReport() {
  if (!confirm("Export laporan Excel sekarang?")) return;
  const customer = document.getElementById("customer")?.value || "Laporan";
  const data = [
    ["PROGRESS WORKSPACE - ESTIMASI PRODUKSI"],
    [],
    ["Pelanggan", customer],
    ["Tim", document.getElementById("team")?.value || "–"],
    ["Tanggal", new Date().toLocaleString("id-ID")],
    [],
    ["KATEGORI", "JUMLAH"],
  ];
  ["milano", "emboss", "airwalk", "rib", "lotto"].forEach((k) => {
    const el = document.getElementById(k + "Total");
    if (el) data.push([k.charAt(0).toUpperCase() + k.slice(1), el.textContent]);
  });
  ["jahitTotal", "ongkirTotal"].forEach((id) => {
    const el = document.getElementById(id);
    if (el)
      data.push([id === "jahitTotal" ? "Jahit" : "Pengiriman", el.textContent]);
  });
  data.push([]);
  data.push([
    "TOTAL MODAL",
    document.getElementById("grandTotal")?.textContent,
  ]);
  data.push([
    "LABA BERSIH",
    document.getElementById("profitTotal")?.textContent,
  ]);
  data.push(["HPP / PCS", document.getElementById("hppPcs")?.textContent]);

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Estimasi");
  XLSX.writeFile(wb, `Progress_${customer}_${getToday()}.xlsx`);
  showToast("Laporan diekspor");
}
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

// =====================================================

window.firebaseProductionOrders = [];
window.firebaseCostingOrders = [];
window.firebaseProductionOrders = [];

const productionQuery = query(
  collection(db, "production_orders"),
  orderBy("createdAt", "desc"),
);

onSnapshot(productionQuery, (snapshot) => {
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

  const doDeadline = document.getElementById("do-deadline");
  if (doDeadline) doDeadline.value = getToday();
  const poDeadline = document.getElementById("po-deadline");
  if (poDeadline) poDeadline.value = getToday();

  setInterval(updateHero, 60000);
  console.log(
    "%cProgress Workspace",
    "font-size:16px; font-weight:bold; color:#10b981;",
  );
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
window.exportReport = exportReport;
window.toggleMobileNav = toggleMobileNav;

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

window.openProductionNote = openProductionNote;

window.renderProductionHistory = renderProductionHistory;

// ---------------- COSTING ----------------

window.hitung = hitung;
window.formatRibuan = formatRibuan;
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
