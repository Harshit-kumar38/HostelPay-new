// HostelPay Supabase Store
// All localStorage has been replaced with Supabase (PostgreSQL) queries

import { supabase } from './supabaseClient';

const genRoomCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// ===== AUTH =====
export const authStore = {
  // Kept for legacy compatibility — not used with Supabase
};

// ===== USERS / PROFILES =====
export const userStore = {
  getById: async (id) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    return data;
  },
  update: async (id, updates) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
  },
};

// ===== GROUPS =====
export const groupStore = {
  getUserGroups: async (userId) => {
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    if (!memberships?.length) return [];

    const groupIds = memberships.map(m => m.group_id);
    const { data: groups } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds);
    return groups || [];
  },

  getById: async (id) => {
    const { data } = await supabase.from('groups').select('*').eq('id', id).single();
    return data;
  },

  create: async (name, createdBy) => {
    const room_code = genRoomCode();
    const { data, error } = await supabase
      .from('groups')
      .insert({ name, room_code, created_by: createdBy })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Auto-add creator as member
    await supabase.from('group_members').insert({ group_id: data.id, user_id: createdBy });
    return data;
  },

  join: async (roomCode, userId) => {
    const { data: group, error } = await supabase
      .from('groups')
      .select('*')
      .eq('room_code', roomCode.toUpperCase())
      .single();
    if (error || !group) throw new Error('Room not found. Check the code and try again.');

    // Check already member
    const { data: existing } = await supabase
      .from('group_members')
      .select('*')
      .eq('group_id', group.id)
      .eq('user_id', userId)
      .single();
    if (existing) throw new Error('You are already a member of this group.');

    await supabase.from('group_members').insert({ group_id: group.id, user_id: userId });
    return group;
  },

  delete: async (groupId) => {
    await supabase.from('groups').delete().eq('id', groupId);
  },
};

// ===== GROUP MEMBERS =====
export const memberStore = {
  getGroupMembers: async (groupId) => {
    const { data: members } = await supabase
      .from('group_members')
      .select('*, user:profiles(*)')
      .eq('group_id', groupId);
    return (members || []).map(m => ({
      group_id: m.group_id,
      user_id: m.user_id,
      user: m.user,
    }));
  },

  removeMember: async (groupId, userId) => {
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
  },
};

// ===== EXPENSES =====
export const expenseStore = {
  getGroupExpenses: async (groupId) => {
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*, payer:profiles!paid_by(*), splits:expense_splits(*, user:profiles(*))')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    return expenses || [];
  },

  add: async (groupId, paidBy, amount, description, memberIds) => {
    const { data: expense, error } = await supabase
      .from('expenses')
      .insert({ group_id: groupId, paid_by: paidBy, amount, description })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const share = parseFloat((amount / memberIds.length).toFixed(2));
    const splits = memberIds.map(uid => ({
      expense_id: expense.id,
      user_id: uid,
      share_amount: share,
    }));
    await supabase.from('expense_splits').insert(splits);
    return expense;
  },

  update: async (expId, updates) => {
    const { error } = await supabase.from('expenses').update(updates).eq('id', expId);
    if (error) throw new Error(error.message);
  },

  delete: async (expId) => {
    await supabase.from('expenses').delete().eq('id', expId);
  },

  getRecentAll: async (userId, limit = 8) => {
    // Get user's group ids
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    if (!memberships?.length) return [];

    const groupIds = memberships.map(m => m.group_id);
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*, payer:profiles!paid_by(*), group:groups(*)')
      .in('group_id', groupIds)
      .order('created_at', { ascending: false })
      .limit(limit);
    return expenses || [];
  },
};

