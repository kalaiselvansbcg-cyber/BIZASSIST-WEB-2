/**
 * Supabase Client Configuration & Data Service for NexusAI / BIZASSIST
 * Connected to project: https://imhfqkepsepiscyceoyk.supabase.co
 */
(function () {
  'use strict';

  const SUPABASE_CONFIG = {
    url: 'https://imhfqkepsepiscyceoyk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltaGZxa2Vwc2VwaXNjeWNlb3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMjc3NTgsImV4cCI6MjExMDYwMzc1OH0.TokAyQh5h5qLKEdHdDZwd4_TZsWS1tlBXRR0Kcwg2uo',
    publishableKey: 'sb_publishable_KExpMLbrLN-2vUmub_z-Sg_aMHOVv6x'
  };

  let client = null;

  function initClient() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('[NexusAI] Connected to Supabase:', SUPABASE_CONFIG.url);
      } catch (err) {
        console.warn('[NexusAI] Failed to initialize Supabase client:', err);
      }
    } else {
      console.warn('[NexusAI] Supabase JS SDK not loaded yet. Retrying...');
    }
    return client;
  }

  // Attempt initial client instantiation
  initClient();

  const SupabaseService = {
    config: SUPABASE_CONFIG,

    getClient: function () {
      if (!client) initClient();
      return client;
    },

    isConnected: function () {
      return !!client;
    },

    // Fetch all tickets ordered by creation date descending
    fetchTickets: async function () {
      const sb = this.getClient();
      if (!sb) return { data: null, error: 'Supabase client not initialized' };
      try {
        const { data, error } = await sb
          .from('tickets')
          .select('*')
          .order('id', { ascending: false });
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    },

    // Create a new support ticket
    createTicket: async function (ticket) {
      const sb = this.getClient();
      if (!sb) return { data: null, error: 'Supabase client not initialized' };

      const ticketCode = ticket.ticket_code || ('NX-' + Math.floor(4100 + Math.random() * 900));
      const payload = {
        ticket_code: ticketCode,
        subject: ticket.subject || 'Support Request',
        category: ticket.category || 'General',
        priority: ticket.priority || 'P2',
        status: ticket.status || 'Open',
        customer_name: ticket.customer_name || 'Customer',
        customer_email: ticket.customer_email || 'user@example.com',
        description: ticket.description || '',
        ai_summary: ticket.ai_summary || null,
        ai_intent: ticket.ai_intent || null,
        ai_confidence: ticket.ai_confidence || 98.5,
        sla_minutes: ticket.sla_minutes || 30
      };

      try {
        const { data, error } = await sb
          .from('tickets')
          .insert([payload])
          .select()
          .single();
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    },

    // Update ticket status or fields
    updateTicket: async function (ticketCode, updates) {
      const sb = this.getClient();
      if (!sb) return { data: null, error: 'Supabase client not initialized' };
      try {
        const { data, error } = await sb
          .from('tickets')
          .update(updates)
          .eq('ticket_code', ticketCode)
          .select();
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    },

    // Add message/reply to a ticket
    addTicketMessage: async function (ticketId, messageObj) {
      const sb = this.getClient();
      if (!sb) return { data: null, error: 'Supabase client not initialized' };
      try {
        const { data, error } = await sb
          .from('ticket_messages')
          .insert([{
            ticket_id: ticketId,
            sender_type: messageObj.sender_type || 'agent',
            sender_name: messageObj.sender_name || 'Support Agent',
            message: messageObj.message,
            is_internal: !!messageObj.is_internal
          }])
          .select()
          .single();
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    },

    // Log chat messages in Supabase
    logChatMessage: async function (sessionId, sender, message, citations) {
      const sb = this.getClient();
      if (!sb) return { data: null, error: 'Supabase client not initialized' };
      try {
        const { data, error } = await sb
          .from('chat_messages')
          .insert([{
            session_id: sessionId || 'default-session',
            sender: sender,
            message: message,
            citations: citations || []
          }])
          .select()
          .single();
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    },

    // Fetch knowledge base articles
    fetchArticles: async function () {
      const sb = this.getClient();
      if (!sb) return { data: null, error: 'Supabase client not initialized' };
      try {
        const { data, error } = await sb
          .from('knowledge_articles')
          .select('*')
          .order('id', { ascending: true });
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    },

    // Submit demo request
    submitDemoRequest: async function (req) {
      const sb = this.getClient();
      if (!sb) return { data: null, error: 'Supabase client not initialized' };
      try {
        const { data, error } = await sb
          .from('demo_requests')
          .insert([{
            full_name: req.fullName || req.full_name,
            work_email: req.workEmail || req.work_email,
            company_name: req.companyName || req.company_name,
            team_size: req.teamSize || req.team_size,
            notes: req.notes || ''
          }])
          .select()
          .single();
        return { data, error };
      } catch (e) {
        return { data: null, error: e };
      }
    }
  };

  window.NexusSupabase = SupabaseService;
})();
