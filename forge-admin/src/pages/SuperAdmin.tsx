import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Share2,
  Trash2,
  X,
} from 'lucide-react';
import { ForgeMark } from '@/components/forge/DemoBar';
import { request, ApiError } from '@/lib/api';

const KEY_STORE = 'forge.admin.key';

interface GymItem {
  id: string;
  name: string;
  package: 'essential' | 'growth' | 'performance';
  addons: Record<string, boolean>;
  createdAt: string;
  lastUsedAt?: string;
  memberCount: number;
  owner: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    active: boolean;
    hasPassword: boolean;
  } | null;
}

export default function SuperAdmin() {
  const [adminKey, setAdminKey] = useState<string>(() => localStorage.getItem(KEY_STORE) || '');
  const [keyInput, setKeyInput] = useState('');
  const [gyms, setGyms] = useState<GymItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGym, setEditingGym] = useState<GymItem | null>(null);
  const [deletingGym, setDeletingGym] = useState<GymItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [editBusy, setEditBusy] = useState(false);

  // Invite link dialog
  const [createdInvite, setCreatedInvite] = useState<{
    gymName: string;
    ownerPhone: string;
    url: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Create Form inputs
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [pkg, setPkg] = useState<'growth' | 'performance' | 'essential'>('growth');
  const [addons, setAddons] = useState({
    whatsapp: false,
    upiLinks: false,
    autopay: false,
    trainerPlus: false,
  });

  // Edit Form inputs
  const [editName, setEditName] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editPkg, setEditPkg] = useState<'growth' | 'performance' | 'essential'>('growth');
  const [editAddons, setEditAddons] = useState({
    whatsapp: false,
    upiLinks: false,
    autopay: false,
    trainerPlus: false,
  });

  const saasUrl = import.meta.env.VITE_SAAS_URL || 'http://localhost:5174';

  const fetchGyms = async (key: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await request<{ gyms: GymItem[] }>('/admin/gyms', {
        headers: { 'x-admin-key': key },
      });
      setGyms(res.gyms || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('The admin master key is incorrect.');
        localStorage.removeItem(KEY_STORE);
        setAdminKey('');
      } else {
        setError('Could not reach the server or verify admin permissions.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminKey) {
      fetchGyms(adminKey);
    }
  }, [adminKey]);

  const onKeySubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    localStorage.setItem(KEY_STORE, keyInput.trim());
    setAdminKey(keyInput.trim());
    setKeyInput('');
  };

  const onLock = () => {
    localStorage.removeItem(KEY_STORE);
    setAdminKey('');
    setGyms([]);
  };

  // Open Edit Modal
  const openEditModal = (gym: GymItem) => {
    setEditingGym(gym);
    setEditName(gym.name);
    setEditOwnerName(gym.owner?.name || '');
    setEditOwnerPhone(gym.owner?.phone || '');
    setEditOwnerEmail(gym.owner?.email || '');
    setEditPkg(gym.package);
    setEditAddons({
      whatsapp: !!gym.addons?.whatsapp,
      upiLinks: !!gym.addons?.upiLinks,
      autopay: !!gym.addons?.autopay,
      trainerPlus: !!gym.addons?.trainerPlus,
    });
  };

  // Create New Gym
  const handleCreateGym = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await request<{
        gym: { id: string; name: string };
        owner: { id: string; name: string; phone?: string };
        inviteToken: string;
      }>('/admin/gyms', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: {
          name: gymName,
          ownerName,
          phone: ownerPhone,
          email: ownerEmail || undefined,
          package: pkg,
          addons,
        },
      });

      const inviteUrl = `${saasUrl}/activate?token=${encodeURIComponent(res.inviteToken)}`;
      setCreatedInvite({
        gymName: res.gym.name,
        ownerPhone: res.owner.phone || ownerPhone,
        url: inviteUrl,
      });

      // Reset form
      setGymName('');
      setOwnerName('');
      setOwnerPhone('');
      setOwnerEmail('');
      setShowCreateModal(false);

      // Refresh list
      fetchGyms(adminKey);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to create gym account.');
    }
  };

  // Save Gym Updates (Edit)
  const handleUpdateGym = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingGym) return;
    setEditBusy(true);
    try {
      await request(`/admin/gyms/${editingGym.id}`, {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey },
        body: {
          name: editName,
          package: editPkg,
          addons: editAddons,
          ownerName: editOwnerName,
          ownerPhone: editOwnerPhone,
          ownerEmail: editOwnerEmail || undefined,
        },
      });
      setEditingGym(null);
      fetchGyms(adminKey);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not update gym.');
    } finally {
      setEditBusy(false);
    }
  };

  // Confirm and Delete Gym
  const confirmDeleteGym = async () => {
    if (!deletingGym) return;
    setDeleteBusy(true);
    try {
      await request(`/admin/gyms/${deletingGym.id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      });
      setDeletingGym(null);
      fetchGyms(adminKey);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Could not delete gym.');
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleGenerateInvite = async (gymId: string, phone: string, name: string) => {
    try {
      const res = await request<{ inviteToken: string }>('/admin/gyms/' + gymId + '/invite', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
      });
      const inviteUrl = `${saasUrl}/activate?token=${encodeURIComponent(res.inviteToken)}`;
      setCreatedInvite({
        gymName: name,
        ownerPhone: phone,
        url: inviteUrl,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not generate invite link.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If locked, show Master Key entry
  if (!adminKey) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-ink px-4 py-12">
        <div className="w-full max-w-md border border-line bg-ink-2 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <ForgeMark className="mx-auto text-3xl" />
            <h1 className="mt-4 font-display text-2xl uppercase tracking-wider text-bone">
              Super Admin Console
            </h1>
            <p className="mt-1 font-mono text-xs text-mute">
              Protected screen. Enter your secret admin master key.
            </p>
          </div>

          {error && (
            <div className="mb-5 border border-red/40 bg-red-dim/40 px-3.5 py-2.5 font-mono text-xs text-red">
              {error}
            </div>
          )}

          <form onSubmit={onKeySubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-wider text-bone-dim">
                Admin Master Key
              </label>
              <input
                type="password"
                required
                placeholder="Enter ADMIN_KEY"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="mt-1.5 w-full border border-line bg-ink px-3.5 py-2.5 font-mono text-sm text-bone transition-colors focus:border-red focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-mute">
                Configured on your backend server under <code className="text-bone-dim">ADMIN_KEY</code>
              </p>
            </div>
            <button
              type="submit"
              className="w-full bg-bone py-3 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-red hover:text-bone"
            >
              Unlock Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  const growthCount = gyms.filter((g) => g.package === 'growth').length;
  const perfCount = gyms.filter((g) => g.package === 'performance').length;
  const totalMembers = gyms.reduce((acc, g) => acc + (g.memberCount || 0), 0);

  return (
    <div className="min-h-svh bg-ink text-bone">
      {/* Top Bar */}
      <header className="border-b border-line bg-ink-2">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <ForgeMark className="text-2xl" />
            <span className="border-l border-line pl-3 font-mono text-[11px] uppercase tracking-[0.2em] text-red">
              Super Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchGyms(adminKey)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-mute hover:text-bone"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={onLock}
              className="inline-flex items-center gap-1.5 border border-line px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-mute hover:border-red hover:text-red"
            >
              <Lock size={12} />
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-[1440px] px-5 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border border-line bg-ink-2 p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-mute">Active Gyms</p>
            <p className="mt-2 font-display text-4xl text-bone">{gyms.length}</p>
          </div>
          <div className="border border-line bg-ink-2 p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-mute">Growth Tiers</p>
            <p className="mt-2 font-display text-4xl text-ok">{growthCount}</p>
          </div>
          <div className="border border-line bg-ink-2 p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-mute">Performance Tiers</p>
            <p className="mt-2 font-display text-4xl text-warn">{perfCount}</p>
          </div>
          <div className="border border-line bg-ink-2 p-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-mute">Total Athletes / Members</p>
            <p className="mt-2 font-display text-4xl text-bone">{totalMembers}</p>
          </div>
        </div>

        {/* Section Header */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="font-display text-2xl uppercase tracking-wider text-bone">
              Gym Accounts Directory
            </h2>
            <p className="font-mono text-xs text-mute">
              Onboard new gym owners, generate invite links, edit details, and manage package tiers
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-bone px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-ink transition-colors hover:bg-red hover:text-bone"
          >
            <Plus size={14} />
            Onboard New Gym
          </button>
        </div>

        {error && (
          <div className="mt-4 border border-red/40 bg-red-dim/40 px-4 py-3 font-mono text-xs text-red">
            {error}
          </div>
        )}

        {/* Gyms Table */}
        <div className="mt-6 overflow-x-auto border border-line bg-ink-2">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-line bg-ink text-[11px] uppercase tracking-wider text-mute">
                <th className="px-5 py-3.5">Gym Name</th>
                <th className="px-5 py-3.5">Package</th>
                <th className="px-5 py-3.5">Owner Contact</th>
                <th className="px-5 py-3.5">Members</th>
                <th className="px-5 py-3.5">Add-ons</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {gyms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-mute">
                    No client gyms onboarded yet. Click "Onboard New Gym" to generate your first client link.
                  </td>
                </tr>
              ) : (
                gyms.map((gym) => (
                  <tr key={gym.id} className="transition-colors hover:bg-graphite/40">
                    <td className="px-5 py-4">
                      <p className="font-heavy text-sm text-bone">{gym.name}</p>
                      <p className="mt-0.5 text-[10px] text-mute">ID: {gym.id.slice(-6)} · {new Date(gym.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block border px-2.5 py-1 text-[10px] uppercase tracking-wider ${
                          gym.package === 'performance'
                            ? 'border-warn/40 bg-warn/10 text-warn'
                            : gym.package === 'growth'
                              ? 'border-ok/40 bg-ok/10 text-ok'
                              : 'border-line text-mute'
                        }`}
                      >
                        {gym.package}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-bone">{gym.owner?.name || 'No Owner'}</p>
                      <p className="text-mute">{gym.owner?.phone || gym.owner?.email || '-'}</p>
                    </td>
                    <td className="px-5 py-4 text-bone font-heavy">{gym.memberCount}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {gym.addons?.whatsapp && (
                          <span className="border border-line px-1.5 py-0.5 text-[9px] text-bone-dim">WA</span>
                        )}
                        {gym.addons?.upiLinks && (
                          <span className="border border-line px-1.5 py-0.5 text-[9px] text-bone-dim">UPI</span>
                        )}
                        {gym.addons?.autopay && (
                          <span className="border border-line px-1.5 py-0.5 text-[9px] text-bone-dim">Autopay</span>
                        )}
                        {gym.addons?.trainerPlus && (
                          <span className="border border-line px-1.5 py-0.5 text-[9px] text-bone-dim">Trainer+</span>
                        )}
                        {!gym.addons?.whatsapp && !gym.addons?.upiLinks && !gym.addons?.autopay && !gym.addons?.trainerPlus && (
                          <span className="text-[10px] text-mute">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleGenerateInvite(gym.id, gym.owner?.phone || '', gym.name)
                          }
                          title="Generate WhatsApp Invite Link"
                          className="border border-line px-2.5 py-1.5 text-mute hover:border-bone hover:text-bone transition-colors"
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          onClick={() => openEditModal(gym)}
                          title="Edit Gym & Package"
                          className="border border-line px-2.5 py-1.5 text-mute hover:border-bone hover:text-bone transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingGym(gym)}
                          title="Remove Gym"
                          className="border border-line px-2.5 py-1.5 text-mute hover:border-red hover:text-red transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Onboard New Gym Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-line bg-ink-2 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-2xl uppercase tracking-wider text-bone">
                Onboard New Gym Client
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-mute hover:text-bone">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 font-mono text-xs text-mute">
              Enter the gym details to generate an instant WhatsApp activation link.
            </p>

            <form onSubmit={handleCreateGym} className="mt-6 space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase tracking-wider text-bone-dim">Gym Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FitZone Elite Fitness"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-bone-dim">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-bone-dim">Owner Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-bone-dim">Owner Email (Optional)</label>
                <input
                  type="email"
                  placeholder="owner@fitzone.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-bone-dim">Package Tier *</label>
                <select
                  value={pkg}
                  onChange={(e) => setPkg(e.target.value as any)}
                  className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                >
                  <option value="growth">Growth — Run Your Gym (₹2,499/mo)</option>
                  <option value="performance">Performance — Coach & Retain (₹4,499/mo)</option>
                  <option value="essential">Essential — Get Found Online (₹999/mo)</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-bone-dim mb-2">Enable Add-ons</label>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-mute">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.whatsapp}
                      onChange={(e) => setAddons((a) => ({ ...a, whatsapp: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>WhatsApp Alerts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.upiLinks}
                      onChange={(e) => setAddons((a) => ({ ...a, upiLinks: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>UPI Payment Links</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.autopay}
                      onChange={(e) => setAddons((a) => ({ ...a, autopay: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>UPI Autopay</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.trainerPlus}
                      onChange={(e) => setAddons((a) => ({ ...a, trainerPlus: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>Trainer Plus</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="border border-line px-4 py-2 uppercase tracking-wider text-mute hover:text-bone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-bone px-5 py-2 uppercase tracking-wider text-ink hover:bg-red hover:text-bone transition-colors"
                >
                  Create & Generate Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Gym Modal */}
      {editingGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-line bg-ink-2 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-display text-2xl uppercase tracking-wider text-bone">
                Edit Gym: {editingGym.name}
              </h3>
              <button onClick={() => setEditingGym(null)} className="text-mute hover:text-bone">
                <X size={18} />
              </button>
            </div>
            <p className="mt-2 font-mono text-xs text-mute">
              Update gym name, package plan, owner details, or enabled add-ons.
            </p>

            <form onSubmit={handleUpdateGym} className="mt-6 space-y-4 font-mono text-xs">
              <div>
                <label className="block uppercase tracking-wider text-bone-dim">Gym Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider text-bone-dim">Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-bone-dim">Owner Phone *</label>
                  <input
                    type="tel"
                    required
                    value={editOwnerPhone}
                    onChange={(e) => setEditOwnerPhone(e.target.value)}
                    className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-bone-dim">Owner Email</label>
                <input
                  type="email"
                  value={editOwnerEmail}
                  onChange={(e) => setEditOwnerEmail(e.target.value)}
                  className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-bone-dim">Package Tier *</label>
                <select
                  value={editPkg}
                  onChange={(e) => setEditPkg(e.target.value as any)}
                  className="mt-1 w-full border border-line bg-ink px-3 py-2 text-bone focus:border-red focus:outline-none"
                >
                  <option value="growth">Growth — Run Your Gym (₹2,499/mo)</option>
                  <option value="performance">Performance — Coach & Retain (₹4,499/mo)</option>
                  <option value="essential">Essential — Get Found Online (₹999/mo)</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider text-bone-dim mb-2">Enable Add-ons</label>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-mute">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAddons.whatsapp}
                      onChange={(e) => setEditAddons((a) => ({ ...a, whatsapp: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>WhatsApp Alerts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAddons.upiLinks}
                      onChange={(e) => setEditAddons((a) => ({ ...a, upiLinks: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>UPI Payment Links</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAddons.autopay}
                      onChange={(e) => setEditAddons((a) => ({ ...a, autopay: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>UPI Autopay</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editAddons.trainerPlus}
                      onChange={(e) => setEditAddons((a) => ({ ...a, trainerPlus: e.target.checked }))}
                      className="accent-red"
                    />
                    <span>Trainer Plus</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-line">
                <button
                  type="button"
                  onClick={() => setEditingGym(null)}
                  className="border border-line px-4 py-2 uppercase tracking-wider text-mute hover:text-bone"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editBusy}
                  className="bg-bone px-5 py-2 uppercase tracking-wider text-ink hover:bg-red hover:text-bone transition-colors disabled:opacity-50"
                >
                  {editBusy ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGym && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-red/40 bg-ink-2 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red">
              <AlertTriangle size={24} />
              <h3 className="font-display text-2xl uppercase tracking-wider text-bone">
                Confirm Deletion
              </h3>
            </div>

            <p className="mt-3 font-mono text-xs text-bone-dim leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-red font-heavy">{deletingGym.name}</strong>?
            </p>
            <p className="mt-2 font-mono text-[11px] text-mute">
              This will completely remove the gym, owner login, members, check-ins, payment logs, and plans. This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3 border-t border-line pt-4 font-mono text-xs">
              <button
                type="button"
                onClick={() => setDeletingGym(null)}
                className="border border-line px-4 py-2 uppercase tracking-wider text-mute hover:text-bone"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteBusy}
                onClick={confirmDeleteGym}
                className="bg-red px-5 py-2 uppercase tracking-wider text-white hover:bg-red-dim transition-colors disabled:opacity-50"
              >
                {deleteBusy ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Invite Modal */}
      {createdInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg border border-line bg-ink-2 p-6 shadow-2xl">
            <h3 className="font-display text-2xl uppercase tracking-wider text-ok">
              Activation Link Ready!
            </h3>
            <p className="mt-1 font-mono text-xs text-mute">
              Send this link to <strong className="text-bone">{createdInvite.gymName}</strong> owner on WhatsApp.
            </p>

            <div className="mt-4 border border-line bg-ink p-3 font-mono text-xs text-bone break-all">
              {createdInvite.url}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => copyToClipboard(createdInvite.url)}
                className="inline-flex items-center gap-1.5 bg-bone px-4 py-2 font-mono text-xs uppercase tracking-wider text-ink hover:bg-red hover:text-bone transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Link'}
              </button>

              <a
                href={`https://wa.me/91${createdInvite.ownerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `Hi! Here is your private activation link for ${createdInvite.gymName}'s FORGE gym management software:\n\n${createdInvite.url}\n\nTap the link to set your password and access your dashboard on your mobile or laptop.`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 border border-ok/60 bg-ok/10 px-4 py-2 font-mono text-xs uppercase tracking-wider text-ok hover:bg-ok hover:text-ink transition-colors"
              >
                <Share2 size={14} />
                Send via WhatsApp
              </a>

              <button
                onClick={() => setCreatedInvite(null)}
                className="ml-auto border border-line px-4 py-2 font-mono text-xs uppercase tracking-wider text-mute hover:text-bone"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
