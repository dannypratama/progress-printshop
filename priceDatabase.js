/**
 * PROGRESS OS - MASTER PRICE DATABASE (UPDATED)
 * Single Source of Truth untuk Harga Produksi Progress Printshop
 */

const MASTER_PRICE_DATABASE = {
  // 1. Data Core Produk & Braket Harga Berdasarkan Qty / Tipe Order
  products: {
    jersey: {
      name: "Jersey Custom",
      category: ["ATASAN JERSEY", "SETELAN JERSEY"],
      cuttings: ["Regular"],
      pricingModel: "matrix",
      matrix: {
        "ATASAN JERSEY": {
          MILANO: {
            satuan: { pendek: 90000, panjang: 100000 },
            lusinan: { pendek: 85000, panjang: 95000 },
          },
          EMBOSS: {
            satuan: { pendek: 100000, panjang: 110000 },
            lusinan: { pendek: 95000, panjang: 105000 },
          },
        },
        "SETELAN JERSEY": {
          MILANO: {
            satuan: { pendek: 130000, panjang: 140000 },
            lusinan: { pendek: 125000, panjang: 135000 },
          },
          EMBOSS: {
            satuan: { pendek: 140000, panjang: 150000 },
            lusinan: { pendek: 135000, panjang: 145000 },
          },
        },
      },
    },
    kaos: {
      name: "Kaos Custom",
      method: "DTF",
      pricingModel: "tier",
      defaultConfiguration: "Lengan pendek + sablon DTF",
      tiers: {
        "COTTON COMBED 30S": [
          { min: 1, max: 1, price: 70000 },
          { min: 12, max: 49, price: 65000 },
          { min: 50, max: 99, price: 60000 },
          { min: 100, max: 499, price: 55000 },
          { min: 500, max: Infinity, price: 50000 },
        ],
        "COTTON COMBED 24S": [
          { min: 1, max: 1, price: 75000 },
          { min: 12, max: 49, price: 70000 },
          { min: 50, max: 99, price: 65000 },
          { min: 100, max: 499, price: 60000 },
          { min: 500, max: Infinity, price: 55000 },
        ],
        "COTTON COMBED 20S": [
          { min: 1, max: 1, price: 85000 },
          { min: 12, max: 49, price: 80000 },
          { min: 50, max: 99, price: 75000 },
          { min: 100, max: 499, price: 70000 },
          { min: 500, max: Infinity, price: 65000 },
        ],
      },
    },
    kemeja: {
      name: "Kemeja Custom",
      pricingModel: "tier",
      defaultConfiguration: "Lengan pendek + 3 titik bordir",
      tiers: {
        "NAGATA DRILL": [
          { min: 1, max: 1, price: 155000 },
          { min: 12, max: 49, price: 150000 },
          { min: 50, max: 99, price: 145000 },
          { min: 100, max: 499, price: 140000 },
          { min: 500, max: Infinity, price: 135000 },
        ],
        RIPSTOP: [
          { min: 1, max: 1, price: 150000 },
          { min: 12, max: 49, price: 145000 },
          { min: 50, max: 99, price: 140000 },
          { min: 100, max: 499, price: 135000 },
          { min: 500, max: Infinity, price: 130000 },
        ],
        "AMERICAN DRILL": [
          { min: 1, max: 1, price: 130000 },
          { min: 12, max: 49, price: 125000 },
          { min: 50, max: 99, price: 120000 },
          { min: 100, max: 499, price: 115000 },
          { min: 500, max: Infinity, price: 110000 },
        ],
      },
    },
  },

  // 2. Extra Charge Tipe Bahan Spesifik diluar Matrix Utama
  materials: {
    jersey: {
      "bintik brazil": 0,
      puma: 0,
      milano: 0,
      airwalk: 10000,
      "emboss straw": 10000,
      "emboss topo": 10000,
      emboss: 10000,
    },
    kaos: {},
    kemeja: {},
  },

  // 3. Addon & Variasi Tambahan per Tipe Produk (Disesuaikan dengan format teks input)
  addons: {
    jersey: {
      kerah_free: { "o-neck": 0, "v-neck": 0, "v-variasi": 0, "v-potong": 0 },
      kerah_tambahan: {
        "polo v-neck": 5000,
        "polo v tutup": 5000,
        "kerah polo": 10000,
        "pake kerah": 10000,
      },
      model: { panjang: 10000, "lengan panjang": 10000 },
      cutting: { oversize: 5000 },
    },
    kaos: {
      model: {
        panjang: 10000,
        "lengan panjang": 10000,
        "3/4": 5000,
        "7/8": 5000,
        "lengan 3/4": 5000,
        "lengan 7/8": 5000,
      },
    },
    kemeja: {
      model: { panjang: 10000, "lengan panjang": 10000 },
      fitur: { "tambah titik bordir": 10000 },
    },
  },

  // 4. Aturan Biaya Ukuran
  sizeCharges: {
    global_apparel: {
      S: 0,
      M: 0,
      L: 0,
      XL: 0,
      "2XL": 5000,
      "3XL": 5000,
      "4XL": 15000,
      "5XL": 15000,
      "6XL": 15000,
    },
  },

  // 5. Aturan Operasional Bisnis
  rules: {
    jersey: {
      minOrderForLusinan: 12,
      bonus: { type: "Free Sticker", minQty: 12 },
      downPaymentRatio: 0.5,
      productionTime: "7-14 hari",
    },
    kaos: {
      downPaymentRatio: 0.5,
      productionTime: "7-10 hari",
    },
    kemeja: {
      downPaymentRatio: 0.5,
      productionTime: "10-14 hari",
    },
  },
};

