'use client';

import { useState } from 'react';
import type { AdminMaterial, AdminPart, AdminStock, PartAction, StockAction } from '@/lib/admin-stock';

const number = (n: number) => n.toLocaleString('en-AU');

function printTime(minutes: number): string {
  if (minutes <= 0) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function when(iso: string): string {
  return new Date(iso).toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const ACTION_LABELS: Record<string, string> = {
  set: 'Stock-take',
  adjust: 'Adjusted',
  setOnOrder: 'On order',
  receive: 'Received',
  setWaste: 'Waste %',
  printed: 'Printed',
  setPrinted: 'Stock-take',
  adjustPrinted: 'Adjusted',
};

type Send = (action: StockAction | PartAction, id: string, value?: number) => Promise<boolean>;

/** Short label for a part ("Top Cover Smooth", not the full product name) */
function shortName(name: string): string {
  return name.replace(/^Dash Replacement Parts - /, '').replace(/ \(Pair\)$/, '');
}

function NumberForm({
  label,
  buttonLabel,
  onSubmit,
  disabled,
  initial = '',
}: {
  label: string;
  buttonLabel: string;
  onSubmit: (value: number) => Promise<boolean>;
  disabled: boolean;
  initial?: string;
}) {
  const [text, setText] = useState(initial);
  return (
    <form
      className="admin-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (text.trim() === '') return;
        if (await onSubmit(Number(text))) setText('');
      }}
    >
      <label>
        <span>{label}</span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <button type="submit" disabled={disabled || text.trim() === ''}>
        {buttonLabel}
      </button>
    </form>
  );
}

function MaterialCard({ material, send, busy }: { material: AdminMaterial; send: Send; busy: boolean }) {
  const isFilament = material.unit === 'g';
  return (
    <section className="admin-card" aria-labelledby={`m-${material.id}`}>
      <div className="admin-card-head">
        <h3 id={`m-${material.id}`}>{material.name}</h3>
        {!material.autoDeducted && <span className="admin-tag">Counted by hand</span>}
      </div>

      <p className="admin-big">
        {number(material.onHand)} <span>{material.unit === 'each' ? '' : material.unit}</span>
        {isFilament && <small> ({(material.onHand / 1000).toFixed(2)} kg)</small>}
      </p>
      <p className="admin-sub">
        {material.onOrder > 0 ? `${number(material.onOrder)} ${material.unit === 'each' ? '' : material.unit} on order` : 'Nothing on order'}
        {!material.autoDeducted && ' · The shop does not take this off per order'}
      </p>

      <div className="admin-forms">
        <NumberForm
          label="Set exact count"
          buttonLabel="Save"
          disabled={busy}
          onSubmit={(v) => send('set', material.id, v)}
        />
        <div className="admin-pair">
          <NumberForm label="Add" buttonLabel="Add" disabled={busy} onSubmit={(v) => send('adjust', material.id, v)} />
          <NumberForm label="Remove" buttonLabel="Remove" disabled={busy} onSubmit={(v) => send('adjust', material.id, -v)} />
        </div>
        <NumberForm
          label="On order"
          buttonLabel="Set"
          disabled={busy}
          onSubmit={(v) => send('setOnOrder', material.id, v)}
        />
        {material.onOrder > 0 && (
          <button
            type="button"
            className="admin-primary"
            disabled={busy}
            onClick={() => send('receive', material.id)}
          >
            Delivery arrived: add {number(material.onOrder)} to on hand
          </button>
        )}
        {isFilament && (
          <NumberForm
            label={`Waste % (now ${material.wastePct}%)`}
            buttonLabel="Set"
            disabled={busy}
            onSubmit={(v) => send('setWaste', material.id, v)}
          />
        )}
      </div>
    </section>
  );
}

function PartCard({ part, send, busy }: { part: AdminPart; send: Send; busy: boolean }) {
  return (
    <section className="admin-card" aria-labelledby={`p-${part.priceId}`}>
      <div className="admin-card-head">
        <h3 id={`p-${part.priceId}`}>{shortName(part.name)}</h3>
      </div>

      <p className="admin-big">
        {number(part.printedStock)} <span>printed</span>
      </p>
      <p className="admin-sub">
        {part.filamentG} g · {printTime(part.printMinutes)} each
        {part.heatInserts > 0 && ` · ${part.heatInserts} inserts`} · could print {number(part.canPrint)} more
      </p>

      <div className="admin-forms">
        <NumberForm
          label="I printed (uses filament)"
          buttonLabel="Printed"
          disabled={busy}
          onSubmit={(v) => send('printed', part.priceId, v)}
        />
        <NumberForm
          label="Set exact count"
          buttonLabel="Save"
          disabled={busy}
          onSubmit={(v) => send('setPrinted', part.priceId, v)}
        />
        <div className="admin-pair">
          <NumberForm label="Add" buttonLabel="Add" disabled={busy} onSubmit={(v) => send('adjustPrinted', part.priceId, v)} />
          <NumberForm label="Remove" buttonLabel="Remove" disabled={busy} onSubmit={(v) => send('adjustPrinted', part.priceId, -v)} />
        </div>
      </div>
    </section>
  );
}

