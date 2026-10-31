'use client';

import { useState, useEffect, useRef } from 'react';
import userService from '@/services/user.service';
import { toast } from '@/components/ui/toast';
import { confirm } from '@/components/ui/confirm-dialog';
import { isSyntheticEmail } from '@/utils/userUtils';

export function useAccountProfile(user, setUser) {
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'other',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || 'other',
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
    }
  }, [user]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa là 5MB');
      return;
    }

    setAvatarUploading(true);
    try {
      const res = await userService.uploadAvatar(file);
      const newAvatar = res.data?.avatar || res.avatar;
      if (newAvatar) {
        setUser({ ...user, avatar: newAvatar });
        toast.success('Đổi ảnh đại diện thành công!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tải ảnh lên');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    const isConfirmed = await confirm({
      title: 'Gỡ ảnh đại diện?',
      description: 'Bạn có chắc chắn muốn gỡ ảnh đại diện hiện tại khỏi tài khoản?',
      confirmText: 'Gỡ ảnh',
      cancelText: 'Hủy bỏ',
      variant: 'destructive',
    });
    if (!isConfirmed) return;
    setAvatarUploading(true);
    try {
      await userService.deleteAvatar();
      setUser({ ...user, avatar: null });
      toast.success('Đã gỡ ảnh đại diện thành công');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gỡ ảnh đại diện');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileMessage(null);
    if (user) {
      setProfileForm({
        fullName: user.fullName || user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || 'other',
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split('T')[0]
          : '',
      });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    setProfileLoading(true);
    setProfileMessage(null);

    try {
      const payload = {
        fullName: profileForm.fullName.trim(),
        phone: profileForm.phone.trim(),
        gender: profileForm.gender,
        dateOfBirth: profileForm.dateOfBirth || null,
      };

      if (
        profileForm.email &&
        !isSyntheticEmail(profileForm.email) &&
        profileForm.email.toLowerCase().trim() !== user?.email?.toLowerCase()?.trim()
      ) {
        payload.email = profileForm.email.toLowerCase().trim();
      }

      const updatedUser = await userService.updateProfile(payload);
      if (updatedUser) {
        setUser({ ...user, ...updatedUser });
      }
      setIsEditing(false);
      setProfileMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      toast.success('Cập nhật thông tin thành công!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Không thể cập nhật thông tin';
      setProfileMessage({ type: 'error', text: errMsg });
      toast.error(errMsg);
    } finally {
      setProfileLoading(false);
    }
  };

  return {
    avatarUploading,
    avatarInputRef,
    isEditing,
    setIsEditing,
    profileLoading,
    profileMessage,
    profileForm,
    setProfileForm,
    handleAvatarFileChange,
    handleDeleteAvatar,
    handleCancelEdit,
    handleUpdateProfile,
  };
}