/**
 * Mengambil Base Price produk berdasarkan kombinasi spek input order
 */
function getProductBasePrice(productType, options = {}) {
  const product = MASTER_PRICE_DATABASE.products[productType];
  if (!product) return 0;

  const qty = options.qty || 1;
  const materialSelected = (options.material || "").toUpperCase();

  // RESOLVER 1: Skema Matrix (Jersey)
  if (product.pricingModel === "matrix") {
    const category = options.category || "ATASAN JERSEY";
    const sleeve = options.sleeve || "pendek";

    let materialGroup = "MILANO";
    if (materialSelected.includes("EMBOSS")) {
      materialGroup = "EMBOSS";
    }

    const orderType =
      qty >= (MASTER_PRICE_DATABASE.rules.jersey?.minOrderForLusinan || 12)
        ? "lusinan"
        : "satuan";

    try {
      return product.matrix[category][materialGroup][orderType][sleeve] || 0;
    } catch (e) {
      console.warn(
        "PROGRESS OS Engine: Skema kombinasi Jersey tidak ditemukan.",
        e,
      );
      return 0;
    }
  }

  // RESOLVER 2: Skema Tiering Quantity Range (Kaos & Kemeja)
  if (product.pricingModel === "tier") {
    const materialTiers = product.tiers[materialSelected];
    if (!materialTiers) {
      const firstAvailableMaterial = Object.keys(product.tiers)[0];
      return findTierPrice(product.tiers[firstAvailableMaterial], qty);
    }
    return findTierPrice(materialTiers, qty);
  }

  return 0;
}

/**
 * Helper mencari harga di dalam range array tiers
 */
function findTierPrice(tiersArray, qty) {
  const tier = tiersArray.find((t) => qty >= t.min && qty <= t.max);
  return tier ? tier.price : 0;
}

/**
 * PROGRESS OS - Reusable Engine Kalkulasi Tagihan Item & Invoice
 */
