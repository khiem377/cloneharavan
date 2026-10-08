'use client';

import React from 'react';
import {
  Edit3,
  X,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';

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
    <Card className="animate-fadeIn">
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
            className="text-xs text-slate-500 hover:text-slate-800 h-8 px-2.5 rounded-[6px] active:scale-[0.98]"
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
            className="text-xs text-[#e30019] hover:text-[#c40015] hover:bg-red-50/50 h-8 px-2.5 rounded-[6px] font-semibold active:scale-[0.98]"
          >
            <Edit3 size={13} className="mr-1" />
            <span>Chỉnh sửa hồ sơ</span>
          </Button>
        )}
      </CardHeader>
      <Separator className="mb-5" />

      <CardContent className="space-y-6">
        {/* Avatar Management Card */}
        <Card className="p-4 bg-slate-50/80 border-slate-200">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative shrink-0">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold text-xl flex items-center justify-center uppercase shadow-xs">
                  {initial}
                </div>
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1">
              <h4 className="text-xs font-bold text-slate-900">
                Ảnh đại diện tài khoản
              </h4>
              <p className="text-[11px] text-slate-500">
                Định dạng hỗ trợ: PNG, JPG, WEBP. Dung lượng tối đa 5MB.
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="h-7 text-xs rounded-[6px] px-3 active:scale-[0.98]"
                >
                  <Camera size={13} className="mr-1.5" />
                  <span>{user?.avatar?.url ? 'Đổi ảnh mới' : 'Tải ảnh lên'}</span>
                </Button>
                {user?.avatar?.url && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteAvatar}
                    disabled={avatarUploading}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[6px] px-3 active:scale-[0.98]"
                  >
                    <Trash2 size={13} className="mr-1.5" />
                    <span>Gỡ ảnh</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

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

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
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

            {/* Phone */}
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

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email đăng ký</Label>
              <Input
                id="email"
                type="email"
                disabled
                value={profileForm.email}
                className="h-9 text-xs rounded-[6px] border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Date of Birth */}
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

          {/* Auth Provider Info */}
          <div className="pt-2">
            <Badge
              variant="outline"
              className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border-slate-200 rounded-[6px]"
            >
              <span className="font-semibold text-slate-700 mr-1.5">Phương thức đăng nhập:</span>
              <span className="font-semibold text-slate-900">
                {user?.authProvider === 'google' ? 'Google Account' : 'Email & Mật khẩu'}
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
