const kioskExperience = document.querySelector("[data-kiosk-experience]");

if (kioskExperience) {
  const screen = kioskExperience.querySelector("[data-kiosk-screen]");
  const stage = kioskExperience.querySelector("[data-kiosk-stage]");
  const stepNumber = kioskExperience.querySelector("[data-kiosk-step-number]");
  const stepTitle = kioskExperience.querySelector("[data-kiosk-step-title]");
  const stepCopy = kioskExperience.querySelector("[data-kiosk-step-copy]");
  const progressItems = [...kioskExperience.querySelectorAll("[data-kiosk-progress]")];

  const products = [
    {
      id: "breakfast-bowl",
      name: "Breakfast Bowl",
      category: "Featured",
      price: 11.99,
      calories: 420,
      description: "Roasted vegetables, grains, herbs, and a soft egg.",
      image: "https://meshgi.com/assets/kiosk-demo/start-background.webp",
      position: "65% 72%"
    },
    {
      id: "tomato-stew",
      name: "Tomato Stew",
      category: "Meals",
      price: 12.75,
      calories: 510,
      description: "Slow-cooked tomato stew with herbs and warm spices.",
      image: "https://meshgi.com/assets/playground/chaashni-dish-1.jpg",
      position: "center"
    },
    {
      id: "saffron-rice",
      name: "Saffron Rice",
      category: "Sides",
      price: 9.5,
      calories: 390,
      description: "Steamed rice with saffron and a crisp golden layer.",
      image: "https://meshgi.com/assets/playground/chaashni-dish-2.jpg",
      position: "center"
    },
    {
      id: "garden-plate",
      name: "Garden Plate",
      category: "Meals",
      price: 13.2,
      calories: 360,
      description: "Seasonal vegetables, grains, and a fresh herb dressing.",
      image: "https://meshgi.com/assets/kiosk-demo/start-background.webp",
      position: "72% 68%"
    },
    {
      id: "lentil-stew",
      name: "Lentil Stew",
      category: "Meals",
      price: 10.99,
      calories: 470,
      description: "Lentils with tomato, onion, and mild spices.",
      image: "https://meshgi.com/assets/playground/chaashni-dish-1.jpg",
      position: "35% 50%"
    },
    {
      id: "crispy-rice",
      name: "Crispy Rice",
      category: "Sides",
      price: 8.25,
      calories: 330,
      description: "Golden rice with a crisp base and fresh herbs.",
      image: "https://meshgi.com/assets/playground/chaashni-dish-2.jpg",
      position: "62% 50%"
    }
  ];

  const categories = [
    { name: "Featured", image: "https://meshgi.com/assets/kiosk-demo/start-background.webp", position: "65% 72%" },
    { name: "Meals", image: "https://meshgi.com/assets/playground/chaashni-dish-1.jpg", position: "center" },
    { name: "Sides", image: "https://meshgi.com/assets/playground/chaashni-dish-2.jpg", position: "center" }
  ];

  const optionSets = [
    {
      id: "preparation",
      name: "Preparation",
      instruction: "Choose your preparation",
      min: 1,
      max: 1,
      maxQtyPerItem: 1,
      options: [
        { id: "as-shown", name: "As shown", price: 0, calories: 0, image: "https://meshgi.com/assets/kiosk-demo/start-background.webp" },
        { id: "light-seasoning", name: "Light seasoning", price: 0, calories: 0, image: "https://meshgi.com/assets/playground/chaashni-dish-1.jpg" },
        { id: "no-seasoning", name: "No seasoning", price: 0, calories: 0, image: "https://meshgi.com/assets/playground/chaashni-dish-2.jpg" }
      ]
    },
    {
      id: "add-ons",
      name: "Add-ons",
      instruction: "Choose up to 3 add-ons",
      min: 0,
      max: 3,
      maxQtyPerItem: 2,
      options: [
        { id: "herb-sauce", name: "Herb sauce", price: 1.25, calories: 45, image: "https://meshgi.com/assets/playground/chaashni-dish-1.jpg" },
        { id: "chili-sauce", name: "Chili sauce", price: 1, calories: 30, image: "https://meshgi.com/assets/playground/chaashni-dish-2.jpg" },
        { id: "extra-crunch", name: "Extra crunch", price: 1.5, calories: 80, image: "https://meshgi.com/assets/kiosk-demo/start-background.webp" }
      ]
    }
  ];

  const state = {
    screen: "splash",
    saleType: "",
    category: "Featured",
    cart: [],
    draft: null,
    highContrast: false,
    accessibilityOpen: false,
    language: "English",
    languageMenuOpen: false,
    orderOpen: false,
    popup: "",
    toast: ""
  };

  const steps = {
    splash: ["00", "Start screen", "Open accessibility or language controls, then start an order."],
    saleType: ["01", "Service type", "Choose Dine In or Take Out from the product tiles."],
    menu: ["02", "Quick menu", "Use the circular category bar and three-column product grid."],
    customize: ["02", "Options drawer", "Complete required sets and change add-on quantities in the product drawer."],
    order: ["03", "Order details", "Edit, delete, or change item quantity in the expanded order table."],
    payment: ["04", "Payment", "Choose a payment tile and review the transaction summary."],
    complete: ["05", "Complete", "See the order number, receipt choices, and countdown."]
  };

  const progressOrder = ["splash", "saleType", "menu", "order", "payment", "complete"];
  const money = (value) => `$${value.toFixed(2)}`;
  const itemCount = () => state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = () => state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = () => subtotal() * 0.13;
  const total = () => subtotal() + tax();
  const currentOptionSet = () => optionSets[state.draft?.setIndex || 0];
  const optionCount = (set, selections = state.draft?.selections || {}) =>
    set.options.reduce((sum, option) => sum + (selections[option.id] || 0), 0);
  const requiredSetsComplete = () => optionSets.every((set) => optionCount(set) >= set.min);

  const dineInIcon = `
    <svg class="kiosk-live-sale-icon" viewBox="0 0 156 155" aria-hidden="true">
      <path d="M24.68 42.04c0-2.98-1.91-2.98-2.97-2.98s-3 0-3 2.98v11.75c0 1.52-.53 1.84-1.45 1.84s-1.59-.32-1.59-1.84V42.04c0-3.05-1.94-2.98-2.97-2.98s-2.86 0-2.86 2.98v11.75c0 1.52-.64 1.84-1.66 1.84s-1.7-.32-1.7-1.84V42.04c0-2.98-1.87-2.98-2.9-2.98S.5 39.06.5 42.04v20.83s.14 4.15 2.26 6.25 4.88 3.34 4.88 6.18v49.43c0 1.67 0 3.62 4.95 3.62s4.63-2.02 4.63-3.55V76.11c0-3.2 2.62-4.19 5.16-6.71 2.55-2.52 2.26-5.57 2.26-5.57V42.04h.04Z" fill="currentColor"/>
      <path d="M147.57 39.68c-7.93 0-8.81.7-8.81 10.26v26.24c0 6.81 7.55 10.79 7.55 10.79v37.98s0 3.39 4.58 3.39 4.61-3.39 4.61-3.39V47.23s0-7.55-7.93-7.55Z" fill="currentColor"/>
      <path d="M80.17 113.46c16.26 0 29.45-13.46 29.45-30.07S96.43 53.32 80.17 53.32 50.72 66.78 50.72 83.39s13.19 30.07 29.45 30.07Z" fill="currentColor"/>
      <path d="M80.48 33.48c-28.08 0-50.84 22.48-50.84 50.22s22.76 50.22 50.84 50.22 50.84-22.48 50.84-50.22-22.76-50.22-50.84-50.22Zm0 86.49c-20.3 0-36.71-16.25-36.71-36.27s16.45-36.26 36.71-36.26 36.71 16.25 36.71 36.26-16.45 36.27-36.71 36.27Z" fill="currentColor"/>
    </svg>`;

  const takeOutIcon = `
    <svg class="kiosk-live-sale-icon" viewBox="0 0 156 155" aria-hidden="true">
      <path d="M130.22 18.21a2.8 2.8 0 0 0-3.06.56l-6.75 6.5h-.14l-5.14-6.25a2.84 2.84 0 0 0-4.36 0l-4.92 6-4.71-5.97a2.8 2.8 0 0 0-4.36-.04l-4.92 6.01-4.71-5.97a2.82 2.82 0 0 0-4.43 0l-4.75 5.97-4.92-6.01a2.78 2.78 0 0 0-4.33-.04l-5.13 6.05-4.5-5.9a2.8 2.8 0 0 0-4.43-.07l-4.86 6.01-4.96-6.01a2.8 2.8 0 0 0-4.32 0l-5.2 6.21h-.18l-6.26-6.35a2.8 2.8 0 0 0-4.82 1.97v124.49a2.81 2.81 0 0 0 2.81 2.81h102.26v-.11a2.81 2.81 0 0 0 2.81-2.81V20.81c0-1.13-.67-2.14-1.72-2.6ZM73.82 77.23c-2.11 2.07-4.26 2.88-4.26 5.51v39.99c0 1.26.25 2.91-3.83 2.91s-4.08-1.61-4.08-2.98V82.07c0-2.32-2.29-3.34-4.04-5.05s-1.87-5.13-1.87-5.13V54.83c0-2.46 1.66-2.46 2.5-2.46s2.39-.6 2.39 2.42v9.66c0 .84.56 1.51 1.41 1.51s1.44 1.58 1.44-1.51V54.79c0-2.46 1.48-2.46 2.36-2.46s2.46-.6 2.46 2.46v9.66c0 .88.56 1.51 1.3 1.51s1.2.18 1.2-1.51V54.79c0-2.46 1.65-2.46 2.5-2.46s2.42 0 2.42 2.46v17.87s.25 2.49-1.86 4.56Zm23.88 45.6s-.04 2.81-3.94 2.81-3.91-2.81-3.91-2.81V91.45s-6.44-3.3-6.44-8.92v-21.7c0-7.9.78-8.5 7.53-8.5s6.75 6.25 6.75 6.25v64.25Z" fill="currentColor"/>
    </svg>`;

  const header = () => `
    <header class="kiosk-live-header">
      <button class="kiosk-live-exit" type="button" data-kiosk-action="exit">Exit Order</button>
      <div class="kiosk-live-header-icons" aria-label="Kiosk tools">
        <button type="button" data-kiosk-action="health-help" aria-label="Nutritional information"><img src="assets/kiosk-demo/health.svg" alt=""></button>
        <button type="button" data-kiosk-action="account" aria-label="Customer options"><img src="assets/kiosk-demo/account.svg" alt=""></button>
        <button type="button" data-kiosk-action="scan" aria-label="Scan item, customer, or coupon"><img src="assets/kiosk-demo/barcode.svg" alt=""></button>
      </div>
    </header>`;

  const footerButton = (action, label, className = "", disabled = false) => `
    <button class="kiosk-live-footer-button ${className}" type="button" data-kiosk-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;

  const menuFooter = () => `
    <footer class="kiosk-live-footer">
      <div>${footerButton("back", "‹ Back", "is-secondary")}</div>
      <div class="kiosk-live-footer-right">
        ${footerButton("view-order", `${state.orderOpen ? "Back to Menu" : "View Order"} <span class="kiosk-live-count">${itemCount()}</span>`, "is-secondary")}
        ${footerButton("checkout", `Checkout: ${money(total())}`, state.cart.length ? "is-primary" : "is-disabled", !state.cart.length)}
      </div>
    </footer>`;

  const renderSplash = () => {
    const startLabel = state.language === "Français" ? "Touchez pour commencer" : "Tap to Start";
    const badgeLabel = state.language === "Français" ? "Vous pouvez scanner votre carte en tout temps" : "You can scan your customer badge any time";
    stage.innerHTML = `
      <section class="kiosk-live-app kiosk-live-splash">
        <button class="kiosk-live-language" type="button" data-kiosk-action="language-toggle" aria-expanded="${state.languageMenuOpen}">${state.language}⌄</button>
        ${state.languageMenuOpen ? `
          <div class="kiosk-live-language-menu" role="menu">
            <button type="button" role="menuitem" data-kiosk-action="language" data-value="English">English</button>
            <button type="button" role="menuitem" data-kiosk-action="language" data-value="Français">Français</button>
          </div>` : ""}
        <div class="kiosk-live-start-panel">
          <button class="kiosk-live-start-button" type="button" data-kiosk-action="start">${startLabel}</button>
          <p>${badgeLabel}</p>
        </div>
        ${state.accessibilityOpen ? `
          <button class="kiosk-live-accessibility-backdrop" type="button" data-kiosk-action="accessibility-close" aria-label="Close accessibility options"></button>
          <button class="kiosk-live-access-option" type="button" data-kiosk-action="contrast" aria-pressed="${state.highContrast}">
            <img src="assets/kiosk-demo/high-contrast.svg" alt=""><span>High Contrast</span>
          </button>` : ""}
        <button class="kiosk-live-accessibility ${state.accessibilityOpen ? "is-expanded" : ""}" type="button" data-kiosk-action="accessibility" aria-expanded="${state.accessibilityOpen}">
          <img src="assets/kiosk-demo/accessibility.svg" alt=""><strong>Accessibility</strong>
        </button>
      </section>`;
  };

  const renderSaleType = () => {
    const heading = state.language === "Français" ? "Où allez-vous manger aujourd'hui?" : "Where will you be eating today?";
    stage.innerHTML = `
      <section class="kiosk-live-app">
        ${header()}
        <div class="kiosk-live-sale-body">
          <h3>${heading}</h3>
          <div class="kiosk-live-sale-options">
            <button type="button" data-kiosk-action="sale-type" data-value="Dine In">${dineInIcon}<strong>${state.language === "Français" ? "Sur place" : "Dine In"}</strong></button>
            <button type="button" data-kiosk-action="sale-type" data-value="Take Out">${takeOutIcon}<strong>${state.language === "Français" ? "Pour emporter" : "Take Out"}</strong></button>
          </div>
        </div>
        <footer class="kiosk-live-footer kiosk-live-footer-single">${footerButton("back", "‹ Back", "is-secondary")}</footer>
      </section>`;
  };

  const renderCategories = () => `
    <nav class="kiosk-live-categories" aria-label="Quick menu categories">
      ${categories.map((category) => `
        <button type="button" data-kiosk-action="category" data-value="${category.name}" aria-pressed="${state.category === category.name}">
          <span><img src="${category.image}" alt="" style="object-position:${category.position}"></span>
          <strong>${category.name}</strong>
        </button>`).join("")}
    </nav>`;

  const renderProductGrid = () => {
    const visible = state.category === "Featured" ? products : products.filter((product) => product.category === state.category);
    return `
      <div class="kiosk-live-grid">
        ${visible.map((product) => `
          <button class="kiosk-live-product" type="button" data-kiosk-action="item" data-value="${product.id}" aria-label="Customize ${product.name}, ${money(product.price)}">
            <img src="${product.image}" alt="" style="object-position:${product.position}">
            <span class="kiosk-live-product-meta"><small>${product.calories} Cals</small><small>${money(product.price)}</small><strong>${product.name}</strong></span>
          </button>`).join("")}
      </div>`;
  };

  const selectedLabelsForSet = (set, selections) => set.options
    .filter((option) => selections[option.id])
    .map((option) => {
      const quantity = selections[option.id];
      return `${quantity}x ${option.name}${option.price ? ` +${money(option.price * quantity)}` : ""}`;
    });

  const selectedLabels = (selections) => optionSets.flatMap((set) => selectedLabelsForSet(set, selections));

  const selectedPrice = (product, selections) => product.price + optionSets.reduce((sum, set) =>
    sum + set.options.reduce((setSum, option) => setSum + option.price * (selections[option.id] || 0), 0), 0
  );

  const renderOptionsDrawer = () => {
    const product = products.find((item) => item.id === state.draft.id);
    const set = currentOptionSet();
    const count = optionCount(set);
    const canSave = requiredSetsComplete();
    return `
      <section class="kiosk-live-options-drawer" role="dialog" aria-modal="true" aria-label="Customize ${product.name}">
        <header class="kiosk-live-drawer-product-header">
          <img src="${product.image}" alt="" style="object-position:${product.position}">
          <div><div><h3>${product.name}</h3><strong>${money(selectedPrice(product, state.draft.selections))}</strong></div><p>${product.description}</p><small>${product.calories} Cals</small></div>
        </header>
        <div class="kiosk-live-options-body">
          <aside class="kiosk-live-option-sidebar" role="tablist" aria-orientation="vertical">
            ${optionSets.map((optionSet, index) => {
              const selected = selectedLabelsForSet(optionSet, state.draft.selections);
              return `
                <button type="button" role="tab" data-kiosk-action="option-set" data-value="${index}" aria-selected="${state.draft.setIndex === index}">
                  <span><strong>${optionSet.name}</strong>${optionSet.min ? `<i aria-label="Required">*</i>` : ""}${optionCount(optionSet) >= optionSet.min ? "<b>✓</b>" : ""}</span>
                  ${selected.map((label) => `<small>↳ ${label}</small>`).join("")}
                </button>`;
            }).join("")}
          </aside>
          <div class="kiosk-live-option-main">
            <header><h3>${set.instruction}</h3><div><span>${set.min ? `Please Select ${set.min}` : "Optional"}</span><strong class="${count > set.max ? "is-error" : count ? "is-active" : ""}">${count} of ${set.max} selected</strong></div></header>
            <div class="kiosk-live-option-grid">
              ${set.options.map((option) => {
                const quantity = state.draft.selections[option.id] || 0;
                const showQuantity = quantity > 0 && set.maxQtyPerItem > 1;
                return `
                  <article class="kiosk-live-option-tile ${quantity ? "is-selected" : ""}">
                    ${quantity ? "<span class='kiosk-live-option-check'>✓</span>" : ""}
                    <button type="button" class="kiosk-live-option-select" data-kiosk-action="option" data-value="${option.id}" aria-pressed="${quantity > 0}" aria-label="${option.name}${option.price ? `, plus ${money(option.price)}` : ""}">
                      <img src="${option.image}" alt="">
                      <span><small>${option.calories ? `${option.calories} Cals` : ""}</small><small>${option.price ? `+${money(option.price)}` : ""}</small><strong>${option.name}</strong></span>
                    </button>
                    ${showQuantity ? `<div class="kiosk-live-option-quantity"><button type="button" data-kiosk-action="option-quantity" data-id="${option.id}" data-value="-1" aria-label="Remove one ${option.name}">−</button><strong>${quantity}</strong><button type="button" data-kiosk-action="option-quantity" data-id="${option.id}" data-value="1" aria-label="Add one ${option.name}" ${quantity >= set.maxQtyPerItem || count >= set.max ? "disabled" : ""}>+</button></div>` : ""}
                  </article>`;
              }).join("")}
            </div>
            <div class="kiosk-live-option-navigation">
              ${state.draft.setIndex > 0 ? "<button type='button' data-kiosk-action='option-prev'>‹ Previous</button>" : "<span></span>"}
              ${state.draft.setIndex < optionSets.length - 1 ? "<button type='button' data-kiosk-action='option-next'>Next ›</button>" : ""}
            </div>
          </div>
        </div>
        <footer class="kiosk-live-options-footer">
          ${footerButton("options-cancel", "Cancel", "is-secondary")}
          ${footerButton("save-item", `Save Changes: ${money(selectedPrice(product, state.draft.selections))}`, canSave ? "is-primary" : "is-disabled", !canSave)}
        </footer>
      </section>`;
  };

  const renderOrderDrawer = () => `
    <section class="kiosk-live-order-drawer" aria-label="Order details">
      <div class="kiosk-live-cart-head"><span>Name</span><span>Quantity</span><span>Price</span><button type="button" data-kiosk-action="view-order" aria-label="Collapse order">⌃</button></div>
      <div class="kiosk-live-cart-list">
        ${state.cart.map((item, index) => `
          <article>
            <div class="kiosk-live-cart-name"><img src="${item.image}" alt=""><span><strong>${item.name}</strong><small>${item.choice}</small></span></div>
            <div class="kiosk-live-cart-quantity">
              <button type="button" data-kiosk-action="cart-quantity" data-id="${index}" data-value="-1" aria-label="Remove one ${item.name}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-kiosk-action="cart-quantity" data-id="${index}" data-value="1" aria-label="Add one ${item.name}">+</button>
            </div>
            <strong class="kiosk-live-cart-price">${money(item.price * item.quantity)}</strong>
            <div class="kiosk-live-cart-actions"><button type="button" data-kiosk-action="edit-cart" data-id="${index}" aria-label="Edit ${item.name}">✎</button><button type="button" data-kiosk-action="delete-cart" data-id="${index}" aria-label="Delete ${item.name}">⌫</button></div>
          </article>`).join("") || "<p class='kiosk-live-empty'>No items in this order.</p>"}
      </div>
      <dl class="kiosk-live-summary">
        <div><dt>Subtotal</dt><dd>${money(subtotal())}</dd></div>
        <div><dt>Tax</dt><dd>${money(tax())}</dd></div>
        <div><dt>Total</dt><dd>${money(total())}</dd></div>
      </dl>
    </section>`;

  const renderMenu = () => {
    stage.innerHTML = `
      <section class="kiosk-live-app ${state.draft ? "is-tinted" : ""}">
        ${header()}
        ${renderCategories()}
        <div class="kiosk-live-menu-scroll">${renderProductGrid()}</div>
        ${state.orderOpen ? renderOrderDrawer() : ""}
        ${state.draft ? renderOptionsDrawer() : menuFooter()}
      </section>`;
  };

  const renderPayment = () => {
    stage.innerHTML = `
      <section class="kiosk-live-app">
        ${header()}
        <div class="kiosk-live-payment-page">
          <h3>How do you want to pay?</h3>
          <div class="kiosk-live-payment-grid">
            <button type="button" data-kiosk-action="pay" data-value="Credit Card"><span class="kiosk-live-pay-icon">▭</span><strong>Credit Card</strong></button>
            <button type="button" data-kiosk-action="pay" data-value="Debit Card"><span class="kiosk-live-pay-icon">◇</span><strong>Debit Card</strong></button>
            <button type="button" data-kiosk-action="pay" data-value="Gift Card"><span class="kiosk-live-pay-icon">▤</span><strong>Gift Card</strong></button>
            <button type="button" data-kiosk-action="pay" data-value="Pay at Counter"><span class="kiosk-live-pay-icon">$</span><strong>Pay at Counter</strong></button>
          </div>
          <dl class="kiosk-live-summary kiosk-live-payment-summary">
            <div><dt>Subtotal</dt><dd>${money(subtotal())}</dd></div>
            <div><dt>Tax</dt><dd>${money(tax())}</dd></div>
            <div><dt>Total</dt><dd>${money(total())}</dd></div>
          </dl>
        </div>
        <footer class="kiosk-live-footer kiosk-live-footer-single">${footerButton("back", "‹ Back", "is-secondary")}</footer>
      </section>`;
  };

  const renderComplete = () => {
    stage.innerHTML = `
      <section class="kiosk-live-app kiosk-live-complete">
        <div class="kiosk-live-complete-main">
          <h3>Thank You</h3>
          <div class="kiosk-live-order-number"><span>Order Number</span><strong>A42</strong></div>
          <p>Please go to the pickup counter to collect your order.</p>
        </div>
        <div class="kiosk-live-receipt-actions">
          <button class="kiosk-live-action-button is-primary" type="button" data-kiosk-action="email-receipt">Email Receipt</button>
          <button class="kiosk-live-action-button is-primary" type="button" data-kiosk-action="print-receipt">Print Receipt</button>
          <button class="kiosk-live-action-button is-secondary" type="button" data-kiosk-action="done">Done</button>
        </div>
        <div class="kiosk-live-progress"><span><i></i></span><strong>15</strong><small>seconds</small></div>
      </section>`;
  };

  const popupContent = () => {
    if (state.popup === "account") return `
      <h3>Customer options</h3>
      <p>Scan a customer badge or enter a phone number to add a customer account.</p>
      <label>Phone number<input type="tel" inputmode="tel" placeholder="(555) 555-5555"></label>
      <div><button type="button" class="kiosk-live-action-button is-secondary" data-kiosk-action="popup-close">Cancel</button><button type="button" class="kiosk-live-action-button is-primary" data-kiosk-action="popup-close">Continue</button></div>`;
    if (state.popup === "scan") return `
      <h3>Scan an item, customer, or coupon</h3>
      <p>Use the scanner below the screen. The Kiosk detects the code type and applies it to this order.</p>
      <div><button type="button" class="kiosk-live-action-button is-primary" data-kiosk-action="popup-close">Close</button></div>`;
    if (state.popup === "exit") return `
      <h3>Exit this order?</h3>
      <p>Your current items will be removed.</p>
      <div><button type="button" class="kiosk-live-action-button is-secondary" data-kiosk-action="popup-close">Keep Ordering</button><button type="button" class="kiosk-live-action-button is-primary" data-kiosk-action="exit-confirm">Exit Order</button></div>`;
    if (state.popup === "email") return `
      <h3>Email receipt</h3>
      <p>Enter an email address for this sample receipt.</p>
      <label>Email address<input type="email" inputmode="email" placeholder="name@example.com"></label>
      <div><button type="button" class="kiosk-live-action-button is-secondary" data-kiosk-action="popup-close">Cancel</button><button type="button" class="kiosk-live-action-button is-primary" data-kiosk-action="email-complete">Send</button></div>`;
    return "";
  };

  const renderTransient = () => {
    const app = stage.querySelector(".kiosk-live-app");
    if (!app) return;
    if (state.popup) {
      app.insertAdjacentHTML("beforeend", `<div class="kiosk-live-modal-mask"><section class="kiosk-live-modal" role="dialog" aria-modal="true">${popupContent()}</section></div>`);
    }
    if (state.toast) {
      app.insertAdjacentHTML("beforeend", `<div class="kiosk-live-toast" role="status">${state.toast}<button type="button" data-kiosk-action="toast-close" aria-label="Close">×</button></div>`);
    }
  };

  const currentProgress = () => state.orderOpen ? "order" : state.screen;

  const updateGuide = () => {
    const key = state.draft ? "customize" : state.orderOpen ? "order" : state.screen;
    const [number, title, copy] = steps[key];
    stepNumber.textContent = number;
    stepTitle.textContent = title;
    stepCopy.textContent = copy;
    const currentIndex = progressOrder.indexOf(currentProgress());
    progressItems.forEach((item) => {
      const itemIndex = progressOrder.indexOf(item.dataset.kioskProgress);
      item.classList.toggle("is-current", itemIndex === currentIndex);
      item.classList.toggle("is-complete", itemIndex < currentIndex);
    });
  };

  const render = () => {
    screen.classList.toggle("is-high-contrast", state.highContrast);
    if (state.screen === "splash") renderSplash();
    if (state.screen === "saleType") renderSaleType();
    if (state.screen === "menu") renderMenu();
    if (state.screen === "payment") renderPayment();
    if (state.screen === "complete") renderComplete();
    renderTransient();
    updateGuide();
  };

  const reset = () => {
    state.screen = "splash";
    state.saleType = "";
    state.category = "Featured";
    state.cart = [];
    state.draft = null;
    state.highContrast = false;
    state.accessibilityOpen = false;
    state.languageMenuOpen = false;
    state.orderOpen = false;
    state.popup = "";
    state.toast = "";
    render();
  };

  const openOptions = (productId, editingIndex = -1) => {
    const existing = editingIndex >= 0 ? state.cart[editingIndex] : null;
    state.draft = {
      id: productId,
      setIndex: 0,
      selections: existing ? { ...existing.selections } : {},
      editingIndex
    };
    state.orderOpen = false;
  };

  kioskExperience.addEventListener("click", (event) => {
    const button = event.target.closest("[data-kiosk-action]");
    if (!button || !kioskExperience.contains(button)) return;
    const action = button.dataset.kioskAction;
    const value = button.dataset.value;

    if (action === "reset" || action === "done") return reset();
    if (action === "popup-close") state.popup = "";
    if (action === "toast-close") state.toast = "";
    if (action === "accessibility") state.accessibilityOpen = !state.accessibilityOpen;
    if (action === "accessibility-close") state.accessibilityOpen = false;
    if (action === "contrast") state.highContrast = !state.highContrast;
    if (action === "language-toggle") state.languageMenuOpen = !state.languageMenuOpen;
    if (action === "language") {
      state.language = value;
      state.languageMenuOpen = false;
    }
    if (action === "start") {
      state.accessibilityOpen = false;
      state.languageMenuOpen = false;
      state.screen = "saleType";
    }

    if (action === "sale-type") {
      state.saleType = value;
      state.screen = "menu";
    }

    if (action === "category") state.category = value;

    if (action === "item") openOptions(value);

    if (action === "option-set" && state.draft) state.draft.setIndex = Number(value);

    if (action === "option" && state.draft) {
      const set = currentOptionSet();
      const current = state.draft.selections[value] || 0;
      if (set.max === 1) {
        set.options.forEach((option) => delete state.draft.selections[option.id]);
        state.draft.selections[value] = 1;
        if (state.draft.setIndex < optionSets.length - 1) state.draft.setIndex += 1;
      } else if (current) {
        delete state.draft.selections[value];
      } else if (optionCount(set) < set.max) {
        state.draft.selections[value] = 1;
      }
    }

    if (action === "option-quantity" && state.draft) {
      const set = currentOptionSet();
      const current = state.draft.selections[button.dataset.id] || 0;
      const next = current + Number(value);
      if (next <= 0) delete state.draft.selections[button.dataset.id];
      else if (next <= set.maxQtyPerItem && optionCount(set) + Number(value) <= set.max) state.draft.selections[button.dataset.id] = next;
    }

    if (action === "option-prev" && state.draft) state.draft.setIndex = Math.max(0, state.draft.setIndex - 1);
    if (action === "option-next" && state.draft) state.draft.setIndex = Math.min(optionSets.length - 1, state.draft.setIndex + 1);
    if (action === "options-cancel") state.draft = null;

    if (action === "save-item" && state.draft && requiredSetsComplete()) {
      const product = products.find((item) => item.id === state.draft.id);
      const choice = selectedLabels(state.draft.selections).join(", ");
      const savedItem = {
        ...product,
        price: selectedPrice(product, state.draft.selections),
        choice,
        selections: { ...state.draft.selections },
        quantity: state.draft.editingIndex >= 0 ? state.cart[state.draft.editingIndex].quantity : 1
      };
      if (state.draft.editingIndex >= 0) state.cart[state.draft.editingIndex] = savedItem;
      else state.cart.push(savedItem);
      state.draft = null;
    }

    if (action === "view-order") state.orderOpen = !state.orderOpen;

    if (action === "cart-quantity") {
      const item = state.cart[Number(button.dataset.id)];
      if (item) item.quantity += Number(value);
      state.cart = state.cart.filter((item) => item.quantity > 0);
    }

    if (action === "edit-cart") {
      const index = Number(button.dataset.id);
      if (state.cart[index]) openOptions(state.cart[index].id, index);
    }

    if (action === "delete-cart") state.cart.splice(Number(button.dataset.id), 1);

    if (action === "checkout" && state.cart.length) {
      state.orderOpen = false;
      state.screen = "payment";
    }

    if (action === "pay") state.screen = "complete";

    if (action === "health-help") state.toast = "Select any menu item to see its description, calories, and price.";
    if (action === "account") state.popup = "account";
    if (action === "scan") state.popup = "scan";
    if (action === "exit") {
      if (state.cart.length) state.popup = "exit";
      else return reset();
    }
    if (action === "exit-confirm") return reset();
    if (action === "email-receipt") state.popup = "email";
    if (action === "email-complete") {
      state.popup = "";
      state.toast = "Sample receipt sent.";
    }
    if (action === "print-receipt") state.toast = "Sample receipt sent to the printer.";

    if (action === "back") {
      if (state.screen === "saleType") state.screen = "splash";
      else if (state.screen === "payment") state.screen = "menu";
      else if (state.screen === "menu" && state.orderOpen) state.orderOpen = false;
      else if (state.screen === "menu") state.screen = "saleType";
    }

    render();
  });

  render();
}