function calculateInvoiceItem(orderPayload) {
  const {
    productType,
    category,
    material,
    qty,
    sleeve,
    sizeDistribution,
    addonsSelected,
    customCharge,
  } = orderPayload;

  const validQty = Math.max(0, qty || 0);
  const validCustomCharge = Number(customCharge) || 0;

  // 1. Dapatkan Base Price utama
  const basePrice = getProductBasePrice(productType, {
    qty: validQty,
    material,
    category,
    sleeve,
  });

  // 2. Hitung Tambahan Charge Khusus Karakter Bahan (Case Insensitive)
  let materialPremiumCharge = 0;
  const searchMat = (material || "").toLowerCase();
  if (MASTER_PRICE_DATABASE.materials[productType]) {
    const matRules = MASTER_PRICE_DATABASE.materials[productType];
    for (const key in matRules) {
      if (searchMat.includes(key)) {
        materialPremiumCharge = matRules[key];
        break;
      }
    }
  }

  // 3. Hitung Addon Charge secara kumulatif
  let totalAddonChargePerPcs = 0;
  if (
    addonsSelected &&
    Array.isArray(addonsSelected) &&
    MASTER_PRICE_DATABASE.addons[productType]
  ) {
    const productAddons = MASTER_PRICE_DATABASE.addons[productType];

    addonsSelected.forEach((addonName) => {
      const cleanedAddon = addonName.toLowerCase().trim();
      for (const section in productAddons) {
        if (productAddons[section][cleanedAddon] !== undefined) {
          totalAddonChargePerPcs += productAddons[section][cleanedAddon];
          break;
        }
      }
    });
  }

  // 4. Hitung Akumulasi Total Size Charge Berdasarkan Distribusi Ukuran
  let totalSizeChargeForGroup = 0;
  if (sizeDistribution && typeof sizeDistribution === "object") {
    const sizeRules = MASTER_PRICE_DATABASE.sizeCharges.global_apparel;

    for (const size in sizeDistribution) {
      const sizeQty = sizeDistribution[size] || 0;
      const chargePerPcs = sizeRules[size] !== undefined ? sizeRules[size] : 0;
      totalSizeChargeForGroup += chargePerPcs * sizeQty;
    }
  }

  // 5. Kalkulasi Konsolidasi Harga Finansial Per-Pcs & Subtotal
  const nominalBasePcs =
    basePrice + materialPremiumCharge + totalAddonChargePerPcs;
  const subtotalTanpaSizeDanCustom = nominalBasePcs * validQty;

  const grandSubtotalItem =
    subtotalTanpaSizeDanCustom + totalSizeChargeForGroup + validCustomCharge;
  const realHargaPerPcs = validQty > 0 ? grandSubtotalItem / validQty : 0;

  // 6. Ambil Aturan Rules Bisnis
  const productRules = MASTER_PRICE_DATABASE.rules[productType] || {
    downPaymentRatio: 0.5,
  };
  const dpRatio = productRules.downPaymentRatio;

  const downPaymentRequired = grandSubtotalItem * dpRatio;
  const remainingPayment = grandSubtotalItem - downPaymentRequired;

  let bonusMetadata = null;
  if (productRules.bonus && validQty >= productRules.bonus.minQty) {
    bonusMetadata = {
      item: productRules.bonus.type,
      qty: validQty,
    };
  }

  return {
    basePricePerPcs: basePrice,
    addonAndPremiumChargePerPcs: materialPremiumCharge + totalAddonChargePerPcs,
    calculatedHargaPerPcs: Math.round(realHargaPerPcs),
    subtotal: Math.round(grandSubtotalItem),
    dpRequired: Math.round(downPaymentRequired),
    remainingPayment: Math.round(remainingPayment),
    bonus: bonusMetadata,
    productionEstimation: productRules.productionTime || "7-14 hari",
  };
}
// ==========================================
// PROGRESS OS - INVOICE DOM INTEGRATION
// ==========================================

