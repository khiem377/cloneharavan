import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PasskeyIcon from '@/components/ui/PasskeyIcon';
import { authService } from '@/services/auth.service';
import { toast } from '@/providers/ToastProvider';
import {
  registerPasskey,
  isPasskeySupported,
  formatPasskeyError,
  getPasskeyPromptMessage,
} from '@/utils/passkeyUtils';

/**
 * FIDO2 / WebAuthn Passkey Management Tab
 */
export default function PasskeyTab({ user, setUser }) {
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyDeviceName, setPasskeyDeviceName] = useState('');
  const [deletingPasskeyId, setDeletingPasskeyId] = useState(null);

  const handleRegisterNewPasskey = async (e) => {
    e?.preventDefault();
    if (!isPasskeySupported()) {
      toast.error('Trình duyệt hoặc thiết bị của bạn không hỗ trợ Passkey / WebAuthn.');
      return;
    }

    setPasskeyLoading(true);
    try {
      const { data: optRes } = await authService.getPasskeyRegisterOptions();
      const options = optRes.data;

      const promptMsg = await getPasskeyPromptMessage('register');
      toast.info(promptMsg);
      const regResult = await registerPasskey(options);

      const { data: verifyRes } = await authService.verifyPasskeyRegister({
        response: regResult,
        deviceName: passkeyDeviceName.trim() || undefined,
      });

      toast.success(verifyRes.message || 'Đăng ký khóa bảo mật Passkey thành công!');
      setPasskeyDeviceName('');
      // Refresh user profile
      const { data: meRes } = await authService.getMe();
      if (meRes?.data) setUser(meRes.data);
    } catch (err) {
      console.error('Passkey register error:', err);
      const msg = formatPasskeyError(err);
      toast.error(msg);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const handleDeletePasskey = async (credentialId, deviceName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa bảo mật "${deviceName || 'Passkey'}" khỏi tài khoản?`)) {
      return;
    }
    setDeletingPasskeyId(credentialId);
    try {
      const { data: res } = await authService.deletePasskey(credentialId);
      toast.success(res.message || 'Đã xóa khóa Passkey thành công!');

      // Update local auth store immediately
      const updatedPasskeys = (user?.passkeys || []).filter((pk) => pk.credentialId !== credentialId);
      setUser({ ...user, passkeys: updatedPasskeys });

      // Refresh full profile in background
      const { data: meRes } = await authService.getMe();
      if (meRes?.data) setUser(meRes.data);
    } catch (err) {
      console.error('Delete passkey error:', err);
      toast.error(formatPasskeyError(err));
    } finally {
      setDeletingPasskeyId(null);
    }
  };

  return (
    <Card className="rounded-[6px] border border-border bg-card shadow-xs">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <PasskeyIcon size={20} variant="duotone" />
              <span>Khóa bảo mật Passkey (FIDO2 / WebAuthn)</span>
            </CardTitle>
          </div>
          <Badge variant="outline" className="rounded-[4px] bg-primary/10 text-primary border-primary/20 text-xs font-mono">
            {user?.passkeys?.length || 0} khóa đã đăng ký
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Form to register current device */}
        <form onSubmit={handleRegisterNewPasskey} className="p-4 rounded-[6px] border border-border bg-muted/20 space-y-3">
          <h4 className="font-bold text-xs text-foreground">Đăng ký thiết bị hiện tại</h4>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              type="text"
              placeholder="Tên thiết bị (VD: MacBook Pro, PC Văn Phòng, Windows Hello...)"
              value={passkeyDeviceName}
              onChange={(e) => setPasskeyDeviceName(e.target.value)}
              className="h-9 rounded-[6px] text-xs flex-grow font-sans"
            />
            <Button
              type="submit"
              disabled={passkeyLoading}
              className="h-9 rounded-[6px] text-xs font-semibold shrink-0 cursor-pointer active:scale-[0.98] flex items-center gap-1.5 shadow-xs"
            >
              {passkeyLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <PasskeyIcon size={16} />
              )}
              <span>Tạo khóa Passkey mới</span>
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Khi nhấn tạo, trình duyệt sẽ hiển thị hộp thoại bảo mật hệ điều hành để bạn quét vân tay hoặc khuôn mặt.
          </p>
        </form>

        {/* Registered Passkeys List */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-foreground">Danh sách khóa đã kích hoạt</h4>
          {user?.passkeys && user.passkeys.length > 0 ? (
            <div className="space-y-2">
              {user.passkeys.map((pk, idx) => (
                <div
                  key={pk.credentialId || idx}
                  className="flex items-center justify-between p-3 rounded-[6px] border border-border bg-background"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-[4px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <PasskeyIcon size={18} variant="duotone" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-foreground">
                          {pk.deviceName || `Khóa bảo mật #${idx + 1}`}
                        </span>
                        <Badge variant="outline" className="rounded-[4px] text-[10px] font-mono text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
                          Hoạt động
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        Tạo lúc: {pk.createdAt ? new Date(pk.createdAt).toLocaleString('vi-VN') : '—'}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePasskey(pk.credentialId, pk.deviceName)}
                    disabled={deletingPasskeyId === pk.credentialId}
                    className="h-8 rounded-[6px] text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-border active:scale-[0.98] transition-all shrink-0 cursor-pointer"
                  >
                    {deletingPasskeyId === pk.credentialId ? (
                      <Loader2 size={13} className="animate-spin mr-1.5" />
                    ) : (
                      <Trash2 size={13} className="mr-1.5" />
                    )}
                    <span>Xóa khóa</span>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-border rounded-[6px] text-xs text-muted-foreground">
              Chưa có khóa Passkey nào được đăng ký cho tài khoản này. Hãy đăng ký thiết bị của bạn ở trên để đăng nhập siêu nhanh!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
