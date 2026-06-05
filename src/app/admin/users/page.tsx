'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Search, Mail, Phone, Calendar, Loader2, Trash2, Edit2, KeyRound, X } from 'lucide-react';

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

  // Password Change State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Edit User State
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editLoading, setEditLoading] = useState(false);

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
      
      let fetchedUsers = data || [];
      
      // Inject missing hardcoded super admins if they are not in the DB
      const hardcoded = [
        { id: 'hardcoded-1', email: 'freshcareer4@gmail.com', phone: null, full_name: 'Primary Owner', role: 'super_admin', created_at: new Date().toISOString() },
        { id: 'hardcoded-2', email: 'rajeshrshiv@gmail.com', phone: null, full_name: 'Rajesh Shiv', role: 'super_admin', created_at: new Date().toISOString() },
        { id: 'hardcoded-3', email: 'admin@propconnect.com', phone: null, full_name: 'Dev Admin', role: 'super_admin', created_at: new Date().toISOString() }
      ];

      hardcoded.forEach(hc => {
        if (!fetchedUsers.find(u => u.email === hc.email)) {
          fetchedUsers.unshift(hc);
        }
      });

      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setPasswordModalOpen(false), 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string | null) => {
    if (email === 'freshcareer4@gmail.com' || email === 'rajeshrshiv@gmail.com') {
      alert('Action Denied: You cannot delete the primary Super Admin accounts.');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to permanently delete user ${email || userId}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
      alert('User removed successfully.');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editUser.full_name,
          phone: editUser.phone
        })
        .eq('id', editUser.id);
        
      if (error) throw error;
      setUsers(users.map(u => u.id === editUser.id ? editUser : u));
      setEditUserModalOpen(false);
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert('Failed to update user details.');
    } finally {
      setEditLoading(false);
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
      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-500" /> Change My Password
              </h3>
              <button onClick={() => setPasswordModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdatePassword} className="p-6 space-y-4">
              {passwordError && <div className="p-3 bg-rose-50 text-rose-600 text-sm font-semibold rounded-lg">{passwordError}</div>}
              {passwordSuccess && <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-semibold rounded-lg">{passwordSuccess}</div>}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  className="w-full border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUserModalOpen && editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-500" /> Update Admin/User
              </h3>
              <button onClick={() => setEditUserModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Full Name</label>
                <input
                  type="text"
                  value={editUser.full_name || ''}
                  onChange={(e) => setEditUser({...editUser, full_name: e.target.value})}
                  className="w-full border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase">Phone Number</label>
                <input
                  type="text"
                  value={editUser.phone || ''}
                  onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                  className="w-full border-2 border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={editLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

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
          
          <button
            onClick={() => {
              setPasswordError('');
              setPasswordSuccess('');
              setNewPassword('');
              setPasswordModalOpen(true);
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white border border-white/20 px-5 py-3 rounded-xl font-bold shadow-lg backdrop-blur-md transition-all duration-300 w-full md:w-auto justify-center"
          >
            <KeyRound className="w-5 h-5" />
            Change My Password
          </button>
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
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-transparent">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{user.full_name || 'Anonymous User'}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 mb-2">{user.id}</div>
                      
                      {['admin@propconnect.com', 'freshcareer4@gmail.com', 'rajeshrshiv@gmail.com'].includes(user.email || '') ? (
                        <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider">Pass:</span>
                          <span className="font-mono text-xs font-bold tracking-wide">Admin@123</span>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium mb-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
                        </div>
                      )}
                      {user.email && !user.email.includes('@user.propconnect.com') && !user.email.includes('@crm.com') && (
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
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {currentUserRole === 'super_admin' && (
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setEditUserModalOpen(true);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Update User Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      
                      {currentUserRole === 'super_admin' && user.email !== 'freshcareer4@gmail.com' && user.email !== 'rajeshrshiv@gmail.com' && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