window.addInvoiceItem = function () {
  const wrap = document.getElementById("invoice-items");
  if (!wrap) return;

  wrap.insertAdjacentHTML(
    "beforeend",
    `
<div class="invoice-item-row">


  <!-- PRODUK + SMART SPEC BUILDER -->
  <div class="invoice-product-wrap">


    <input
      class="input invoice-product"
      placeholder="Nama Produk"
      oninput="
        this.value=this.value.toUpperCase();
        updateInvoiceTotals();
      ">


    <button
      type="button"
      class="product-builder-btn"
      onclick="toggleProductBuilder(this)">
      <i class="ri-magic-line"></i>
    </button>



    <!-- PRODUCT BUILDER PANEL -->
    <div class="product-builder-panel">


      <!-- PRODUK -->
      <select 
        class="input spec-product"
        onchange="changeProductTemplate(this)">

        <option value="JERSEY">
          JERSEY CUSTOM
        </option>

        <option value="KAOS">
          KAOS CUSTOM
        </option>

        <option value="KEMEJA">
          KEMEJA CUSTOM
        </option>

      </select>




      <!-- CATEGORY (JERSEY ONLY) -->
      <select class="input spec-category jersey-field">

        <option value="ATASAN JERSEY">
          ATASAN JERSEY
        </option>

        <option value="SETELAN JERSEY">
          SETELAN JERSEY
        </option>

      </select>




      <!-- MATERIAL -->
      <select class="input spec-material">

      </select>




      <!-- SLEEVE -->
      <select class="input spec-sleeve">

        <option value="PENDEK">
          PENDEK
        </option>

        <option value="PANJANG">
          PANJANG +10K
        </option>

      </select>





      <!-- COLLAR JERSEY ONLY -->
      <select class="input spec-collar jersey-field">

        <option value="O-NECK">
          O-NECK
        </option>

        <option value="V-NECK">
          V-NECK
        </option>

        <option value="V-VARIASI">
          V-VARIASI
        </option>

        <option value="V-POTONG">
          V-POTONG
        </option>

        <option value="POLO V-NECK">
          POLO V-NECK +5K
        </option>

        <option value="KERAH POLO">
          KERAH POLO +10K
        </option>

      </select>




      <!-- ADDON -->
      <select class="input spec-addon">

        <option value="">
          TANPA ADDON
        </option>

      </select>





      <button
        type="button"
        class="btn btn-sm"
        onclick="applyProductSpec(this)">

        <i class="ri-check-line"></i>
        PAKAI TEMPLATE

      </button>


    </div>

  </div>





  <!-- UKURAN ORIGINAL -->
  <select
    class="input invoice-size"
    onchange="updateInvoiceTotals()">

    <option value="">Pilih</option>

    <option value="1">1</option>
    <option value="2">2</option>
    <option value="3">3</option>

    <option value="S">S</option>
    <option value="M">M</option>
    <option value="L">L</option>
    <option value="XL">XL</option>

    <option value="2XL">2XL</option>
    <option value="3XL">3XL</option>
    <option value="4XL">4XL</option>
    <option value="5XL">5XL</option>

  </select>



    <div class="input-wrap">
  <input
    type="number"
    class="input invoice-qty"
    placeholder="0"
    min="0"
    oninput="updateInvoiceTotals()"
    >
    <span class="input-unit">pcs</span>
</div>

     




  <input
    type="number"
    class="input invoice-price"
    placeholder="0"
    min="0"
    oninput="updateInvoiceTotals(true)">



  <input
    class="input invoice-total"
    readonly
    value="Rp0">



  <button
    type="button"
    class="btn btn-red btn-sm btn-icon-round"
    onclick="removeInvoiceItem(this)">

    <i class="ri-delete-bin-line"></i>

  </button>


</div>
`,
  );

  updateInvoiceTotals();
};

window.removeInvoiceItem = function (button) {
  const row = button.closest(".invoice-item-row");
  if (row) {
    row.remove();
    updateInvoiceTotals();
  }
};

/**
 * Format Angka ke Rupiah Currency Standar Progress Printshop
 */
function formatRupiah(angka) {
  return "Rp" + Number(angka).toLocaleString("id-ID");
}

/**
 * PROGRESS OS - Engine Kalkulasi Otomatis Berdasarkan Teks Input Nama Produk
 * Terintegrasi penuh dengan Master Price Database & Sistem Addons Terbaru
 */
