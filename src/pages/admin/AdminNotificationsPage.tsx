import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  Send,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import {
  sendAdminNotification,
  fetchAdminAuditLogs
} from '../../services/adminService';

interface AdminNotificationsPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminNotificationsPage: React.FC<AdminNotificationsPageProps> = ({ onRouteChange }) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [category, setCategory] = useState('advisory');
  const [isSending, setIsSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Broadcast history from audit logs
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    const res = await fetchAdminAuditLogs(1, 20);
    // Filter audit logs for notification broadcasts
    const notifLogs = (res.logs || []).filter((l: any) => l.action?.toLowerCase().includes('notif') || l.entity?.toLowerCase().includes('notif'));
    setHistory(notifLogs);
    setIsLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);
    const res = await sendAdminNotification({
      title,
      message,
      target_role: targetRole,
      category
    });
    setIsSending(false);
    if (res.success) {
      showToast((res as any).message || 'Notification broadcast successfully delivered.');
      setTitle('');
      setMessage('');
      loadHistory();
    } else {
      showToast(res.error || 'Failed to send notification broadcast.');
    }
  };

  return (
    <AdminLayout activeItem="notifications" onRouteChange={onRouteChange}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Broadcast Notifications</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Push agricultural advisories, pest alerts, and system notices directly to authenticated farmer accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sender Form Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Compose Broadcast Message</h3>
              <p className="text-xs text-slate-500">Delivered directly to user inboxes and mobile alerts</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Notification Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. High Humidity Advisory: Monitor Tomato Crops for Early Blight"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Audience</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">All Registered Users</option>
                  <option value="farmer">Farmers Only</option>
                  <option value="agronomist">Agronomists & Advisors Only</option>
                  <option value="researcher">Researchers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="advisory">Crop Health Advisory</option>
                  <option value="alert">Severe Weather / Pest Alert</option>
                  <option value="system">System Announcement</option>
                  <option value="tip">Agronomy Tip</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Message Content</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide detailed instructions, prophylactic fungicide recommendations, or operational notices..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.01]"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Send Broadcast Now</span>
              </button>
            </div>
          </form>
        </div>

        {/* Audience Info Sidecard */}
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Targeting Policy</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Broadcasts are routed directly to authenticated user inboxes with push event triggers. Only verified admins can send high-priority farm advisories.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Status:</span>
              <span className="text-emerald-400 font-semibold">Active Dispatcher</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Recent Broadcasts</h4>
            {isLoadingHistory ? (
              <div className="py-8 text-center text-slate-400 text-xs">Loading history...</div>
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No broadcast history recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 4).map((h) => (
                  <div key={h.id} className="text-xs border-b border-slate-100 pb-2.5">
                    <p className="font-bold text-slate-800 truncate">{h.details || h.action}</p>
                    <p className="text-[10.5px] text-slate-400 mt-0.5">
                      {h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-GB') : 'Recently'} • {h.admin_name || 'Admin'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
