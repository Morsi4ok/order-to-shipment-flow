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
    owner: "Maya Chen",
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
    owner: "Andre Collins",
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
    owner: "Sofia Patel",
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
    owner: "Maya Chen",
    timeline: {
      received: "Apr 27, 10:12"
    }
  }
];

const users = [
  { name: "Maya Chen", role: "Order Manager", location: "Seattle", workload: 12, status: "Online" },
  { name: "Andre Collins", role: "Fulfillment Lead", location: "Denver", workload: 9, status: "In warehouse" },
  { name: "Sofia Patel", role: "Logistics Coordinator", location: "Boston", workload: 7, status: "Escalation watch" },
  { name: "Lena Park", role: "Integration Analyst", location: "Remote", workload: 5, status: "Monitoring" }
];

const integrations = [
  { name: "ERP Sync", owner: "Finance Ops", state: "Healthy", detail: "Orders and invoices synced every 5 minutes." },
  { name: "Carrier API", owner: "Logistics", state: "Warning", detail: "UPS rate lookup retried twice in the last hour." },
  { name: "Warehouse Scanner", owner: "Operations", state: "Healthy", detail: "Live device events from both pick zones." },
  { name: "Customer Alerts", owner: "CX Automation", state: "Paused", detail: "SMS template update pending approval." }
];

const calendarEvents = [
  { time: "09:30", title: "Daily fulfillment standup", owner: "Ops team", note: "Focus on same-day dispatch backlog." },
  { time: "11:00", title: "Carrier SLA review", owner: "Logistics", note: "Review delayed east coast deliveries." },
  { time: "14:00", title: "Integration release window", owner: "Platform", note: "ERP sync patch rollout and smoke checks." },
  { time: "16:30", title: "Warehouse staffing check", owner: "People Ops", note: "Confirm evening packing coverage." }
];

const navigation = [
  {
    id: "overview",
    label: "Overview",
    short: "Workspace summary",
    description: "A cross-functional snapshot of the Clearify operations workspace."
  },
  {
    id: "orders",
    label: "Orders",
    short: "Pipeline and queue",
    description: "Track open orders, workflow stages, and detailed fulfillment progress."
  },
  {
    id: "shipments",
    label: "Shipments",
    short: "Carrier readiness",
    description: "Monitor shipments by carrier, ETA, and handoff status."
  },
  {
    id: "users",
    label: "Users",
    short: "Team visibility",
    description: "See who owns work across order processing, logistics, and integrations."
  },
  {
    id: "integrations",
    label: "Integrations",
    short: "Connected systems",
    description: "Watch operational connections, sync health, and automation readiness."
  },
  {
    id: "calendar",
    label: "Calendar",
    short: "Schedule and milestones",
    description: "Keep the team aligned on release windows, reviews, and warehouse timing."
  }
];

let activeView = "overview";
let selectedOrderId = orders[0].id;

const sidebarNav = document.getElementById("sidebarNav");
const sidebarSpotlight = document.getElementById("sidebarSpotlight");
const summaryCards = document.getElementById("summaryCards");
const viewTabs = document.getElementById("viewTabs");
const viewEyebrow = document.getElementById("viewEyebrow");
const viewTitle = document.getElementById("viewTitle");
const viewDescription = document.getElementById("viewDescription");
const viewContent = document.getElementById("viewContent");

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

function integrationTone(state) {
  if (state === "Healthy") return "signal-pill signal-good";
  if (state === "Warning") return "signal-pill signal-warn";
  return "signal-pill signal-muted";
}

function getViewMeta() {
  return navigation.find((item) => item.id === activeView);
}

function getSelectedOrder() {
  return orders.find((order) => order.id === selectedOrderId) || orders[0];
}

function sharedMetrics() {
  const totalOrders = orders.length;
  const dispatched = orders.filter((order) => statusIndex(order.status) >= statusIndex("dispatched")).length;
  const activeShipments = orders.filter((order) => order.carrier !== "Pending").length;
  const totalValue = orders.reduce((sum, order) => sum + order.value, 0);

  return [
    { label: "Orders in flow", value: totalOrders },
    { label: "Shipments active", value: activeShipments },
    { label: "Ready or shipped", value: dispatched },
    { label: "Pipeline value", value: currency(totalValue) }
  ];
}