window.updateInvoiceTotals = function (isManualPriceEdit = false) {
  const rows = document.querySelectorAll("#invoice-items .invoice-item-row");
  let calculatedSubtotal = 0;

  rows.forEach((row) => {
    const productInput = row.querySelector(".invoice-product");
    const sizeSelect = row.querySelector(".invoice-size");
    const qtyInput = row.querySelector(".invoice-qty");
    const priceInput = row.querySelector(".invoice-price");
    const totalInput = row.querySelector(".invoice-total");

    if (!productInput || !qtyInput || !priceInput || !totalInput) return;

    // Pisahkan teks input berdasarkan tanda '|' untuk kebutuhan deteksi spesifikasi
    const fullText = productInput.value.toLowerCase();
    let productNameText = fullText;

    if (fullText.includes("|")) {
      // Jika ada '|', ambil bagian belakang (spesifikasi) untuk penentu harga database
      productNameText = fullText.split("|")[1].trim();
    }

    const selectedSize = sizeSelect ? sizeSelect.value.toUpperCase() : "";
    const qty = parseInt(qtyInput.value, 10) || 0;

    let itemSubtotal = 0;

    if (
      typeof calculateInvoiceItem === "function" &&
      !isManualPriceEdit &&
      qty > 0
    ) {
      let productType = "kaos";
      let category = "ATASAN JERSEY";
      let material = "COTTON COMBED 30S";
      let sleeve = "pendek";
      let addonsSelected = []; // Array penampung addon yang terdeteksi dari teks

      // 1. Deteksi Tipe, Kategori, & Bahan Utama Produk
      if (productNameText.includes("jersey")) {
        productType = "jersey";
        category = productNameText.includes("setelan")
          ? "SETELAN JERSEY"
          : "ATASAN JERSEY";

        // Penentuan bahan jersey
        if (productNameText.includes("airwalk")) {
          material = "Airwalk";
        } else if (productNameText.includes("emboss straw")) {
          material = "Emboss Straw";
        } else if (productNameText.includes("emboss topo")) {
          material = "Emboss Topo";
        } else if (productNameText.includes("emboss")) {
          material = "Emboss Straw"; // Fallback default untuk kata 'emboss' saja
        } else if (productNameText.includes("bintik brazil")) {
          material = "Bintik Brazil";
        } else if (productNameText.includes("puma")) {
          material = "Puma";
        } else {
          material = "Milano"; // Default jika tidak disebutkan spesifik
        }
      } else if (
        productNameText.includes("kemeja") ||
        productNameText.includes("drill") ||
        productNameText.includes("ripstop")
      ) {
        productType = "kemeja";
        material = "AMERICAN DRILL";
        if (productNameText.includes("nagata")) material = "NAGATA DRILL";
        if (productNameText.includes("ripstop")) material = "RIPSTOP";
      } else {
        // Skema Kaos Custom
        productType = "kaos";
        material = "COTTON COMBED 30S"; // Default kaos
        if (productNameText.includes("24s")) material = "COTTON COMBED 24S";
        if (productNameText.includes("20s")) material = "COTTON COMBED 20S";
      }

      // 2. Deteksi Model Lengan (Sleeve) & Pemasukan ke Addon Array
      if (
        productNameText.includes("panjang") ||
        productNameText.includes("lengan panjang")
      ) {
        sleeve = "panjang";
        addonsSelected.push("panjang");
      } else if (
        productNameText.includes("3/4") ||
        productNameText.includes("lengan 3/4")
      ) {
        addonsSelected.push("3/4");
      } else if (
        productNameText.includes("7/8") ||
        productNameText.includes("lengan 7/8")
      ) {
        addonsSelected.push("7/8");
      }

      // 3. Deteksi Variasi Jenis Kerah Tambahan
      if (productNameText.includes("polo v-neck")) {
        addonsSelected.push("polo v-neck");
      } else if (productNameText.includes("polo v tutup")) {
        addonsSelected.push("polo v tutup");
      } else if (
        productNameText.includes("kerah polo") ||
        productNameText.includes("pake kerah")
      ) {
        addonsSelected.push("kerah polo");
      }

      // 4. Deteksi Cutting Tambahan
      if (productNameText.includes("oversize")) {
        addonsSelected.push("oversize");
      }

      // 5. Deteksi Fitur Kemeja Tambahan
      if (
        productNameText.includes("tambah titik bordir") ||
        productNameText.includes("tambah bordir")
      ) {
        addonsSelected.push("tambah titik bordir");
      }

      // Pemetaan sebaran ukuran (size distribution) dari select item aktif
      const sizeDistribution = {};
      if (selectedSize) {
        sizeDistribution[selectedSize] = qty;
      }

      // Jalankan kalkulasi engine database
      const calcResult = calculateInvoiceItem({
        productType,
        category,
        material,
        qty,
        sleeve,
        sizeDistribution,
        addonsSelected: addonsSelected,
      });

      priceInput.value = calcResult.calculatedHargaPerPcs || 0;
      itemSubtotal = calcResult.subtotal || 0;
    } else {
      // Jalur kalkulasi manual jika isManualPriceEdit aktif
      const manualPrice = parseFloat(priceInput.value) || 0;
      itemSubtotal = manualPrice * qty;

      if (
        typeof MASTER_PRICE_DATABASE !== "undefined" &&
        MASTER_PRICE_DATABASE.sizeCharges &&
        selectedSize
      ) {
        const sizeRules = MASTER_PRICE_DATABASE.sizeCharges.global_apparel;
        const sizeCharge = sizeRules[selectedSize] || 0;
        itemSubtotal += sizeCharge * qty;
      }
    }

    totalInput.value = formatRupiah(itemSubtotal);
    calculatedSubtotal += itemSubtotal;
  });

  // Kalkulasi total diskon akhir invoice
  const discountInput = document.getElementById("invoice-discount");
  const discount = parseFloat(discountInput ? discountInput.value : 0) || 0;
  const finalTotal = Math.max(0, calculatedSubtotal - discount);

  // Update nilai field input visual
  const subtotalField = document.getElementById("invoice-subtotal");
  const totalField = document.getElementById("invoice-total");

  if (subtotalField) subtotalField.value = formatRupiah(calculatedSubtotal);
  if (totalField) totalField.value = formatRupiah(finalTotal);
};

