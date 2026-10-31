'use client';

import React from 'react';
import { Camera, Trash2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfileAvatarCard({
  user,
  displayName,
  initial,
  avatarUploading,
  avatarInputRef,
  handleDeleteAvatar,
}) {
  return (
    <Card className="p-4 bg-slate-50/80 border-slate-200 shadow-none">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative shrink-0">
          <Avatar className="size-16 border-2 border-white shadow-xs">
            <AvatarImage src={user?.avatar?.url} alt={displayName} referrerPolicy="no-referrer" />
            <AvatarFallback className="bg-slate-900 text-white font-bold text-xl uppercase">
              {initial}
            </AvatarFallback>
          </Avatar>
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
            Định dạng JPG, PNG hoặc WebP. Dung lượng tối đa 5MB.
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={avatarUploading}
              onClick={() => avatarInputRef.current?.click()}
              className="text-xs h-7 px-2.5 rounded-[4px] border-slate-300"
            >
              <Camera size={12} className="mr-1 text-slate-500" />
              <span>Đổi ảnh</span>
            </Button>
            {user?.avatar?.url && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={avatarUploading}
                onClick={handleDeleteAvatar}
                className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-7 px-2.5 rounded-[4px]"
              >
                <Trash2 size={12} className="mr-1" />
                <span>Xóa ảnh</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