function renderSummary() {
  summaryCards.innerHTML = sharedMetrics().map((card) => `
    <article class="stat-card">
      <span class="label">${card.label}</span>
      <strong>${card.value}</strong>
    </article>
  `).join("");
}

function renderSidebar() {
  sidebarNav.innerHTML = navigation.map((item) => `
    <button class="nav-button ${item.id === activeView ? "active" : ""}" data-view="${item.id}">
      <strong>${item.label}</strong>
      <span>${item.short}</span>
    </button>
  `).join("");

  sidebarNav.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      renderApp();
    });
  });
}

function renderSidebarSpotlight() {
  const delayed = orders.filter((order) => order.eta === "TBD" || order.status === "validated").length;

  sidebarSpotlight.innerHTML = `
    <p class="eyebrow">Today</p>
    <h3>Operations Focus</h3>
    <p class="support-text">Keep warehouse flow, carrier syncs, and team ownership visible from the same navigation shell.</p>
    <div class="sidebar-kpis">
      <div>
        <span>Users on shift</span>
        <strong>${users.length}</strong>
      </div>
      <div>
        <span>Watchlist items</span>
        <strong>${delayed}</strong>
      </div>
      <div>
        <span>Integrations monitored</span>
        <strong>${integrations.length}</strong>
      </div>
    </div>
  `;
}

function renderViewTabs() {
  viewTabs.innerHTML = navigation.map((item) => `
    <button class="tab-button ${item.id === activeView ? "active" : ""}" data-view="${item.id}">
      <strong>${item.label}</strong>
      <span>${item.short}</span>
    </button>
  `).join("");

  viewTabs.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      activeView = button.dataset.view;
      renderApp();
    });
  });
}

function renderHeader() {
  const view = getViewMeta();
  viewEyebrow.textContent = "Workspace View";
  viewTitle.textContent = view.label;
  viewDescription.textContent = view.description;
}

