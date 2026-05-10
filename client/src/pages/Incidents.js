import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Search, Filter, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { getIncidents, resolveIncident } from '../utils/api';

const Incidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [resolving, setResolving] = useState(null);
  const navigate = useNavigate();

  const fetchIncidents = async () => {
    try {
      const res = await getIncidents();
      setIncidents(res.data.incidents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, []);

  const handleResolve = async (e, id) => {
    e.stopPropagation();
    setResolving(id);
    try {
      await resolveIncident(id);
      await fetchIncidents();
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(null);
    }
  };

  const filtered = incidents.filter(i => {
    const matchSearch = i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.service_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || i.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12"
    >
      <div className="mb-8">
        <motion.h1
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Incidents
          <span className="ml-3 text-lg text-slate-400 font-normal">
            {filtered.length} total
          </span>
        </motion.h1>
        <p className="text-slate-400">Track and resolve production incidents</p>
      </div>

      {/* Filters */}
      <GlassCard className="mb-6" delay={0.1}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-slate-500 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            {['ALL', 'OPEN', 'INVESTIGATING', 'RESOLVED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: filter === f ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
                  border: filter === f ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color: filter === f ? '#a78bfa' : '#94a3b8',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Incidents List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <GlassCard>
                <div className="text-center py-12 text-slate-500">
                  <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No incidents found</p>
                </div>
              </GlassCard>
            ) : filtered.map((incident, i) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="glass-card p-5 cursor-pointer hover:border-purple-500/30 transition-all duration-200"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0">
                      <AlertTriangle size={16} className={
                        incident.severity === 'CRITICAL' ? 'text-red-400' :
                        incident.severity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium mb-1 truncate">{incident.title}</h3>
                      <p className="text-slate-400 text-sm truncate mb-2">{incident.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-slate-500">
                          🖥 {incident.service_name}
                        </span>
                        <span className="text-xs text-slate-500">
                          🕐 {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                        </span>
                        {incident.ai_root_cause && (
                          <span className="text-xs text-purple-400">✨ AI analyzed</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={incident.severity} />
                    <StatusBadge status={incident.status} pulse />
                    {incident.status !== 'RESOLVED' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={e => handleResolve(e, incident.id)}
                        disabled={resolving === incident.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                        style={{
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10b981',
                        }}
                      >
                        {resolving === incident.id ? '...' : 'Resolve'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default Incidents;