'use client';

import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import ListSkeleton from '@/components/ListSkeleton';
import PageContent from '@/components/PageContent';
import PageHeader from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SUPERADMIN_ONLY } from '@/constants/roles';
import { type Invite, useCreateInvite, useFetchInvites, useRevokeInvite } from '@/hooks/useInvites';
import {
  type WaitlistEntry,
  type WaitlistStatus,
  useDeleteWaitlistEntry,
  useFetchWaitlist,
  useReviewWaitlist,
} from '@/hooks/useWaitlist';
import { useWaitlistRealtime } from '@/hooks/useWaitlistRealtime';
import { ClipboardList, Copy, Link2, Loader2, Trash2, UserCheck, X } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_COLORS: Record<WaitlistStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const STATUS_TABS: WaitlistStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

const WaitlistPage = () => {
  useWaitlistRealtime();

  const [statusFilter, setStatusFilter] = useState<WaitlistStatus>('PENDING');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] = useState<string[] | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const changeStatusFilter = (status: WaitlistStatus) => {
    setStatusFilter(status);
    setSelectedIds(new Set());
  };

  const { data: entries, isLoading } = useFetchWaitlist(statusFilter, debouncedSearch || undefined);
  const reviewMutation = useReviewWaitlist();
  const deleteMutation = useDeleteWaitlistEntry();

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!entries) return;
    setSelectedIds(prev => (prev.size === entries.length ? new Set() : new Set(entries.map(e => e.id))));
  };

  const handleApprove = (ids: string[]) => {
    reviewMutation.mutate(
      { ids, action: 'approve' },
      {
        onSuccess: result => {
          if (result?.failed.length) {
            toast.error(`${result.failed.length} failed to approve`);
          } else {
            toast.success(`Approved ${ids.length} registration${ids.length !== 1 ? 's' : ''}`);
          }
          setSelectedIds(new Set());
        },
        onError: err => toast.error(err.message),
      }
    );
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    reviewMutation.mutate(
      { ids: rejectTarget, action: 'reject', reason: rejectReason || undefined },
      {
        onSuccess: () => {
          toast.success(`Rejected ${rejectTarget.length} registration${rejectTarget.length !== 1 ? 's' : ''}`);
          setSelectedIds(new Set());
          setRejectTarget(null);
          setRejectReason('');
        },
        onError: err => toast.error(err.message),
      }
    );
  };

  return (
    <PageContent allowedRoles={SUPERADMIN_ONLY}>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Member Approvals', link: '/waitlist' },
        ]}
      />

      <PageHeader
        icon={UserCheck}
        title="Member Approvals"
        description="Review self-registrations and manage invitation links"
      />

      {/* Pending approvals */}
      <Card className="gap-4">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            Registrations
          </CardTitle>
          <div className="flex w-full gap-1 rounded-md bg-tanakayu-dark/5 p-1">
            {STATUS_TABS.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => changeStatusFilter(s)}
                className={`flex-1 rounded px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  statusFilter === s ? 'bg-white shadow-sm' : 'text-tanakayu-dark/60 hover:text-tanakayu-dark'
                }`}
              >
                {s.toLowerCase()}
              </button>
            ))}
          </div>
          <Input placeholder="Search by name, username, email, or phone..." value={search} onChange={e => setSearch(e.target.value)} />

          {selectedIds.size > 0 && statusFilter === 'PENDING' && (
            <div className="flex items-center justify-between rounded-md bg-tanakayu-dark/5 px-3 py-2">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  disabled={reviewMutation.isPending}
                  onClick={() => setRejectTarget(Array.from(selectedIds))}
                >
                  Reject
                </Button>
                <Button size="sm" disabled={reviewMutation.isPending} onClick={() => handleApprove(Array.from(selectedIds))}>
                  {reviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Approve'}
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && <ListSkeleton leading="checkbox" actions={2} />}

          {!isLoading && entries?.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">No {statusFilter.toLowerCase()} registrations</p>
          )}

          {!isLoading && entries && entries.length > 0 && (
            <div className="flex items-center gap-2 border-b px-4 py-2 sm:px-6">
              <input
                type="checkbox"
                checked={selectedIds.size === entries.length}
                onChange={toggleSelectAll}
                className="h-4 w-4"
              />
              <span className="text-muted-foreground text-xs">Select all</span>
            </div>
          )}

          <div className="divide-y">
            {!isLoading &&
              entries?.map(entry => (
                <WaitlistRow
                  key={entry.id}
                  entry={entry}
                  selected={selectedIds.has(entry.id)}
                  onToggle={() => toggleSelected(entry.id)}
                  onApprove={() => handleApprove([entry.id])}
                  onReject={() => setRejectTarget([entry.id])}
                  onDelete={() =>
                    deleteMutation.mutate(entry.id, {
                      onSuccess: () => toast.success('Entry removed'),
                      onError: err => toast.error(err.message),
                    })
                  }
                  isPending={reviewMutation.isPending || deleteMutation.isPending}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      <InvitesCard />

      {/* Reject confirmation */}
      <Dialog open={!!rejectTarget} onOpenChange={open => !open && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Reject Registration{rejectTarget && rejectTarget.length > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              This is final — {rejectTarget && rejectTarget.length > 1 ? 'these people' : 'this person'} won&apos;t be able to
              register again unless you remove the entry.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5 py-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Shown for your own records"
            />
          </div>
          <DialogFooter className="gap-2 pt-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={reviewMutation.isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" disabled={reviewMutation.isPending} onClick={handleReject}>
              {reviewMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContent>
  );
};

interface WaitlistRowProps {
  entry: WaitlistEntry;
  selected: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  isPending: boolean;
}

function WaitlistRow({ entry, selected, onToggle, onApprove, onReject, onDelete, isPending }: WaitlistRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-tanakayu-dark/5 sm:px-6">
      {entry.status === 'PENDING' && (
        <input type="checkbox" checked={selected} onChange={onToggle} className="h-4 w-4 shrink-0" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{entry.fullName || '-'}</p>
          <Badge variant="secondary" className={`text-[10px] ${STATUS_COLORS[entry.status]}`}>
            {entry.status}
          </Badge>
        </div>
        <p className="text-muted-foreground truncate text-xs">
          @{entry.username} &middot; {entry.email} &middot; {entry.phoneNumber}
        </p>
        {entry.status === 'REJECTED' && entry.rejectReason && (
          <p className="text-muted-foreground truncate text-xs italic">Reason: {entry.rejectReason}</p>
        )}
      </div>

      {entry.status === 'PENDING' && (
        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" disabled={isPending} onClick={onReject} title="Reject">
            <X className="h-4 w-4 text-red-500" />
          </Button>
          <Button variant="ghost" size="icon" disabled={isPending} onClick={onApprove} title="Approve">
            <UserCheck className="h-4 w-4 text-green-600" />
          </Button>
        </div>
      )}

      {entry.status === 'REJECTED' && (
        <Button variant="ghost" size="icon" disabled={isPending} onClick={onDelete} title="Remove entry so they can re-register">
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}

function InvitesCard() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { data: invites, isLoading } = useFetchInvites();
  const createMutation = useCreateInvite();
  const revokeMutation = useRevokeInvite();

  const handleCreate = () => {
    createMutation.mutate(
      { full_name: fullName, phone_number: phoneNumber || undefined },
      {
        onSuccess: () => {
          toast.success('Invite link created');
          setFullName('');
          setPhoneNumber('');
        },
        onError: err => toast.error(err.message),
      }
    );
  };

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/register?invite=${token}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  const activeInvites = (invites ?? []).filter(i => !i.usedAt && !i.revokedAt);

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Link2 className="h-4 w-4" />
          Invitation Links
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="Name (optional)" value={fullName} onChange={e => setFullName(e.target.value)} />
          <Input
            placeholder="Lock to phone number (optional)"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
          />
          <Button onClick={handleCreate} disabled={createMutation.isPending} className="shrink-0">
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Link'}
          </Button>
        </div>

        {isLoading && <ListSkeleton leading="none" actions={2} rows={2} padded={false} />}

        {!isLoading && activeInvites.length === 0 && (
          <p className="text-muted-foreground py-4 text-center text-sm">No active invitation links</p>
        )}

        <div className="divide-y">
          {!isLoading &&
            activeInvites.map(invite => (
              <InviteRow key={invite.id} invite={invite} onCopy={() => copyLink(invite.token)} onRevoke={() => revokeMutation.mutate(invite.id, { onError: err => toast.error(err.message) })} isPending={revokeMutation.isPending} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface InviteRowProps {
  invite: Invite;
  onCopy: () => void;
  onRevoke: () => void;
  isPending: boolean;
}

function InviteRow({ invite, onCopy, onRevoke, isPending }: InviteRowProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invite.fullName || 'Unnamed invite'}</p>
        <p className="text-muted-foreground truncate text-xs">{invite.phoneNumber || 'Any phone number'}</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onCopy} title="Copy link">
        <Copy className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={isPending} onClick={onRevoke} title="Revoke">
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
}

export default WaitlistPage;
