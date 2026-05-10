import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, CheckCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import GlassCard from '../components/GlassCard';
import StatusBadge from '../components/StatusBadge';
import { getIncident, analyzeIncident, resolveIncident } from '../utils/api';

const AIAnalysisPanel = ({ analysis, loading }) => {
  const [displayed, setDisplayed] = useState('');
  const fullText = analysis ? JSON.stringify(analysis, null, 2) : '';

  useEffect(() => {
    if (!fullText) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(fullText.slice(0, i));
      i += 3;
      if (i > fullText.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [fullText]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent"
        />
        <p className="text-slate-400 text-sm">AI is analyzing the incident...</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {[
        { key: 'root_cause', label: '🔍 Root Cause', color: '#ef4444' },
        { key: 'impact', label: '💥 Business Impact', color: '#f59e0b' },
        { key: 'fix_suggestion', label: '🔧 Fix Suggestion', color: '#10b981' },
        { key: 'prevention', label: '🛡 Prevention', color: '#8b5cf6' },
      ].map(({ key, label, color }) => (
        <div key={key} className="p-4 rounded-xl"
          style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
          <p className="text-xs font-semibold mb-2" style={{ color }}>{label}</p>
          <p className="text-slate-300 text-sm leading-relaxed">{analysis[key]}</p>
        </div>
      ))}
    </motion.div>
  );
};

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getIncident(id);
        setIncident(res.data.incident);
        if (res.data.incident.ai_root_cause) {
          setAnalysis({
            root_cause: res.data.incident.ai_root_cause,
            impact: res.data.incident.ai_analysis,
            fix_suggestion: res.data.incident.ai_fix_suggestion,
            prevention: 'Implement health checks and circuit breaker patterns',
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeIncident(id);
      setAnalysis(res.data.analysis);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResolve = async () => {
    setResolving(true);
    try {
      const res = await resolveIncident(id);
      setIncident(res.data.incident);
    } catch (err) {
      console.error(err);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 rounded-full border-2 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!incident) return (
    <div className="min-h-screen flex items-center justify-center text-slate-400">
      Incident not found
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-12"
    >
      {/* Back button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ x: -4 }}
        onClick={() => navigate('/incidents')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Incidents
      </motion.button>

      {/* Incident Header */}
      <GlassCard className="mb-6" delay={0.1}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
              <h1 className="text-2xl font-bold text-white">{incident.title}</h1>
            </div>
            <p className="text-slate-400 mb-4">{incident.description}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <StatusBadge status={incident.status} pulse />
              <StatusBadge status={incident.severity} />
              <span className="text-slate-500 text-sm flex items-center gap-1">
                <Clock size={12} />
                {formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}
              </span>
              <span className="text-slate-500 text-sm">🖥 {incident.service_name}</span>
            </div>
          </div>
          {incident.status !== 'RESOLVED' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResolve}
              disabled={resolving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium flex-shrink-0"
              style={{
                background: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981',
              }}
            >
              <CheckCircle size={14} />
              {resolving ? 'Resolving...' : 'Mark Resolved'}
            </motion.button>
          )}
        </div>
      </GlassCard>

      {/* AI Analysis */}
      <GlassCard delay={0.2} glow="purple">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Brain size={18} className="text-purple-400" />
            AI Root Cause Analysis
            <span className="text-xs text-purple-400 font-normal ml-1">powered by Groq LLM</span>
          </h2>
          {!analysis && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
                border: '1px solid rgba(139,92,246,0.4)',
                color: '#a78bfa',
              }}
            >
              <Zap size={14} />
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </motion.button>
          )}
        </div>
        {!analysis && !analyzing && (
          <div className="text-center py-10 text-slate-500">
            <Brain size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Click "Analyze with AI" to get instant root cause analysis</p>
            <p className="text-xs mt-1 text-slate-600">Powered by Groq Llama 3</p>
          </div>
        )}
        <AIAnalysisPanel analysis={analysis} loading={analyzing} />
      </GlassCard>
    </motion.div>
  );
};

export default IncidentDetail;