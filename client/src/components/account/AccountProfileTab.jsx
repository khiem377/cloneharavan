'use client';

import React from 'react';
import {
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { isSyntheticEmail, getAuthProviderLabel } from '@/utils/userUtils';
import ProfileAvatarCard from './profile/ProfileAvatarCard';

export default function AccountProfileTab({
  user,
  displayName,
  initial,
  isEditing,
  setIsEditing,
  handleCancelEdit,
  profileForm,
  setProfileForm,
  profileLoading,
  profileMessage,
  handleUpdateProfile,
  avatarUploading,
  avatarInputRef,
  handleDeleteAvatar,
}) {
  return (
    <Card className="animate-fadeIn shadow-none border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription className="mt-0.5">
            Quản lý thông tin hồ sơ để bảo vệ tài khoản và nhận ưu đãi
          </CardDescription>
        </div>
        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-800 h-8 px-2.5 rounded-[6px]"
          >
            <X size={13} className="mr-1" />
            <span>Hủy</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-xs text-[#e30019] hover:text-[#c40015] hover:bg-red-50/50 h-8 px-2.5 rounded-[6px] font-semibold"
          >
            <Edit3 size={13} className="mr-1" />
            <span>Chỉnh sửa hồ sơ</span>
          </Button>
        )}
      </CardHeader>
      <Separator className="mb-5" />

      <CardContent className="space-y-6">
        <ProfileAvatarCard
          user={user}
          displayName={displayName}
          initial={initial}
          avatarUploading={avatarUploading}
          avatarInputRef={avatarInputRef}
          handleDeleteAvatar={handleDeleteAvatar}
        />

        {profileMessage && (
          <Alert variant={profileMessage.type === 'success' ? 'success' : 'destructive'}>
            {profileMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{profileMessage.text}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">
                Họ và tên <span className="text-[#e30019]">*</span>
              </Label>
              <Input
                id="fullName"
                type="text"
                required
                disabled={!isEditing}
                value={profileForm.fullName}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, fullName: e.target.value })
                }
                placeholder="Nhập họ và tên"
                className={`h-9 text-xs rounded-[6px] ${
                  isEditing
                    ? 'bg-white text-slate-900 border-slate-300 focus-visible:ring-[#e30019]'
                    : 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                disabled={!isEditing}
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, phone: e.target.value })
                }
                placeholder={
                  isEditing
                    ? 'Nhập số điện thoại (ví dụ: 0912345678)'
                    : 'Chưa cập nhật số điện thoại'
                }
                className={`h-9 text-xs font-mono rounded-[6px] ${
                  isEditing
                    ? 'bg-white text-slate-900 border-slate-300 focus-visible:ring-[#e30019]'
                    : 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="email">Email liên kết</Label>
                {isSyntheticEmail(user?.email) && (
                  <span className="text-[11px] text-amber-600 font-medium">Chưa liên kết email</span>
                )}
              </div>
              <Input
                id="email"
                type="email"
                disabled={!isEditing}
                value={isSyntheticEmail(profileForm.email) ? '' : profileForm.email}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, email: e.target.value })
                }
                placeholder={
                  isSyntheticEmail(user?.email)
                    ? 'Nhập địa chỉ email để nhận thông báo đơn hàng'
                    : 'Chưa cập nhật email'
                }
                className={`h-9 text-xs rounded-[6px] ${
                  isEditing
                    ? 'bg-white text-slate-900 border-slate-300 focus-visible:ring-[#e30019]'
                    : 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                type="date"
                disabled={!isEditing}
                value={profileForm.dateOfBirth}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, dateOfBirth: e.target.value })
                }
                className={`h-9 text-xs rounded-[6px] ${
                  isEditing
                    ? 'bg-white text-slate-900 border-slate-300 focus-visible:ring-[#e30019]'
                    : 'bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          <div className="pt-2">
            <Badge
              variant="outline"
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border-slate-200 rounded-[6px]"
            >
              <span className="font-semibold text-slate-700 mr-1.5">Phương thức đăng nhập:</span>
              <span className="font-semibold text-slate-900">
                {getAuthProviderLabel(user)}
              </span>
            </Badge>
          </div>

          {isEditing && (
            <div className="pt-3 flex items-center gap-2">
              <Button
                type="submit"
                disabled={profileLoading}
                size="sm"
                className="bg-[#e30019] hover:bg-[#c40015] text-white text-xs rounded-[6px] h-9 px-6 shadow-xs active:scale-[0.98] disabled:opacity-50"
              >
                {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="text-xs rounded-[6px] h-9 px-4 active:scale-[0.98]"
              >
                Hủy
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
