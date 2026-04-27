const stages = [
  { id: "received", name: "Order Received", description: "Sales order has been captured." },
  { id: "validated", name: "Validated", description: "Payment and inventory checked." },
  { id: "picked", name: "Picked", description: "Warehouse team collects items." },
  { id: "packed", name: "Packed", description: "Items boxed and labeled." },
  { id: "dispatched", name: "Dispatched", description: "Carrier has the shipment." },
  { id: "delivered", name: "Delivered", description: "Order reached the customer." }
];

const orders = [
  {
    id: "SO-1048",
    customer: "Northwind Retail",
    items: 14,
    value: 4280,
    status: "packed",
    warehouse: "A1 East",
    carrier: "DHL Express",
    eta: "Apr 29",
    address: "Seattle, WA",
    timeline: {
      received: "Apr 27, 08:40",
      validated: "Apr 27, 09:05",
      picked: "Apr 27, 09:52",
      packed: "Apr 27, 10:30"
    }
  },
  {
    id: "SO-1049",
    customer: "Blue Peak Supply",
    items: 8,
    value: 1960,
    status: "validated",
    warehouse: "B4 North",
    carrier: "UPS Ground",
    eta: "Apr 30",
    address: "Denver, CO",
    timeline: {
      received: "Apr 27, 08:55",
      validated: "Apr 27, 09:17"
    }
  },
  {
    id: "SO-1050",
    customer: "Harbor Health",
    items: 21,
    value: 6735,
    status: "dispatched",
    warehouse: "Cold Chain 2",
    carrier: "FedEx Priority",
    eta: "Apr 28",
    address: "Boston, MA",
    timeline: {
      received: "Apr 26, 15:10",
      validated: "Apr 26, 15:24",
      picked: "Apr 26, 16:02",
      packed: "Apr 26, 17:20",
      dispatched: "Apr 26, 18:05"
    }
  },
  {
    id: "SO-1051",
    customer: "Alta Studio",
    items: 5,
    value: 820,
    status: "received",
    warehouse: "A3 West",
    carrier: "Pending",
    eta: "TBD",
    address: "Austin, TX",
    timeline: {
      received: "Apr 27, 10:12"
    }
  }
];

let selectedOrderId = orders[0].id;

const summaryCards = document.getElementById("summaryCards");
const stageBoard = document.getElementById("stageBoard");
const ordersTable = document.getElementById("ordersTable");
const orderDetail = document.getElementById("orderDetail");

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function statusIndex(status) {
  return stages.findIndex((stage) => stage.id === status);
}

function renderSummary() {
  const totalOrders = orders.length;
  const shipped = orders.filter((order) => statusIndex(order.status) >= statusIndex("dispatched")).length;
  const inWarehouse = orders.filter((order) => {
    const index = statusIndex(order.status);
    return index >= statusIndex("validated") && index < statusIndex("dispatched");
  }).length;
  const totalValue = orders.reduce((sum, order) => sum + order.value, 0);

  const cards = [
    { label: "Orders in flow", value: totalOrders },
    { label: "Ready or shipped", value: shipped },
    { label: "In warehouse", value: inWarehouse },
    { label: "Pipeline value", value: currency(totalValue) }
  ];

  summaryCards.innerHTML = cards.map((card) => `
    <article class="stat-card">
      <span class="label">${card.label}</span>
      <strong>${card.value}</strong>
    </article>
  `).join("");
}

function renderStages() {
  stageBoard.innerHTML = stages.map((stage) => {
    const stageOrders = orders.filter((order) => order.status === stage.id);
    const selectedOrder = orders.find((order) => order.id === selectedOrderId);
    const selectedStageIndex = statusIndex(selectedOrder.status);
    const currentStageIndex = statusIndex(stage.id);

    let stateClass = "";
    if (currentStageIndex < selectedStageIndex) stateClass = "completed-stage";
    if (currentStageIndex === selectedStageIndex) stateClass = "active-stage";

    return `
      <article class="stage-column ${stateClass}">
        <span class="stage-count">${stageOrders.length}</span>
        <h3>${stage.name}</h3>
        <p>${stage.description}</p>
        <div class="stage-orders">
          ${stageOrders.length ? stageOrders.map((order) => `
            <div class="chip">${order.id} · ${order.customer}</div>
          `).join("") : '<div class="chip">No orders</div>'}
        </div>
      </article>
    `;
  }).join("");
}

function renderOrders() {
  ordersTable.innerHTML = orders.map((order) => `
    <tr data-order-id="${order.id}" class="${order.id === selectedOrderId ? "selected" : ""}">
      <td>${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.items}</td>
      <td>${currency(order.value)}</td>
      <td><span class="status-pill" style="${statusPillStyle(order.status)}">${stageLabel(order.status)}</span></td>
    </tr>
  `).join("");

  ordersTable.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => {
      selectedOrderId = row.dataset.orderId;
      renderApp();
    });
  });
}

function stageLabel(status) {
  return stages.find((stage) => stage.id === status)?.name || status;
}

function statusPillStyle(status) {
  const index = statusIndex(status);
  if (index >= statusIndex("dispatched")) {
    return "background:#dcfce7;color:#166534;";
  }
  if (index >= statusIndex("packed")) {
    return "background:#fef3c7;color:#92400e;";
  }
  return "background:#e0f2fe;color:#075985;";
}

function renderDetail() {
  const order = orders.find((item) => item.id === selectedOrderId);
  const currentIndex = statusIndex(order.status);

  orderDetail.innerHTML = `
    <article class="detail-card">
      <h3>${order.id}</h3>
      <div class="meta-grid">
        <div class="meta-item">
          <span>Customer</span>
          <strong>${order.customer}</strong>
        </div>
        <div class="meta-item">
          <span>Destination</span>
          <strong>${order.address}</strong>
        </div>
        <div class="meta-item">
          <span>Warehouse</span>
          <strong>${order.warehouse}</strong>
        </div>
        <div class="meta-item">
          <span>Carrier / ETA</span>
          <strong>${order.carrier} / ${order.eta}</strong>
        </div>
      </div>
    </article>
    <article class="detail-card">
      <h4>Order to Shipment Timeline</h4>
      <div class="timeline">
        ${stages.map((stage, index) => {
          let itemClass = "";
          if (index < currentIndex) itemClass = "done";
          if (index === currentIndex) itemClass = "active";
          return `
            <div class="timeline-item ${itemClass}">
              <div class="timeline-marker"></div>
              <div>
                <small>${index + 1}. ${stage.name}</small>
                <b>${order.timeline[stage.id] || "Waiting for update"}</b>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    </article>
  `;
}

function renderApp() {
  renderSummary();
  renderStages();
  renderOrders();
  renderDetail();
}

renderApp();
