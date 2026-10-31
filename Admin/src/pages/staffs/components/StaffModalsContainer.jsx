import React from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import InviteMemberModal from '@/components/common/InviteMemberModal';
import StaffDetailDrawer from './StaffDetailDrawer';
import StaffEditRoleModal from './StaffEditRoleModal';
import StaffResetPasswordModal from './StaffResetPasswordModal';
import StaffCreateModal from './StaffCreateModal';

export default function StaffModalsContainer({
  drawerStaff,
  onCloseDrawer,
  drawerTab,
  setDrawerTab,
  customPermIds,
  onToggleCustomPerm,
  permissionsGrouped,
  roles,
  onSaveCustomPermissions,
  onClearCustomPermissions,
  onToggleStatusClick,
  isUpdatingRole,
  currentAdminUser,
  editRoleUser,
  onCloseEditRole,
  selectedRoleId,
  setSelectedRoleId,
  onSaveRole,
  resetPassUser,
  onCloseResetPass,
  newPassword,
  setNewPassword,
  onSubmitResetPassword,
  isResettingPass,
  createModalOpen,
  setCreateModalOpen,
  createForm,
  setCreateForm,
  onSubmitCreate,
  isCreatingStaff,
  warehouses,
  confirmTarget,
  onConfirmToggle,
  onCancelConfirmToggle,
  inviteModalOpen,
  setInviteModalOpen,
  onInviteSuccess,
}) {
  return (
    <>
      <StaffDetailDrawer
        drawerStaff={drawerStaff}
        onClose={onCloseDrawer}
        drawerTab={drawerTab}
        setDrawerTab={setDrawerTab}
        customPermIds={customPermIds}
        onToggleCustomPerm={onToggleCustomPerm}
        permissionsGrouped={permissionsGrouped}
        roles={roles}
        onSaveCustomPermissions={onSaveCustomPermissions}
        onClearCustomPermissions={onClearCustomPermissions}
        onToggleStatusClick={onToggleStatusClick}
        isPending={isUpdatingRole}
        currentAdminUser={currentAdminUser}
      />

      <StaffEditRoleModal
        user={editRoleUser}
        onClose={onCloseEditRole}
        roles={roles}
        selectedRoleId={selectedRoleId}
        setSelectedRoleId={setSelectedRoleId}
        onSave={onSaveRole}
        isPending={isUpdatingRole}
      />

      <StaffResetPasswordModal
        user={resetPassUser}
        onClose={onCloseResetPass}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        onSubmit={onSubmitResetPassword}
        isPending={isResettingPass}
      />

      <StaffCreateModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        createForm={createForm}
        setCreateForm={setCreateForm}
        onSubmit={onSubmitCreate}
        isPending={isCreatingStaff}
        roles={roles}
        warehouses={warehouses}
      />

      <ConfirmDialog
        open={Boolean(confirmTarget)}
        title={confirmTarget?.nextStatus ? 'Mở khóa tài khoản nhân viên' : 'Khóa tài khoản nhân viên'}
        description={
          confirmTarget?.nextStatus
            ? `Bạn có chắc muốn mở khóa cho tài khoản "${confirmTarget?.user?.email}"? Nhân viên sẽ có thể đăng nhập lại trang quản trị.`
            : `CẢNH BÁO: Bạn sắp khóa tài khoản "${confirmTarget?.user?.email}". Phiên đăng nhập của nhân viên này sẽ bị thu hồi ngay lập tức!`
        }
        confirmText={confirmTarget?.nextStatus ? 'Mở khóa' : 'Khóa tài khoản'}
        confirmVariant={confirmTarget?.nextStatus ? 'primary' : 'destructive'}
        onConfirm={onConfirmToggle}
        onCancel={onCancelConfirmToggle}
      />

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={onInviteSuccess}
      />
    </>
  );
}
