import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  ShieldAlert,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import {
  fetchAdminDiseases,
  saveAdminDisease,
  updateAdminDisease,
  deleteAdminDisease
} from '../../services/adminService';

interface AdminDiseasesPageProps {
  onRouteChange?: (route: string) => void;
}

export const AdminDiseasesPage: React.FC<AdminDiseasesPageProps> = ({ onRouteChange }) => {
  const [diseases, setDiseases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDisease, setEditingDisease] = useState<any | null>(null);
  const [deletingDisease, setDeletingDisease] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    crop_name: 'Tomato',
    scientific_name: '',
    disease_type: 'Fungal',
    severity: 'Moderate',
    symptoms: '',
    treatment: '',
    prevention: '',
    image: '',
    description: ''
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadDiseases = async () => {
    setIsLoading(true);
    const data = await fetchAdminDiseases();
    setDiseases(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadDiseases();
  }, []);

  const handleAddDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setIsSubmitting(true);
    const res = await saveAdminDisease(formData);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Disease entry registered in library.');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        crop_name: 'Tomato',
        scientific_name: '',
        disease_type: 'Fungal',
        severity: 'Moderate',
        symptoms: '',
        treatment: '',
        prevention: '',
        image: '',
        description: ''
      });
      loadDiseases();
    } else {
      showToast(res.error || 'Failed to save disease.');
    }
  };

  const handleUpdateDisease = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDisease) return;
    setIsSubmitting(true);
    const res = await updateAdminDisease(editingDisease.id, formData);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Disease diagnosis entry updated.');
      setEditingDisease(null);
      loadDiseases();
    } else {
      showToast(res.error || 'Failed to update disease.');
    }
  };

  const handleDeleteDisease = async () => {
    if (!deletingDisease) return;
    setIsSubmitting(true);
    const res = await deleteAdminDisease(deletingDisease.id);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Disease removed from library.');
      setDeletingDisease(null);
      loadDiseases();
    } else {
      showToast(res.error || 'Failed to delete disease.');
    }
  };

  const openEditModal = (dis: any) => {
    setEditingDisease(dis);
    setFormData({
      name: dis.name || '',
      crop_name: dis.crop_name || 'Tomato',
      scientific_name: dis.scientific_name || '',
      disease_type: dis.disease_type || 'Fungal',
      severity: dis.severity || 'Moderate',
      symptoms: Array.isArray(dis.symptoms) ? dis.symptoms.join('\n') : dis.symptoms || '',
      treatment: Array.isArray(dis.treatment) ? dis.treatment.join('\n') : dis.treatment || '',
      prevention: Array.isArray(dis.prevention) ? dis.prevention.join('\n') : dis.prevention || '',
      image: dis.image || '',
      description: dis.description || ''
    });
  };

  const parseSymptoms = (sym: any): string => {
    if (!sym) return 'Visual symptoms documented in profile.';
    if (Array.isArray(sym)) return sym.join(', ');
    if (typeof sym === 'string') {
      try {
        const parsed = JSON.parse(sym);
        if (Array.isArray(parsed)) return parsed.join(', ');
      } catch {
        return sym;
      }
      return sym;
    }
    return String(sym);
  };

  const parseTreatment = (treat: any): string => {
    if (!treat) return 'Standard fungicide / treatment protocol.';
    if (Array.isArray(treat)) return treat.join(', ');
    if (typeof treat === 'string') {
      try {
        const parsed = JSON.parse(treat);
        if (Array.isArray(parsed)) return parsed.join(', ');
      } catch {
        return treat;
      }
      return treat;
    }
    return String(treat);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'severe':
      case 'high':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">High Risk</span>;
      case 'moderate':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Moderate</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Mild</span>;
    }
  };

  const filteredDiseases = diseases.filter((dis) => {
    const matchesSearch =
      dis.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dis.crop_name && dis.crop_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dis.scientific_name && dis.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSeverity =
      severityFilter === 'All' || dis.severity?.toLowerCase() === severityFilter.toLowerCase();
    const matchesType =
      typeFilter === 'All' || dis.disease_type?.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesSeverity && matchesType;
  });

  return (
    <AdminLayout activeItem="diseases" onRouteChange={onRouteChange}>
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMsg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Disease Library</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pathogen reference database, symptom diagnostics, chemical/organic treatments, and prevention protocols.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormData({
              name: '',
              crop_name: 'Tomato',
              scientific_name: '',
              disease_type: 'Fungal',
              severity: 'Moderate',
              symptoms: '',
              treatment: '',
              prevention: '',
              image: '',
              description: ''
            });
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Disease</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search disease name, affected crop, pathogen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Severities</option>
            <option value="Severe">High / Severe</option>
            <option value="Moderate">Moderate</option>
            <option value="Mild">Mild</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-1">
            <span>Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Pathogen Types</option>
            <option value="Fungal">Fungal</option>
            <option value="Bacterial">Bacterial</option>
            <option value="Viral">Viral</option>
            <option value="Pest">Pest Infestation</option>
            <option value="Deficiency">Nutrient Deficiency</option>
          </select>
        </div>
      </div>

      {/* Diseases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-xs font-semibold">Loading disease library entries...</p>
          </div>
        ) : filteredDiseases.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No diseases found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || severityFilter !== 'All' || typeFilter !== 'All'
                ? 'No diseases match your search criteria. Try clearing filters.'
                : 'No disease records exist in the database yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Disease</th>
                  <th className="py-3 px-4">Crop</th>
                  <th className="py-3 px-4">Pathogen Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Symptoms</th>
                  <th className="py-3 px-4">Treatment</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredDiseases.map((dis) => (
                  <tr key={dis.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={dis.image_url || dis.image || 'https://images.unsplash.com/photo-1592417817098-8f3d69102353?w=100&auto=format&fit=crop&q=80'}
                          alt={dis.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1592417817098-8f3d69102353?w=100&auto=format&fit=crop&q=80';
                          }}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{dis.name}</p>
                          <p className="text-[11px] text-slate-500 italic mt-0.5">{dis.scientific_name || 'Unclassified'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {dis.crop_name || 'General'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                        {dis.disease_type || 'Fungal'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{getSeverityBadge(dis.severity)}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <p className="truncate text-[11.5px]">
                        {parseSymptoms(dis.symptoms)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <p className="truncate text-[11.5px]">
                        {parseTreatment(dis.treatment)}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(dis)}
                          title="Edit Disease"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingDisease(dis)}
                          title="Delete Disease"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
          Showing <span className="font-bold text-slate-700">{filteredDiseases.length}</span> pathogen records
        </div>
      </div>

      {/* Add Disease Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Disease to Library</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddDisease} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Disease Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Early Blight"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Affected Crop</label>
                  <input
                    type="text"
                    required
                    value={formData.crop_name}
                    onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                    placeholder="e.g. Tomato"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pathogen Type</label>
                  <select
                    value={formData.disease_type}
                    onChange={(e) => setFormData({ ...formData, disease_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Fungal">Fungal</option>
                    <option value="Bacterial">Bacterial</option>
                    <option value="Viral">Viral</option>
                    <option value="Pest">Pest Infestation</option>
                    <option value="Deficiency">Nutrient Deficiency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scientific Name / Pathogen</label>
                <input
                  type="text"
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  placeholder="e.g. Alternaria solani"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms (one per line)</label>
                <textarea
                  rows={2}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Dark brown spots with concentric rings&#10;Yellowing around leaf edges"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Protocol (one per line)</label>
                <textarea
                  rows={2}
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="Apply copper fungicide at 7-10 day intervals&#10;Remove and prune infected lower foliage"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Disease</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Disease Modal */}
      {editingDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Edit Disease</h3>
              <button onClick={() => setEditingDisease(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateDisease} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Disease Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Affected Crop</label>
                  <input
                    type="text"
                    required
                    value={formData.crop_name}
                    onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pathogen Type</label>
                  <select
                    value={formData.disease_type}
                    onChange={(e) => setFormData({ ...formData, disease_type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Fungal">Fungal</option>
                    <option value="Bacterial">Bacterial</option>
                    <option value="Viral">Viral</option>
                    <option value="Pest">Pest Infestation</option>
                    <option value="Deficiency">Nutrient Deficiency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Severity Level</label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Scientific Name / Pathogen</label>
                <input
                  type="text"
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Symptoms</label>
                <textarea
                  rows={2}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Protocol</label>
                <textarea
                  rows={2}
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDisease(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Delete Disease Record?</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              Are you sure you want to remove <span className="font-bold text-slate-700">{deletingDisease.name}</span> from the disease library?
            </p>
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingDisease(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleDeleteDisease}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
