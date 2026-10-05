import { useState } from 'react';
import { ApiError } from '@/lib/api';
import { inr, prettyDay, relDays } from '@/lib/format';
import { useData, useSession } from '../session';
import { AddonTag, Async, Badge, Btn, Empty, FormError, PageHead, Panel, Row, RowMain, useToast } from '../ui';
import { MessageModal, RenewForm } from '../shared';
import type { Member } from '../types';

interface RenewalList {
  expiring: Member[];
  lapsed: Member[];
}

const AUTOPAY_LABEL: Record<string, string> = { requested: 'Autopay requested', active: 'Autopay on', paused: 'Autopay paused', cancelled: 'Autopay cancelled' };

export default function Renewals() {
  const { api, session } = useSession();
  const { addons } = session.gym;
  const toast = useToast();
  const list = useData<RenewalList>('/renewals');
  const [renewing, setRenewing] = useState<Member | null>(null);
  const [messaging, setMessaging] = useState<Member | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestAutopay = async (m: Member) => {
    setBusyId(m.id);
    setError(null);
    try {
      await api('/addons/autopay/request', { method: 'POST', body: { memberId: m.id } });
      toast(`Autopay request recorded for ${m.name}. It only starts if they approve it.`);
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not send the request.');
    } finally {
      setBusyId(null);
    }
  };

  const rows = (members: Member[]) =>
    members.map((m) => {
      const autopay = m.autopay?.status ?? 'none';
      return (
        <Row key={m.id}>
          <RowMain
            title={m.name}
            meta={`${m.planName} · ${m.daysLeft < 0 ? 'ended' : 'ends'} ${prettyDay(m.expiryDate)} (${relDays(m.daysLeft)}) · ${m.phone}`}
          />
          <div className="flex flex-wrap items-center gap-2">
            {m.feeDue > 0 && <Badge tone="warn">{inr(m.feeDue)} due</Badge>}
            {addons.autopay && autopay !== 'none' && <Badge tone={autopay === 'active' ? 'ok' : 'mute'}>{AUTOPAY_LABEL[autopay]}</Badge>}
            <Btn size="sm" onClick={() => setRenewing(m)} aria-label={`Renew ${m.name}`}>
              Renew
            </Btn>
            {addons.whatsapp && (
              <Btn size="sm" variant="ghost" onClick={() => setMessaging(m)} aria-label={`Send reminder to ${m.name}`}>
                Reminder
              </Btn>
            )}
            {addons.autopay && (autopay === 'none' || autopay === 'cancelled') && (
              <Btn size="sm" variant="ghost" busy={busyId === m.id} onClick={() => requestAutopay(m)} aria-label={`Ask ${m.name} to set up Autopay`}>
                Ask for Autopay
              </Btn>
            )}
          </div>
        </Row>
      );
    });

  return (
    <>
      <PageHead title="Renewals" sub="The follow-up list: memberships ending in the next two weeks, and ones that lapsed in the last 45 days." />
      <div className="mb-4 space-y-3">
        <FormError message={error} />
        {(addons.whatsapp || addons.autopay) && (
          <p className="flex flex-wrap items-center gap-2 text-xs text-mute">
            <AddonTag /> Reminders and Autopay requests come from add-ons. In this demo nothing is charged, and reminders never go to the sample members.
          </p>
        )}
      </div>
      <Async state={list} label="Loading renewals">
        {({ expiring, lapsed }) => (
          <div className="space-y-6">
            <Panel title={`Ending in the next 14 days (${expiring.length})`}>
              {expiring.length === 0 ? <Empty title="Nothing ending soon">No memberships end in the next two weeks.</Empty> : rows(expiring)}
            </Panel>
            <Panel title={`Lapsed in the last 45 days (${lapsed.length})`}>
              {lapsed.length === 0 ? <Empty title="No lapsed memberships" /> : rows(lapsed)}
            </Panel>
          </div>
        )}
      </Async>

      {renewing && (
        <RenewForm
          member={renewing}
          onClose={() => setRenewing(null)}
          onSaved={() => {
            setRenewing(null);
            list.reload();
          }}
        />
      )}
      {messaging && <MessageModal template="renewal" memberId={messaging.id} onClose={() => setMessaging(null)} />}
    </>
  );
}