// ===== BALANCE CALCULATIONS (done client-side from fetched data) =====
export const balanceStore = {
  getGroupBalances: async (groupId, currentUserId) => {
    const expenses = await expenseStore.getGroupExpenses(groupId);
    const balances = {};

    expenses.forEach(exp => {
      (exp.splits || []).forEach(split => {
        if (split.user_id === exp.paid_by) return;
        if (!balances[split.user_id]) balances[split.user_id] = { net: 0, user: split.user };
        if (!balances[exp.paid_by]) balances[exp.paid_by] = { net: 0, user: exp.payer };
        balances[split.user_id].net -= split.share_amount;
        balances[exp.paid_by].net += split.share_amount;
      });
    });

    return Object.entries(balances).map(([uid, val]) => ({
      user: val.user,
      net: parseFloat(val.net.toFixed(2)),
    }));
  },

  getGroupNetForUser: async (groupId, userId) => {
    const balances = await balanceStore.getGroupBalances(groupId, userId);
    const userBal = balances.find(b => b.user?.id === userId);
    return userBal?.net || 0;
  },

  getPersonalBalances: async (userId) => {
    // Fetch records where user is sender OR receiver (to_user can be null for external contacts)
    const { data: allRecords } = await supabase
      .from('personal_records')
      .select('*, fromUser:profiles!from_user(*)')
      .eq('status', 'pending');

    // Filter client-side since to_user can be null
    const records = (allRecords || []).filter(
      r => r.from_user === userId || r.to_user === userId
    );

    if (!records.length) return [];

    const contactMap = {};
    const contactLastActivity = {};
    const contactUsers = {};

    records.forEach(r => {
      let contactId, net;
      if (r.from_user === userId) {
        // Use 'name:ContactName' as stable key for external contacts (to_user is null)
        contactId = r.to_user || `name:${r.to_name}`;
        net = r.type === 'lend' ? r.amount : -r.amount;
        if (!contactUsers[contactId]) {
          contactUsers[contactId] = {
            id: contactId,
            name: r.to_name,
            avatar: r.to_name?.[0]?.toUpperCase() || '?',
          };
        }
      } else {
        contactId = r.from_user;
        net = r.type === 'lend' ? -r.amount : r.amount;
        if (!contactUsers[contactId]) {
          contactUsers[contactId] = r.fromUser || { id: contactId, name: 'Unknown', avatar: '?' };
        }
      }

      if (!contactMap[contactId]) contactMap[contactId] = 0;
      contactMap[contactId] += net;

      if (!contactLastActivity[contactId] || new Date(r.created_at) > new Date(contactLastActivity[contactId])) {
        contactLastActivity[contactId] = r.created_at;
      }
    });

    return Object.entries(contactMap).map(([uid, net]) => ({
      user: contactUsers[uid] || { id: uid, name: 'Unknown', avatar: '?' },
      net: parseFloat(net.toFixed(2)),
      lastActivity: contactLastActivity[uid] || null,
    }));
  },

  getTotals: async (userId) => {
    // Get all group memberships
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);

    let totalOwe = 0, totalOwed = 0;

    if (memberships?.length) {
      for (const m of memberships) {
        const net = await balanceStore.getGroupNetForUser(m.group_id, userId);
        if (net < 0) totalOwe += Math.abs(net);
        else totalOwed += net;
      }
    }

    const personalBalances = await balanceStore.getPersonalBalances(userId);
    personalBalances.forEach(b => {
      if (b.net < 0) totalOwe += Math.abs(b.net);
      else totalOwed += b.net;
    });

    return { totalOwe: parseFloat(totalOwe.toFixed(2)), totalOwed: parseFloat(totalOwed.toFixed(2)) };
  },

  getMonthlyTotal: async (userId) => {
    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id')
      .eq('user_id', userId);
    if (!memberships?.length) return 0;

    const groupIds = memberships.map(m => m.group_id);
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: expenses } = await supabase
      .from('expenses')
      .select('amount')
      .in('group_id', groupIds)
      .gte('created_at', firstOfMonth);

    return (expenses || []).reduce((sum, e) => sum + parseFloat(e.amount), 0);
  },
};

// ===== PERSONAL RECORDS =====
export const personalStore = {
  getAll: async (userId) => {
    // Filter client-side because to_user can be null for external contacts
    const { data } = await supabase
      .from('personal_records')
      .select('*, fromUser:profiles!from_user(*)')
      .order('created_at', { ascending: false });
    return (data || []).filter(r => r.from_user === userId || r.to_user === userId);
  },

  getByContact: async (userId, contactId) => {
    // 'name:X' means external contact identified by to_name
    if (contactId.startsWith('name:')) {
      const toName = contactId.slice(5);
      const { data } = await supabase
        .from('personal_records')
        .select('*, fromUser:profiles!from_user(*)')
        .eq('from_user', userId)
        .eq('to_name', toName)
        .order('created_at', { ascending: false });
      return data || [];
    }
    // Real registered user — query both directions
    const { data } = await supabase
      .from('personal_records')
      .select('*, fromUser:profiles!from_user(*)')
      .or(
        `and(from_user.eq.${userId},to_user.eq.${contactId}),and(from_user.eq.${contactId},to_user.eq.${userId})`
      )
      .order('created_at', { ascending: false });
    return data || [];
  },

  add: async (fromUser, toUserId, toUserName, amount, type, description) => {
    const { data, error } = await supabase
      .from('personal_records')
      .insert({
        from_user: fromUser,
        to_user: toUserId.startsWith('contact_') ? null : toUserId,
        to_name: toUserName,
        amount: parseFloat(amount),
        type,
        description,
        status: 'pending',
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },

  update: async (id, updates) => {
    const { error } = await supabase.from('personal_records').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
  },

  delete: async (id) => {
    await supabase.from('personal_records').delete().eq('id', id);
  },

  settle: async (id) => {
    await supabase
      .from('personal_records')
      .update({ status: 'settled', settled_at: new Date().toISOString() })
      .eq('id', id);
  },

  settleContact: async (userId, contactId) => {
    let query = supabase
      .from('personal_records')
      .select('id')
      .eq('from_user', userId)
      .eq('status', 'pending');

    if (contactId.startsWith('name:')) {
      // External contact — match by to_name
      query = query.eq('to_name', contactId.slice(5));
    } else {
      // Real user — match by to_user UUID
      query = query.eq('to_user', contactId);
    }

    const { data: records } = await query;
    if (records?.length) {
      const ids = records.map(r => r.id);
      await supabase
        .from('personal_records')
        .update({ status: 'settled', settled_at: new Date().toISOString() })
        .in('id', ids);
    }
  },
};

// ===== PENDING ITEMS (for Settle page) =====
export const getPendingItems = async (userId) => {
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, group:groups(*)')
    .eq('user_id', userId);

  const items = [];

  if (memberships?.length) {
    for (const m of memberships) {
      const net = await balanceStore.getGroupNetForUser(m.group_id, userId);
      if (net !== 0) items.push({ type: 'group', group: m.group, net, groupId: m.group_id });
    }
  }

  const personalBalances = await balanceStore.getPersonalBalances(userId);
  personalBalances.forEach(b => {
    if (b.net !== 0) items.push({ type: 'personal', user: b.user, net: b.net });
  });

  return items.sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
};
