import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError } from '@/lib/api';
import { prettyDay } from '@/lib/format';
import { useData, useSession } from '../session';
import { Async, Badge, Btn, DemoNote, Empty, Field, FormError, PageHead, Panel, Row, RowMain, StatusBadge, useToast } from '../ui';
import { QrImage } from '../shared';

interface Entry {
  id: string;
  memberId: string;
  name: string;
  memberCode: string;
  time: string;
  method: 'manual' | 'qr';
}
interface Waiting {
  id: string;
  name: string;
  memberCode: string;
  status: string;
  daysLeft: number;
}
interface Sheet {
  day: string;
  isToday: boolean;
  entries: Entry[];
  notCheckedIn: Waiting[];
}

export default function Attendance() {
  const { api } = useSession();
  const toast = useToast();
  const [date, setDate] = useState('');
  const sheet = useData<Sheet>(`/attendance${date ? `?date=${date}` : ''}`);
  const [query, setQuery] = useState('');
  const [code, setCode] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const waiting = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (sheet.data?.notCheckedIn ?? []).filter((m) => !q || m.name.toLowerCase().includes(q) || m.memberCode.toLowerCase().includes(q));
  }, [sheet.data, query]);
  // The pass shown in the QR demo: the first member still to arrive today.
  const samplePass = sheet.data?.notCheckedIn.find((m) => m.status !== 'expired');

  const checkIn = async (body: { memberId?: string; memberCode?: string; method: 'manual' | 'qr' }, key: string) => {
    setBusyId(key);
    setError(null);
    try {
      const res = await api<{ entry: Entry; warning: string | null }>('/attendance', { method: 'POST', body });
      toast(res.warning ? `${res.entry.name} checked in. ${res.warning}` : `${res.entry.name} checked in at ${res.entry.time}.`, res.warning ? 'warn' : 'ok');
      setCode('');
      sheet.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not check in. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const undo = async (entry: Entry) => {
    setBusyId(entry.id);
    try {
      await api(`/attendance/${entry.id}`, { method: 'DELETE' });
      toast(`Check-in removed for ${entry.name}.`);
      sheet.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not undo that check-in.');
    } finally {
      setBusyId(null);
    }
  };

  const scan = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) void checkIn({ memberCode: code.trim(), method: 'qr' }, 'scan');
  };

  return (
    <>
      <PageHead
        title="Attendance"
        sub="Check members in at the front desk, or by the QR pass on their phone."
        actions={
          <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-mute">
            Day
            <input
              type="date"
              value={date || sheet.data?.day || ''}
              max={sheet.data?.isToday ? sheet.data.day : undefined}
              onChange={(e) => setDate(e.target.value)}
              className="border border-line bg-ink px-3 py-2 text-sm text-bone"
            />
          </label>
        }
      />
      <div className="mb-4">
        <FormError message={error} />
      </div>

      <Async state={sheet} label="Loading attendance">
        {({ entries, isToday, day }) => (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              {isToday ? (
                <>
                  <Panel title="QR check-in" hint="Each member has a pass with a QR code. Scanning it records the visit.">
                    <div className="grid gap-5 p-4 sm:grid-cols-[auto_1fr] sm:p-5">
                      {samplePass ? (
                        <div className="justify-self-center border border-line bg-ink p-3 text-center">
                          <QrImage text={samplePass.memberCode} label={`QR pass for ${samplePass.name}`} size={132} />
                          <p className="mt-2 text-sm text-bone">{samplePass.name}</p>
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mute">{samplePass.memberCode}</p>
                        </div>
                      ) : (
                        <p className="self-center text-sm text-mute">Everyone has checked in today.</p>
                      )}
                      <div className="space-y-4">
                        {samplePass && (
                          <Btn busy={busyId === 'pass'} onClick={() => checkIn({ memberCode: samplePass.memberCode, method: 'qr' }, 'pass')}>
                            Scan this pass
                          </Btn>
                        )}
                        <form onSubmit={scan} className="flex items-end gap-2">
                          <div className="min-w-0 flex-1">
                            <Field label="Or type a member code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="IP-1001" autoComplete="off" />
                          </div>
                          <Btn type="submit" variant="ghost" busy={busyId === 'scan'} disabled={!code.trim()}>
                            Check in
                          </Btn>
                        </form>
                        <DemoNote>In the demo, "Scan this pass" stands in for the phone camera or a desk scanner reading the code.</DemoNote>
                      </div>
                    </div>
                  </Panel>

                  <Panel title={`Not checked in yet (${sheet.data!.notCheckedIn.length})`}>
                    <div className="border-b border-line p-3 sm:px-5">
                      <label>
                        <span className="sr-only">Find a member</span>
                        <input
                          type="search"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          placeholder="Find a member"
                          className="w-full border border-line bg-ink px-3 py-2.5 text-base text-bone outline-none placeholder:text-mute/60 focus:border-bone sm:text-sm"
                        />
                      </label>
                    </div>
                    <div className="max-h-[26rem] overflow-y-auto">
                      {waiting.length === 0 ? (
                        <Empty title="No one to show">{query ? 'No member matches that search.' : 'Every member has checked in today.'}</Empty>
                      ) : (
                        waiting.map((m) => (
                          <Row key={m.id}>
                            <RowMain title={m.name} meta={m.memberCode} />
                            <div className="flex items-center gap-2">
                              {m.status !== 'active' && <StatusBadge status={m.status} />}
                              <Btn size="sm" busy={busyId === m.id} onClick={() => checkIn({ memberId: m.id, method: 'manual' }, m.id)} aria-label={`Check in ${m.name}`}>
                                Check in
                              </Btn>
                            </div>
                          </Row>
                        ))
                      )}
                    </div>
                  </Panel>
                </>
              ) : (
                <Panel>
                  <Empty title="Viewing a past day" action={<Btn variant="ghost" size="sm" onClick={() => setDate('')}>Back to today</Btn>}>
                    Check-ins can only be recorded for today. Past days are shown for reference.
                  </Empty>
                </Panel>
              )}
            </div>

            <Panel title={`Checked in · ${prettyDay(day)} (${entries.length})`}>
              {entries.length === 0 ? (
                <Empty title="No check-ins">Nobody was checked in on this day.</Empty>
              ) : (
                entries.map((e) => (
                  <Row key={e.id}>
                    <RowMain title={e.name} meta={`${e.memberCode} · ${e.time}`} />
                    <div className="flex items-center gap-2">
                      <Badge>{e.method === 'qr' ? 'QR pass' : 'Front desk'}</Badge>
                      {isToday && (
                        <Btn variant="quiet" size="sm" busy={busyId === e.id} onClick={() => undo(e)} aria-label={`Undo check-in for ${e.name}`}>
                          Undo
                        </Btn>
                      )}
                    </div>
                  </Row>
                ))
              )}
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
