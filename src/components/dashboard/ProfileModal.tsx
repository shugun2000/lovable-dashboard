import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Eye, EyeOff, Loader2, User, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const nameSchema = z.string().min(2, 'Tên phải có ít nhất 2 ký tự').max(50, 'Tên quá dài');
const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { profile, isAdmin, updateProfile, updatePassword, uploadAvatar } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file hình ảnh',
        variant: 'destructive'
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 2MB',
        variant: 'destructive'
      });
      return;
    }

    setIsUploadingAvatar(true);
    const { error } = await uploadAvatar(file);
    setIsUploadingAvatar(false);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lên ảnh đại diện',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật ảnh đại diện'
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!isAdmin) {
      toast({
        title: 'Không có quyền',
        description: 'Chỉ admin mới có thể thay đổi tên',
        variant: 'destructive'
      });
      return;
    }

    const result = nameSchema.safeParse(name);
    if (!result.success) {
      toast({
        title: 'Lỗi',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    setIsUpdatingProfile(true);
    const { error } = await updateProfile({ name });
    setIsUpdatingProfile(false);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin cá nhân'
      });
    }
  };

  const handleUpdatePassword = async () => {
    const passwordResult = passwordSchema.safeParse(newPassword);
    if (!passwordResult.success) {
      toast({
        title: 'Lỗi',
        description: passwordResult.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Lỗi',
        description: 'Mật khẩu xác nhận không khớp',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdatingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsUpdatingPassword(false);

    if (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể đổi mật khẩu',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Thành công',
        description: 'Đã đổi mật khẩu thành công'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt tài khoản</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-xl">
                {profile?.name ? getInitials(profile.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="mt-2 text-lg font-medium">{profile?.name}</p>
          <p className="text-sm text-muted-foreground">{profile?.email}</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Thông tin
            </TabsTrigger>
            <TabsTrigger value="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Mật khẩu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                placeholder="Nhập họ và tên"
              />
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Chỉ admin mới có thể thay đổi tên
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={!isAdmin || isUpdatingProfile}
              className="w-full"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                'Lưu thay đổi'
              )}
            </Button>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
              <Input
                id="confirm-password"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !newPassword || !confirmPassword}
              className="w-full"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang đổi mật khẩu...
                </>
              ) : (
                'Đổi mật khẩu'
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