// =============================================================
// PRODUCT SPEC BUILDER
// =============================================================

window.toggleProductBuilder = function (btn) {
  const panel = btn.parentElement.querySelector(".product-builder-panel");

  panel.classList.toggle("show");
};

// ---------------------- APPLY TEMPLATE ------------------------

window.applyProductSpec = function (btn) {
  const wrap = btn.closest(".invoice-product-wrap");

  const name = wrap.querySelector(".invoice-product");

  const product = wrap.querySelector(".spec-product").value;

  const category = wrap.querySelector(".spec-category").value;

  const material = wrap.querySelector(".spec-material").value;

  const sleeve = wrap.querySelector(".spec-sleeve").value;

  const collar = wrap.querySelector(".spec-collar").value;

  const addon = wrap.querySelector(".spec-addon").value;

  let title = name.value.split("|")[0].trim();

  const parts = [];

  // Jersey tidak perlu ditulis lagi karena sudah ada di nama produk
  if (product !== "jersey") {
    parts.push(product.toUpperCase());
  }

  if (category) parts.push(category.toUpperCase());
  if (material) parts.push(material.toUpperCase());
  if (collar) parts.push(collar.toUpperCase());
  if (sleeve) parts.push(sleeve.toUpperCase());
  if (addon) parts.push(addon.toUpperCase());

  const result = `${title} | ${parts.join(" ")}`;

  name.value = result;

  wrap.querySelector(".product-builder-panel").classList.remove("show");

  updateInvoiceTotals();
};

