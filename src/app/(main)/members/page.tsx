'use client';

import { useEffect, useState } from 'react';

import Breadcrumb from '@/components/Breadcrumb';
import LoadingIndicator from '@/components/LoadingIndicator';
import PageContent from '@/components/PageContent';
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
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPERADMIN_ONLY } from '@/constants/roles';
import { CLUSTER_LABELS, CLUSTER_LIST } from '@/data/clusters';
import { type Member, useAdminDeleteMember, useAdminUpdateMember, useFetchMembers } from '@/hooks/useAdminMembers';
import { Loader2, Pencil, Search, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: 'bg-red-100 text-red-700',
  MEMBER: 'bg-blue-100 text-blue-700',
  MERCHANT: 'bg-amber-100 text-amber-700',
};

/** Parse "cluster, houseNumber" address back to parts */
function parseAddress(address: string): { cluster: string; houseNumber: string } {
  const clusterKeys = CLUSTER_LIST as readonly string[];
  for (const key of clusterKeys) {
    if (address.startsWith(`${key}, `)) {
      return { cluster: key, houseNumber: address.slice(key.length + 2) };
    }
  }
  return { cluster: 'others', houseNumber: address };
}

const MembersPage = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: members, isLoading } = useFetchMembers(debouncedSearch || undefined);
  const updateMutation = useAdminUpdateMember();
  const deleteMutation = useAdminDeleteMember();

  return (
    <PageContent allowedRoles={SUPERADMIN_ONLY}>
      <Breadcrumb
        items={[
          { label: 'Home', link: '/' },
          { label: 'Members', link: '/members' },
        ]}
      />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
          <Users className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h2 className="text-tanakayu-text font-sans text-2xl font-bold">Members</h2>
          <p className="text-tanakayu-text text-sm">
            {members ? `${members.length} member${members.length !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search by name, username, phone, or address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Member List */}
      <Card className="gap-4">
        <CardHeader>
          <CardTitle className="text-base">All Members</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <LoadingIndicator isLoading={isLoading} />

          {!isLoading && members?.length === 0 && (
            <p className="text-muted-foreground py-8 text-center text-sm">No members found</p>
          )}

          <div className="divide-y">
            {members?.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:px-6"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-sm font-bold text-white uppercase">
                  {member.fullName?.charAt(0) || member.username?.charAt(0) || '?'}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{member.fullName || '-'}</p>
                    <Badge variant="secondary" className={`text-[10px] ${ROLE_COLORS[member.role] || ''}`}>
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground truncate text-xs">
                    @{member.username} &middot; {member.phoneNumber || 'No phone'}
                  </p>
                </div>

                {/* Edit Button */}
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => setEditingMember(member)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editingMember && (
        <EditMemberDialog
          member={editingMember}
          open={!!editingMember}
          onOpenChange={open => !open && setEditingMember(null)}
          onSave={(id, payload) => {
            updateMutation.mutate(
              { id, ...payload },
              {
                onSuccess: () => {
                  toast.success('Member updated successfully');
                  setEditingMember(null);
                },
                onError: err => toast.error(err.message),
              }
            );
          }}
          onDelete={member => {
            setEditingMember(null);
            setDeletingMember(member);
          }}
          isPending={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingMember && (
        <Dialog open={!!deletingMember} onOpenChange={open => !open && setDeletingMember(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-red-600">Delete Account</DialogTitle>
              <DialogDescription>
                This will permanently delete <span className="font-semibold">{deletingMember.fullName}</span> (@
                {deletingMember.username}). This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 pt-2">
              <DialogClose asChild>
                <Button variant="outline" disabled={deleteMutation.isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  deleteMutation.mutate(deletingMember.id, {
                    onSuccess: () => {
                      toast.success('Account deleted');
                      setDeletingMember(null);
                    },
                    onError: err => toast.error(err.message),
                  });
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </PageContent>
  );
};

interface EditMemberDialogProps {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, payload: Record<string, string>) => void;
  onDelete: (member: Member) => void;
  isPending: boolean;
}

function EditMemberDialog({ member, open, onOpenChange, onSave, onDelete, isPending }: EditMemberDialogProps) {
  const parsed = parseAddress(member.address || '');
  const [displayName, setDisplayName] = useState(member.fullName || '');
  const [email, setEmail] = useState(member.email || '');
  const [phone, setPhone] = useState(member.phoneNumber || '');
  const [cluster, setCluster] = useState(parsed.cluster);
  const [houseNumber, setHouseNumber] = useState(parsed.houseNumber);
  const [password, setPassword] = useState('');

  // Reset form when member changes
  useEffect(() => {
    const p = parseAddress(member.address || '');
    setDisplayName(member.fullName || '');
    setEmail(member.email || '');
    setPhone(member.phoneNumber || '');
    setCluster(p.cluster);
    setHouseNumber(p.houseNumber);
    setPassword('');
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};

    if (displayName !== member.fullName) payload.full_name = displayName;
    if (email !== member.email) payload.email = email;
    if (phone !== member.phoneNumber) payload.phone_number = phone;

    const newAddress = `${cluster}, ${houseNumber}`;
    if (newAddress !== member.address) payload.address = newAddress;
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      onOpenChange(false);
      return;
    }

    onSave(member.id, payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
          <DialogDescription>@{member.username}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input
              id="edit-name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Cluster / Block</Label>
            <Select value={cluster} onValueChange={setCluster} disabled={isPending}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLUSTER_LIST.map(c => (
                  <SelectItem key={c} value={c}>
                    {CLUSTER_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="edit-house">House Number</Label>
            <Input
              id="edit-house"
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div className="relative grid gap-1.5">
            <Label htmlFor="edit-password">New Password</Label>
            <PasswordInput
              id="edit-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              disabled={isPending}
            />
            <p className="text-muted-foreground text-xs">Only fill if you want to reset the password</p>
          </div>

          <div className="flex items-center justify-between gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
              disabled={isPending}
              onClick={() => onDelete(member)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete Account
            </Button>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default MembersPage;
