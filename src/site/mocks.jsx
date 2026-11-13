// Product windows ("MOCKS") and single components ("PIECES") drawn in HTML/CSS.
// Each MOCK is a 64em x 40em stage that scales with its .shot container.
// Cards under 860px show only the left part, so the key screen sits on the left.
// Names and numbers inside the windows are illustrative sample data.
// Classes are prefixed per project: bb- (bail bonds), pos- (POS).
import Icon from "./Icon.jsx";

function MkBar({ title, right }) {
  return (
    <div className="mk-bar">
      <div className="mk-dots">
        <i />
        <i />
        <i />
      </div>
      <div className="mk-title">{title}</div>
      {right}
    </div>
  );
}
const Pill = ({ cy, children }) => <span className={`mk-pill${cy ? " cy" : ""}`}>{children}</span>;
const PcHead = ({ k, right }) => (
  <div className="pc-head">
    <span className="pc-k">{k}</span>
    {right}
  </div>
);
const PcRows = ({ rows }) => (
  <div className="pc-rows">
    {rows.map(([a, b]) => (
      <div key={a}>
        <span>{a}</span>
        <span>{b}</span>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ Bail bonds */
const BB_ROWS = [
  ["BB-25-0142", "R. Mendoza", "RTC Br. 7", "60,000.00", "Mar 03", "Active", 1],
  ["BB-25-0139", "L. Abella", "MTCC Br. 2", "24,000.00", "Feb 27", "Active"],
  ["BB-25-0131", "J. Tan", "RTC Br. 12", "120,000.00", "Feb 19", "For renewal"],
  ["BB-25-0126", "E. Ramos", "MTCC Br. 4", "18,000.00", "Feb 11", "Active"],
  ["BB-25-0118", "C. Uy", "RTC Br. 7", "90,000.00", "Feb 02", "Cancelled"],
  ["BB-25-0107", "G. Navarro", "RTC Br. 9", "36,000.00", "Jan 24", "Active"],
  ["BB-25-0098", "F. Lopez", "MTCC Br. 1", "12,000.00", "Jan 15", "Active"],
];

function BbTimeline() {
  return (
    <div className="bb-tl">
      {[
        ["Encoded", "Mar 3, 09:14", 1],
        ["Reviewed", "Mar 3, 10:02", 1],
        ["Posted to court", "Mar 3, 14:30", 1],
        ["Renewal check", "Due Mar 2026"],
      ].map(([t, w, done]) => (
        <div key={t} className={done ? "done" : undefined}>
          <i />
          <span>{t}</span>
          <small className="mk-mono">{w}</small>
        </div>
      ))}
    </div>
  );
}

function Bail() {
  return (
    <div className="mk mk-bb">
      <MkBar
        title={
          <>
            Bail Bonds&nbsp;&nbsp;<span className="mk-muted">Records</span>
          </>
        }
        right={
          <span className="mk-btn cy">
            <Icon name="file-text" />
            New bond
          </span>
        }
      />
      <div className="bb-body">
        <div className="bb-main">
          <div className="bb-tools">
            <div className="bb-search">
              <Icon name="search" />
              Search bond no. or name
              <span className="mk-kbd">/</span>
            </div>
            <div className="bb-chips">
              <span className="on">
                All <b>248</b>
              </span>
              <span>
                Active <b>131</b>
              </span>
              <span>
                For renewal <b>12</b>
              </span>
              <span>
                Cancelled <b>105</b>
              </span>
            </div>
          </div>
          <div className="bb-table">
            <div className="bb-tr bb-th">
              <span>Bond no.</span>
              <span>Principal</span>
              <span>Court</span>
              <span className="r">Amount</span>
              <span>Posted</span>
              <span>Status</span>
            </div>
            {BB_ROWS.map(([no, who, court, amt, posted, st, on]) => (
              <div key={no} className={`bb-tr${on ? " on" : ""}`}>
                <span className="mk-mono">{no}</span>
                <span>{who}</span>
                <span className="mk-muted">{court}</span>
                <span className="mk-mono r">{amt}</span>
                <span className="mk-mono mk-muted">{posted}</span>
                <span>
                  <Pill cy={st === "For renewal"}>{st}</Pill>
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="bb-detail">
          <div className="bb-detail-h">
            <span className="mk-mono">BB-25-0142</span>
            <Pill cy>Active</Pill>
          </div>
          <div className="bb-name">R. Mendoza</div>
          <PcRows
            rows={[
              ["Case no.", <span className="mk-mono" key="c">CR-25-1187</span>],
              ["Court", "RTC Branch 7"],
              ["Amount", <span className="mk-mono" key="a">PHP 60,000.00</span>],
              ["Posted", "Mar 3, 2025"],
            ]}
          />
          <div className="pc-sub">History</div>
          <BbTimeline />
        </div>
      </div>
    </div>
  );
}

function BbRecord() {
  return (
    <>
      <PcHead k="BB-25-0142" right={<Pill cy>Active</Pill>} />
      <div className="pc-body">
        <div className="pc-title">R. Mendoza</div>
        <PcRows
          rows={[
            ["Case no.", <span className="mk-mono" key="c">CR-25-1187</span>],
            ["Court", "RTC Branch 7"],
            ["Amount", <span className="mk-mono" key="a">PHP 60,000.00</span>],
          ]}
        />
        <BbTimeline />
      </div>
    </>
  );
}

function BbSearch() {
  return (
    <>
      <PcHead k="Search records" right={<span className="mk-kbd">/</span>} />
      <div className="pc-body">
        <div className="pc-field">
          mendoza<span className="bb-caret" />
        </div>
        <div className="bb-results">
          {[
            ["BB-25-0142", "R. Mendoza", "Active", 1],
            ["BB-24-0871", "R. Mendoza", "Cancelled"],
            ["BB-24-0533", "A. Mendoza", "Active"],
          ].map(([no, who, st, on]) => (
            <div key={no} className={on ? "on" : undefined}>
              <span className="mk-mono">{no}</span>
              <span>{who}</span>
              <Pill cy={on}>{st}</Pill>
            </div>
          ))}
        </div>
        <div className="pc-sub">3 records, 0.2 s</div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ POS */
const POS_ITEMS = [
  ["Rice, 5 kg", "285.00", 42, 0, 1],
  ["Cooking oil, 1 L", "118.00", 18],
  ["Sardines, 155 g", "24.50", 96],
  ["Instant coffee, 10s", "68.00", 30],
  ["Eggs, tray of 30", "255.00", 7, 1],
  ["Sugar, 1 kg", "92.00", 25],
  ["Bottled water, 1 L", "22.00", 120],
  ["Dish soap, 250 ml", "45.00", 14],
  ["Bread loaf", "78.00", 5, 1],
  ["Corned beef, 150 g", "56.00", 40],
  ["Soy sauce, 1 L", "58.00", 22],
  ["Laundry powder, 1 kg", "89.00", 11],
];
const POS_LINES = [
  ["2", "Rice, 5 kg", "570.00"],
  ["1", "Cooking oil, 1 L", "118.00"],
  ["3", "Sardines, 155 g", "73.50"],
  ["1", "Eggs, tray of 30", "255.00"],
  ["2", "Bread loaf", "156.00"],
];

function PosLines() {
  return (
    <div className="pos-lines">
      {POS_LINES.map(([q, n, a]) => (
        <div key={n}>
          <span className="mk-mono mk-muted">{q}x</span>
          <span>{n}</span>
          <span className="mk-mono">{a}</span>
        </div>
      ))}
    </div>
  );
}
function PosTotals() {
  return (
    <div className="pos-totals">
      <div>
        <span>Subtotal</span>
        <span className="mk-mono">1,172.50</span>
      </div>
      <div>
        <span>VAT 12%, included</span>
        <span className="mk-mono">125.63</span>
      </div>
      <div className="t">
        <span>Total</span>
        <span className="mk-mono">PHP 1,172.50</span>
      </div>
    </div>
  );
}

function Pos() {
  return (
    <div className="mk mk-pos">
      <MkBar
        title={
          <>
            Point of Sale&nbsp;&nbsp;<span className="mk-muted">Counter 2</span>
          </>
        }
        right={
          <>
            <span className="mk-muted mk-mono">Shift 08:00</span>
            <span className="mk-btn">End of day</span>
          </>
        }
      />
      <div className="pos-body">
        <div className="pos-main">
          <div className="pos-tabs">
            <span className="on">All</span>
            <span>Grocery</span>
            <span>Beverages</span>
            <span>Household</span>
            <div className="pos-scan">
              <Icon name="scan" />
              Scan or search item
            </div>
          </div>
          <div className="pos-grid">
            {POS_ITEMS.map(([n, p, stock, low, on]) => (
              <div key={n} className={`pos-tile${on ? " on" : ""}`}>
                <span className="pos-ic">
                  <Icon name="package" />
                </span>
                <b>{n}</b>
                <span className="mk-mono">{p}</span>
                <small className={low ? "low" : undefined}>{low ? `Low: ${stock} left` : `${stock} in stock`}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="pos-cart">
          <div className="pos-cart-h">
            <span>
              Sale <span className="mk-mono">#10482</span>
            </span>
            <span className="mk-muted">Walk-in</span>
          </div>
          <PosLines />
          <PosTotals />
          <div className="pos-pay">
            <span className="on">Cash</span>
            <span>GCash</span>
            <span>Card</span>
          </div>
          <span className="mk-btn cy pos-charge">Charge PHP 1,172.50</span>
        </div>
      </div>
    </div>
  );
}

function PosReceipt() {
  return (
    <>
      <PcHead k="Sale #10482" right={<Pill cy>Cash</Pill>} />
      <div className="pc-body">
        <PosLines />
        <PosTotals />
      </div>
    </>
  );
}

function PosStock() {
  const rows = [
    ["Bread loaf", 5, 40, 1],
    ["Eggs, tray of 30", 7, 30, 1],
    ["Laundry powder, 1 kg", 11, 40, 1],
    ["Cooking oil, 1 L", 18, 40],
    ["Rice, 5 kg", 42, 60],
  ];
  return (
    <>
      <PcHead k="Inventory" right={<Pill cy>3 low</Pill>} />
      <div className="pc-body">
        <div className="pos-stock">
          {rows.map(([n, have, max, low]) => (
            <div key={n} className={low ? "low" : undefined}>
              <span>{n}</span>
              <span className="pos-track">
                <i style={{ "--v": have / max }} />
              </span>
              <span className="mk-mono">{have}</span>
            </div>
          ))}
        </div>
        <div className="pc-actions">
          <span className="mk-btn">Count stock</span>
          <span className="mk-btn cy">Reorder 3</span>
        </div>
      </div>
    </>
  );
}

export const MOCKS = { bail: Bail, pos: Pos };
export const PIECES = { bbRecord: BbRecord, bbSearch: BbSearch, posReceipt: PosReceipt, posStock: PosStock };