// =============================================================
// PRODUCT BUILDER ENGINE
// =============================================================

window.toggleProductBuilder = function (btn) {
  const panel = btn
    .closest(".invoice-product-wrap")
    .querySelector(".product-builder-panel");

  panel.classList.toggle("show");

  const productSelect = panel.querySelector(".spec-product");

  changeProductTemplate(productSelect);
};

// ---------------------- CHANGE TEMPLATE -----------------------

window.changeProductTemplate = function (select) {
  const panel = select.closest(".product-builder-panel");

  const type = select.value;

  const material = panel.querySelector(".spec-material");

  const addon = panel.querySelector(".spec-addon");

  const jerseyFields = panel.querySelectorAll(".jersey-field");

  material.innerHTML = "";
  addon.innerHTML = `<option value="">TANPA ADDON</option>`;

  // ================= JERSEY =================

  if (type === "JERSEY") {
    jerseyFields.forEach((el) => (el.style.display = "block"));

    material.innerHTML = `

      <option value="MILANO">
        MILANO
      </option>

      <option value="BINTIK BRAZIL">
        BINTIK BRAZIL
      </option>

      <option value="PUMA">
        PUMA
      </option>

      <option value="AIRWALK">
        AIRWALK +10K
      </option>

      <option value="EMBOSS">
        EMBOSS +10K
      </option>

    `;

    addon.innerHTML += `

      <option value="OVERSIZE">
        OVERSIZE +5K
      </option>

    `;
  }

  // ================= KAOS =================

  if (type === "KAOS") {
    jerseyFields.forEach((el) => (el.style.display = "none"));

    material.innerHTML = `

      <option value="COTTON COMBED 30S">
        COTTON COMBED 30S
      </option>

      <option value="COTTON COMBED 24S">
        COTTON COMBED 24S
      </option>

      <option value="COTTON COMBED 20S">
        COTTON COMBED 20S
      </option>

    `;

    addon.innerHTML += `

      <option value="OVERSIZE">
        OVERSIZE +5K
      </option>

      <option value="3/4">
        LENGAN 3/4 +5K
      </option>

      <option value="7/8">
        LENGAN 7/8 +5K
      </option>

    `;
  }

  // ================= KEMEJA =================

  if (type === "KEMEJA") {
    jerseyFields.forEach((el) => (el.style.display = "none"));

    material.innerHTML = `

      <option value="AMERICAN DRILL">
        AMERICAN DRILL
      </option>

      <option value="NAGATA DRILL">
        NAGATA DRILL
      </option>

      <option value="RIPSTOP">
        RIPSTOP
      </option>

    `;

    addon.innerHTML += `

      <option value="TAMBAH TITIK BORDIR">
        TAMBAH BORDIR +10K
      </option>

    `;
  }
};

// ---------------------- APPLY SPEC -----------------------------

window.applyProductSpec = function (btn) {
  const wrap = btn.closest(".invoice-product-wrap");

  const input = wrap.querySelector(".invoice-product");

  const panel = wrap.querySelector(".product-builder-panel");

  const type = panel.querySelector(".spec-product").value;

  const category = panel.querySelector(".spec-category")?.value || "";

  const material = panel.querySelector(".spec-material").value;

  const sleeve = panel.querySelector(".spec-sleeve").value;

  const collar = panel.querySelector(".spec-collar")?.value || "";

  const addon = panel.querySelector(".spec-addon").value;

  let title = input.value.split("|")[0].trim().toUpperCase();

  let parts = [];

  if (type === "JERSEY") {
    parts.push(category, material, collar, sleeve);
  }

  if (type === "KAOS") {
    parts.push(material, sleeve);
  }

  if (type === "KEMEJA") {
    parts.push(material, sleeve);
  }

  if (addon) {
    parts.push(addon);
  }

  input.value = `${title} | ${parts.join(" ")}`;

  panel.classList.remove("show");

  updateInvoiceTotals();
};