function renderStageBoard() {
  const selectedOrder = getSelectedOrder();
  const selectedStageIndex = statusIndex(selectedOrder.status);

  return `
    <section class="content-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Pipeline</p>
          <h3>Workflow Stages</h3>
          <p class="support-text">The original order-to-shipment skeleton now sits inside a broader operational app shell.</p>
        </div>
        <span class="metric-badge">Selected order: ${selectedOrder.id}</span>
      </div>
      <div class="stage-board">
        ${stages.map((stage) => {
          const stageOrders = orders.filter((order) => order.status === stage.id);
          const currentStageIndex = statusIndex(stage.id);
          let stateClass = "";
          if (currentStageIndex < selectedStageIndex) stateClass = "completed-stage";
          if (currentStageIndex === selectedStageIndex) stateClass = "active-stage";

          return `
            <article class="stage-column ${stateClass}">
              <span class="stage-count">${stageOrders.length}</span>
              <h4>${stage.name}</h4>
              <p>${stage.description}</p>
              <div class="timeline-grid">
                ${stageOrders.length
                  ? stageOrders.map((order) => `<div class="chip">${order.id} - ${order.customer}</div>`).join("")
                  : '<div class="chip">No orders</div>'}
              </div>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

function renderOrdersTable() {
  return `
    <section class="content-panel table-card">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Orders</p>
          <h3>Open Orders</h3>
          <p class="support-text">Click a row to update the detail view and stage context.</p>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Value</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="ordersTable">
            ${orders.map((order) => `
              <tr data-order-id="${order.id}" class="${order.id === selectedOrderId ? "selected" : ""}">
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.items}</td>
                <td>${currency(order.value)}</td>
                <td>${order.owner}</td>
                <td><span class="status-pill" style="${statusPillStyle(order.status)}">${stageLabel(order.status)}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderOrderDetail() {
  const order = getSelectedOrder();
  const currentIndex = statusIndex(order.status);

  return `
    <section class="content-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">Shipment View</p>
          <h3>${order.id}</h3>
          <p class="support-text">Operational detail for the selected order and linked shipment.</p>
        </div>
      </div>
      <div class="view-content">
        <article class="detail-card">
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
                    <span>${index + 1}. ${stage.name}</span>
                    <b>${order.timeline[stage.id] || "Waiting for update"}</b>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderOverviewView() {
  const selectedOrder = getSelectedOrder();
  const atRiskIntegration = integrations.find((item) => item.state !== "Healthy");

  return `
    <div class="view-content">
      <section class="content-grid">
        <article class="content-panel activity-card">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Focus Areas</p>
              <h3>What teams need next</h3>
            </div>
          </div>
          <div class="activity-list">
            <div class="activity-row">
              <strong>Orders</strong>
              <span>${orders.filter((order) => statusIndex(order.status) < statusIndex("packed")).length} orders still need warehouse action.</span>
            </div>
            <div class="activity-row">
              <strong>Shipments</strong>
              <span>${selectedOrder.id} is closest to dispatch completion for the current focus lane.</span>
            </div>
            <div class="activity-row">
              <strong>Integrations</strong>
              <span>${atRiskIntegration.name} needs follow-up because it is marked ${atRiskIntegration.state.toLowerCase()}.</span>
            </div>
          </div>
        </article>

        <article class="content-panel activity-card">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Live Coordination</p>
              <h3>Cross-team signals</h3>
            </div>
          </div>
          <div class="metric-grid">
            <article class="mini-card">
              <span>Warehouse readiness</span>
              <strong>82%</strong>
            </article>
            <article class="mini-card">
              <span>Carrier handoff pace</span>
              <strong>94%</strong>
            </article>
            <article class="mini-card">
              <span>User coverage</span>
              <strong>${users.length}/4</strong>
            </article>
            <article class="mini-card">
              <span>Upcoming events</span>
              <strong>${calendarEvents.length}</strong>
            </article>
          </div>
        </article>
      </section>

      ${renderStageBoard()}
    </div>
  `;
}

function renderOrdersView() {
  return `
    <div class="split-layout">
      <div class="view-content">
        ${renderStageBoard()}
        ${renderOrdersTable()}
      </div>
      ${renderOrderDetail()}
    </div>
  `;
}

function renderShipmentsView() {
  return `
    <div class="split-layout">
      <section class="content-panel table-card">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Shipments</p>
            <h3>Carrier Queue</h3>
            <p class="support-text">A dedicated shipment-facing view beside the order workflow.</p>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Carrier</th>
                <th>Warehouse</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map((order) => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.carrier}</td>
                  <td>${order.warehouse}</td>
                  <td>${order.eta}</td>
                  <td><span class="status-pill" style="${statusPillStyle(order.status)}">${stageLabel(order.status)}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>

      <section class="content-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Shipment Insights</p>
            <h3>Dispatch Notes</h3>
          </div>
        </div>
        <div class="cards-grid">
          ${orders.map((order) => `
            <article class="timeline-card">
              <h4>${order.id}</h4>
              <p>${order.customer}</p>
              <div class="data-list">
                <div><strong>Carrier</strong><span>${order.carrier}</span></div>
                <div><strong>ETA</strong><span>${order.eta}</span></div>
                <div><strong>Owner</strong><span>${order.owner}</span></div>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderUsersView() {
  return `
    <div class="content-grid">
      <section class="content-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Users</p>
            <h3>Operations Team</h3>
            <p class="support-text">This section gives the app a broader product footprint beyond orders and shipments.</p>
          </div>
        </div>
        <div class="cards-grid">
          ${users.map((user) => `
            <article class="timeline-card">
              <h4>${user.name}</h4>
              <p>${user.role}</p>
              <div class="data-list">
                <div><strong>Location</strong><span>${user.location}</span></div>
                <div><strong>Active workload</strong><span>${user.workload} tasks</span></div>
                <div><strong>Status</strong><span>${user.status}</span></div>
              </div>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="content-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Ownership</p>
            <h3>Current Assignments</h3>
          </div>
        </div>
        <div class="activity-list">
          ${orders.map((order) => `
            <div class="activity-row">
              <strong>${order.id}</strong>
              <span>${order.owner} is coordinating ${stageLabel(order.status).toLowerCase()} for ${order.customer}.</span>
            </div>
          `).join("")}
        </div>
      </section>
    </div>
  `;
}

function renderIntegrationsView() {
  return `
    <div class="content-grid">
      <section class="content-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Integrations</p>
            <h3>Connected Systems</h3>
            <p class="support-text">A monitoring surface for the systems that keep operations moving.</p>
          </div>
        </div>
        <div class="integration-grid">
          ${integrations.map((integration) => `
            <article class="integration-card">
              <header>
                <div>
                  <h4>${integration.name}</h4>
                  <p>${integration.owner}</p>
                </div>
                <span class="${integrationTone(integration.state)}">${integration.state}</span>
              </header>
              <p>${integration.detail}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="content-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Automation Readiness</p>
            <h3>Release Checklist</h3>
          </div>
        </div>
        <div class="activity-list">
          <div class="activity-row">
            <strong>ERP verification</strong>
            <span>Confirm all order totals match the finance export after the next sync.</span>
          </div>
          <div class="activity-row">
            <strong>Carrier fallback</strong>
            <span>Prepare manual label generation for affected UPS requests during warning windows.</span>
          </div>
          <div class="activity-row">
            <strong>Alert templates</strong>
            <span>Approve customer notification copy before unpausing the SMS integration.</span>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderCalendarView() {
  return `
    <div class="calendar-grid">
      <section class="content-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Calendar</p>
            <h3>Today's Operations Schedule</h3>
            <p class="support-text">This fills out the navigation with planning and coordination alongside execution views.</p>
          </div>
        </div>
        <div class="calendar-list">
          ${calendarEvents.map((event) => `
            <div class="event-row">
              <strong>${event.time}</strong>
              <div>
                <div>${event.title}</div>
                <span class="mini-note">${event.owner} - ${event.note}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </section>

      <section class="content-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Milestones</p>
            <h3>Planning Horizon</h3>
          </div>
        </div>
        <div class="cards-grid">
          <article class="calendar-card">
            <header>
              <div>
                <h4>Warehouse throughput</h4>
                <small>Target for end of week</small>
              </div>
              <span class="signal-pill signal-good">On track</span>
            </header>
            <p>Keep average pack completion below 40 minutes for priority orders.</p>
          </article>
          <article class="calendar-card">
            <header>
              <div>
                <h4>Integration patch</h4>
                <small>Platform release window</small>
              </div>
              <span class="signal-pill signal-warn">Needs watch</span>
            </header>
            <p>Monitor ERP sync jobs for 30 minutes after deployment.</p>
          </article>
        </div>
      </section>
    </div>
  `;
}

function renderActiveView() {
  if (activeView === "orders") {
    viewContent.innerHTML = renderOrdersView();
  } else if (activeView === "shipments") {
    viewContent.innerHTML = renderShipmentsView();
  } else if (activeView === "users") {
    viewContent.innerHTML = renderUsersView();
  } else if (activeView === "integrations") {
    viewContent.innerHTML = renderIntegrationsView();
  } else if (activeView === "calendar") {
    viewContent.innerHTML = renderCalendarView();
  } else {
    viewContent.innerHTML = renderOverviewView();
  }

  const tableBody = document.getElementById("ordersTable");
  if (tableBody) {
    tableBody.querySelectorAll("tr").forEach((row) => {
      row.addEventListener("click", () => {
        selectedOrderId = row.dataset.orderId;
        renderApp();
      });
    });
  }
}

function renderApp() {
  renderSidebar();
  renderSidebarSpotlight();
  renderSummary();
  renderHeader();
  renderViewTabs();
  renderActiveView();
}

renderApp();