export function StockAdmin({ initial, email }: { initial: AdminStock; email: string }) {
  const [data, setData] = useState<AdminStock>(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const send: Send = async (action, id, value) => {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id, value }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ kind: 'error', text: body.error || 'Something went wrong.' });
        return false;
      }
      setData(body as AdminStock);
      setMessage({ kind: 'ok', text: 'Saved.' });
      return true;
    } catch {
      setMessage({ kind: 'error', text: 'Could not reach the server. Check your connection and try again.' });
      return false;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <div>
          <h1>Stock admin</h1>
          <p className="admin-sub">Signed in as {email}</p>
        </div>
        <nav className="admin-links">
          <a href="/">View site</a>
          <a href="/cdn-cgi/access/logout">Sign out</a>
        </nav>
      </header>

      <div className={`admin-message ${message ? `admin-message-${message.kind}` : ''}`} role="status" aria-live="polite">
        {message?.text}
      </div>

      <h2>Materials</h2>
      <p className="admin-sub">
        Orders take filament, heat inserts and a box or mailer off automatically. Change a count here after a
        stock-take or when something arrives.
      </p>
      <div className="admin-grid">
        {data.materials.map((m) => (
          <MaterialCard key={m.id} material={m} send={send} busy={busy} />
        ))}
      </div>

      <h2>Printed parts</h2>
      <p className="admin-sub">
        Parts printed ahead of time. A sale uses these first and only prints (uses filament) for what is short. Kits
        have no stock of their own: they are made from these parts. <strong>Printed</strong> adds to the count and takes
        the filament and heat inserts off your materials; <strong>Add</strong> and <strong>Remove</strong> change the
        count without touching materials.
      </p>
      <div className="admin-grid">
        {data.parts.map((p) => (
          <PartCard key={p.priceId} part={p} send={send} busy={busy} />
        ))}
      </div>

      <h2>What you can sell right now</h2>
      <p className="admin-sub">
        What the shop shows as in stock, one product at a time: printed and ready, plus what could still be printed
        from your materials.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th className="num">Ready now</th>
              <th className="num">Can sell</th>
              <th>Limited by</th>
              <th className="num">Filament</th>
              <th className="num">Print time</th>
              <th className="num">Inserts</th>
              <th>Packed in</th>
            </tr>
          </thead>
          <tbody>
            {data.sellable.map((r) => (
              <tr key={r.priceId} className={r.canMake === 0 ? 'is-out' : ''}>
                <td>
                  {r.name}
                  {r.kind === 'kit' && <span className="admin-subtle"> (kit: {r.madeFrom})</span>}
                </td>
                <td className="num">{r.printed}</td>
                <td className="num">
                  <strong>{r.canMake}</strong>
                </td>
                <td>{r.limitedBy ?? '-'}</td>
                <td className="num">{r.filamentG} g</td>
                <td className="num">{printTime(r.printMinutes)}</td>
                <td className="num">{r.heatInserts || '-'}</td>
                <td>{r.packaging === 'box' ? 'Box' : 'Mailer'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Recent changes</h2>
      {data.log.length === 0 ? (
        <p className="admin-sub">No changes made here yet.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Material</th>
                <th>What</th>
                <th className="num">Change</th>
                <th className="num">On hand after</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {data.log.map((l, i) => (
                <tr key={`${l.at}-${i}`}>
                  <td>{when(l.at)}</td>
                  <td>{l.materialName}</td>
                  <td>
                    {ACTION_LABELS[l.action] ?? l.action}
                    {l.note ? ` (${l.note})` : ''}
                  </td>
                  <td className="num">{l.change > 0 ? `+${number(l.change)}` : l.change === 0 ? '-' : number(l.change)}</td>
                  <td className="num">{number(l.onHandAfter)}</td>
                  <td>{l.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
