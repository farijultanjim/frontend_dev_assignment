'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Conversation, UserSearchResponse } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  ShieldCheck,
  UserPlus,
  UserMinus,
  Edit2,
  Check,
  X,
  LogOut,
  Loader2,
  Search
} from 'lucide-react';

interface GroupSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: Conversation;
}

export function GroupSettingsModal({ isOpen, onClose, conversation }: GroupSettingsModalProps) {
  const { user: currentUser } = useAuth();
  const {
    renameGroup,
    addGroupMembers,
    removeGroupMember,
    promoteToAdmin,
    leaveGroup
  } = useChat();

  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(conversation.name || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Add members sub-flow
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const currentUserId = currentUser?._id || '';
  const admins = conversation.admins || [];
  const isAdmin = admins.includes(currentUserId) || conversation.createdBy === currentUserId;

  // Extract participants
  const participants = (conversation.participants || []) as any[];

  const handleSaveName = async () => {
    if (!groupName.trim() || groupName === conversation.name) {
      setIsEditingName(false);
      return;
    }
    setIsUpdatingName(true);
    try {
      await renameGroup(conversation._id, groupName.trim());
      setIsEditingName(false);
    } catch (err) {
      console.error('Failed to rename group:', err);
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const users = await api.searchUsers(q);
      // Filter out users already in group
      const existingIds = new Set(participants.map((p) => (typeof p === 'string' ? p : p._id)));
      const filtered = users.filter((u) => !existingIds.has(u._id));
      setSearchResults(filtered);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (targetUser: UserSearchResponse) => {
    setIsAdding(targetUser._id);
    try {
      await addGroupMembers(conversation._id, [targetUser._id]);
      setSearchResults((prev) => prev.filter((u) => u._id !== targetUser._id));
      setShowAddMembers(false);
    } catch (err) {
      console.error('Failed to add participant:', err);
    } finally {
      setIsAdding(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) return;
    setActionLoading(`remove_${userId}`);
    try {
      await removeGroupMember(conversation._id, userId);
    } catch (err) {
      console.error('Failed to remove participant:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromoteAdmin = async (userId: string) => {
    setActionLoading(`promote_${userId}`);
    try {
      await promoteToAdmin(conversation._id, userId);
    } catch (err) {
      console.error('Failed to promote participant:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group conversation?')) return;
    setActionLoading('leave');
    try {
      await leaveGroup(conversation._id);
      onClose();
    } catch (err) {
      console.error('Failed to leave group:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Group Settings"
      description="Manage members, admin permissions, and channel details."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Group Name Section */}
        <div className="rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 border border-zinc-200/80 dark:border-zinc-800">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Group Name
          </label>
          <div className="mt-1 flex items-center justify-between gap-2">
            {isEditingName ? (
              <div className="flex flex-1 items-center gap-2">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 rounded-lg border border-indigo-500 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-50 outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={isUpdatingName}
                  className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                >
                  {isUpdatingName ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setGroupName(conversation.name || '');
                    setIsEditingName(false);
                  }}
                  className="p-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {conversation.name || 'Unnamed Group'}
                </h4>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Rename</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Participants Header */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Members ({participants.length})
            </span>
            {isAdmin && (
              <button
                onClick={() => setShowAddMembers(!showAddMembers)}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{showAddMembers ? 'Hide Search' : 'Add Member'}</span>
              </button>
            )}
          </div>

          {/* Add Members Drawer */}
          {showAddMembers && isAdmin && (
            <div className="mb-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Search user to add..."
                  className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 outline-none focus:border-indigo-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  autoFocus
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-2.5 h-3.5 w-3.5 animate-spin text-zinc-400" />
                )}
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar name={u.name} id={u._id} size="sm" className="h-6 w-6 text-[10px]" />
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                          {u.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddMember(u)}
                        disabled={isAdding === u._id}
                        className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-indigo-700 transition"
                      >
                        {isAdding === u._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <span>Add</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Member List */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
            {participants.map((p: any) => {
              const pId = typeof p === 'string' ? p : p._id;
              const pName = typeof p === 'string' ? 'Member' : p.name || p.phone || 'Member';
              const pPhone = typeof p === 'string' ? '' : p.phone;
              const isMemberAdmin = admins.includes(pId) || conversation.createdBy === pId;
              const isSelf = pId === currentUserId;

              return (
                <div
                  key={pId}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/40 border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={pName} id={pId} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {pName} {isSelf && '(You)'}
                        </span>
                        {isMemberAdmin && (
                          <Badge variant="admin" size="sm">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Admin</span>
                          </Badge>
                        )}
                      </div>
                      {pPhone && <p className="text-[11px] text-zinc-400">{pPhone}</p>}
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-1.5">
                      {!isMemberAdmin && (
                        <button
                          onClick={() => handlePromoteAdmin(pId)}
                          disabled={actionLoading === `promote_${pId}`}
                          title="Promote to admin"
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-amber-600 dark:hover:bg-zinc-800 transition"
                        >
                          {actionLoading === `promote_${pId}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ShieldCheck className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(pId)}
                        disabled={actionLoading === `remove_${pId}`}
                        title="Remove member"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-rose-600 dark:hover:bg-zinc-800 transition"
                      >
                        {actionLoading === `remove_${pId}` ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <UserMinus className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Group Action */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
          <button
            onClick={handleLeaveGroup}
            disabled={actionLoading === 'leave'}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition disabled:opacity-50"
          >
            {actionLoading === 'leave' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            <span>Leave Group</span>
          </button>

          <button
            onClick={onClose}
            className="rounded-xl bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
