'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Mail, Phone, Calendar, Loader2 } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [currentUserRole, setCurrentUserRole] = useState<string>('admin');

  useEffect(() => {
    fetchCurrentUserRole();
    fetchUsers();
  }, []);

  const fetchCurrentUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      if (data) setCurrentUserRole(data.role);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          is_super_admin: newRole === 'super_admin' 
        })
        .eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role.');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.phone?.includes(searchQuery) || false);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading user profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 p-8 sm:p-10 text-white shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
              <Users className="w-8 h-8 text-blue-200" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                User Management
              </h1>
              <p className="text-blue-200/80 text-sm sm:text-base font-medium max-w-xl">
                View, manage, and assign roles to registered users on the PropConnect platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-slate-200/40 border border-white flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 appearance-none bg-white/50 border-2 border-slate-100 text-slate-700 rounded-2xl px-5 py-3 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:border-slate-200 transition-all cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">Standard User</option>
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-gradient-to-br from-white to-blue-50/30 relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl" />
            <div className="p-5 bg-white rounded-full mb-5 border border-slate-100 shadow-sm relative z-10">
               <Users className="w-12 h-12 text-blue-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2 relative z-10">No users found</h3>
            <p className="text-slate-500 max-w-md mx-auto text-sm font-medium relative z-10 leading-relaxed">
              Try adjusting your search or role filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b-2 border-slate-100 bg-gradient-to-r from-slate-50 to-white text-slate-500 font-extrabold uppercase tracking-widest text-[10px]">
                  <th className="px-6 py-5">User Details</th>
                  <th className="px-6 py-5">Contact Info</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-transparent">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{user.full_name || 'Anonymous User'}</div>
                      <div className="text-xs text-slate-400 font-mono mt-1">{user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium mb-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                        </div>
                      )}
                      {user.email && !user.email.includes('@user.propconnect.com') && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {(currentUserRole === 'super_admin' || currentUserRole === 'admin') ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2 py-1 border transition-all ${
                            user.role === 'super_admin' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          user.role === 'super_admin' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {user.role === 'super_admin' ? 'Super Admin' : user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
