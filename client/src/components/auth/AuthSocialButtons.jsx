import React from 'react';
import { Separator } from '@/components/ui/separator';
import GoogleLoginButton from './GoogleLoginButton';
import TikTokLoginButton from './TikTokLoginButton';
import ZaloLoginButton from './ZaloLoginButton';

export default function AuthSocialButtons({ googleText = 'signin_with' }) {
  return (
    <div className="space-y-3">
      <div className="relative flex py-1 items-center">
        <Separator className="flex-1" />
        <span className="shrink-0 mx-3 text-xs text-slate-400 font-medium">
          Hoặc tiếp tục với
        </span>
        <Separator className="flex-1" />
      </div>

      <GoogleLoginButton text={googleText} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <TikTokLoginButton text="TikTok" />
        <ZaloLoginButton text="Zalo" />
      </div>
    </div>
  );
}
