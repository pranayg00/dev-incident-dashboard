import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Plus, Trash2, Zap, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { getServices, addService, deleteService, triggerIncident } from '../utils/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [triggering, setTriggering] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data.services || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addService(form);
      setForm({ name: '', url: '', description: '' });
      setShowForm(false);
      await fetchServices();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      await fetchServices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrigger = async (id) => {
    setTriggering(id);
    try {
      await triggerIncident(id);
      await fetchServices();
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Services
          </motion.h1>
          <p className="text-slate-400">Manage and monitor your services</p>
        </div>
        <motion.button
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
            border: '1px solid rgba(139,92,246,0.4)',
            color: '#a78bfa',
          }}
        >
          <Plus size={14} />
          Add Service
        </motion.button>
      </div>

      {/* Add Service Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <GlassCard glow="purple">
              <h3 className="text-white font-semibold mb-4">Add New Service</h3>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'name', placeholder: 'Service Name (e.g. Payment API)' },
                  { key: 'url', placeholder: 'URL (e.g. https://api.example.com/health)' },
                  { key: 'description', placeholder: 'Description (optional)' },
                ].map(({ key, placeholder }) => (
                  <input
                    key={key}
                    type="text"
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    required={key !== 'description'}
                    className="px-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  />
                ))}
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                >
                  {submitting ? 'Adding...' : 'Add Service'}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {services.map((service, i) => {
              const status = service.currentStatus?.status || 'UNKNOWN';
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                        <Server size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{service.name}</h3>
                        {service.is_demo && (
                          <span className="text-xs text-cyan-400">Demo service</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={status} pulse />
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={12} className="text-slate-500" />
                    <span className="text-slate-400 text-xs truncate">{service.url}</span>
                  </div>

                  {service.description && (
                    <p className="text-slate-500 text-xs mb-4">{service.description}</p>
                  )}

                  {service.currentStatus?.responseTime && (
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-xs text-slate-400">
                        ⚡ {service.currentStatus.responseTime}ms
                      </span>
                      <span className="text-xs text-slate-500">
                        Last checked {formatDistanceToNow(
                          new Date(service.currentStatus.checkedAt || Date.now()),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleTrigger(service.id)}
                      disabled={triggering === service.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium"
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444',
                      }}
                    >
                      <Zap size={12} />
                      {triggering === service.id ? 'Triggering...' : 'Trigger Incident'}
                    </motion.button>
                    {!service.is_demo && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(service.id)}
                        className="p-2 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#64748b',
                        }}
                      >
                        <Trash2 size={14} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Services;