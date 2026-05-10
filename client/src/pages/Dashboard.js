import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Server, TrendingUp, Zap, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { getServices, getIncidents, getUptimeStats, triggerIncident } from '../utils/api';

const StatCard = ({ icon: Icon, label, value, color, glow, delay }) => (
  <GlassCard delay={delay} glow={glow}>
    <div className="flex items-center justify-between mb-4">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
  </GlassCard>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 text-xs">
        <p className="text-slate-400 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}ms</p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [services, setServices] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    try {
      const [svcRes, incRes, statsRes] = await Promise.all([
        getServices(),
        getIncidents(),
        getUptimeStats(),
      ]);
      setServices(svcRes.data.services || []);
      setIncidents(incRes.data.incidents || []);
      setStats(statsRes.data.stats || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerIncident = async (serviceId) => {
    setTriggering(serviceId);
    try {
      await triggerIncident(serviceId);
      await fetchData();
    } catch (err) {
      console.error('Failed to trigger incident:', err);
    } finally {
      setTriggering(null);
    }
  };

  const openIncidents = incidents.filter(i => i.status === 'OPEN').length;
  const upServices = services.filter(s => s.currentStatus?.status === 'UP').length;
  const avgUptime = stats.length
    ? (stats.reduce((a, b) => a + parseFloat(b.uptime_percentage || 0), 0) / stats.length).toFixed(1)
    : '—';

  const chartData = stats.slice(0, 7).map(s => ({
    name: s.name?.split(' ')[0],
    responseTime: parseFloat(s.avg_response_time || 0).toFixed(0),
    uptime: parseFloat(s.uptime_percentage || 0).toFixed(1),
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <motion.h1
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-white mb-2"
          >
            Mission Control
            <span className="ml-3 text-2xl" style={{
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>⚡</span>
          </motion.h1>
          <motion.p
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-slate-400"
          >
            Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </motion.p>
        </div>
        <motion.button
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <RefreshCw size={14} />
          Refresh
        </motion.button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Server} label="Total Services" value={services.length} color="#8b5cf6" glow="purple" delay={0.1} />
        <StatCard icon={Activity} label="Services Up" value={upServices} color="#10b981" glow="green" delay={0.2} />
        <StatCard icon={AlertTriangle} label="Open Incidents" value={openIncidents} color="#ef4444" glow="red" delay={0.3} />
        <StatCard icon={TrendingUp} label="Avg Uptime" value={`${avgUptime}%`} color="#06b6d4" glow="cyan" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Response Time Chart */}
        <GlassCard className="lg:col-span-2" delay={0.3}>
          <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
            <Zap size={16} className="text-purple-400" />
            Response Time Overview
          </h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="responseTime" name="Response Time"
                  stroke="#8b5cf6" strokeWidth={2} fill="url(#colorRT)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-slate-500">
              No metrics yet — services will be checked every 30 seconds
            </div>
          )}
        </GlassCard>

        {/* Recent Incidents */}
        <GlassCard delay={0.4}>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400" />
            Recent Incidents
          </h2>
          <div className="space-y-3">
            {incidents.slice(0, 4).length > 0 ? incidents.slice(0, 4).map((incident) => (
              <motion.div
                key={incident.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-xs font-medium truncate flex-1 mr-2">
                    {incident.title}
                  </span>
                  <StatusBadge status={incident.status} pulse />
                </div>
                <p className="text-slate-500 text-xs">
                  {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
                </p>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Activity size={32} className="mx-auto mb-2 opacity-30" />
                All systems operational
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Services Grid */}
      <GlassCard delay={0.5}>
        <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
          <Server size={16} className="text-cyan-400" />
          Monitored Services
          <span className="ml-auto text-xs text-slate-500 font-normal">
            Click "Trigger" to simulate a demo incident
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, i) => {
            const stat = stats.find(s => s.id === service.id);
            const status = service.currentStatus?.status || 'UNKNOWN';
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl flex items-center justify-between gap-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">{service.name}</span>
                    <StatusBadge status={status} pulse />
                  </div>
                  <p className="text-slate-500 text-xs truncate">{service.url}</p>
                  {stat && (
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-400">
                        ⬆ {parseFloat(stat.uptime_percentage || 0).toFixed(1)}% uptime
                      </span>
                      <span className="text-xs text-slate-400">
                        ⚡ {parseFloat(stat.avg_response_time || 0).toFixed(0)}ms avg
                      </span>
                    </div>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTriggerIncident(service.id)}
                  disabled={triggering === service.id}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0"
                  style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444',
                  }}
                >
                  {triggering === service.id ? '...' : '⚡ Trigger'}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Dashboard;