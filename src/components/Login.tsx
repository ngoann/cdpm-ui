/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layers, ShieldCheck, User, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }

    setIsLoading(true);

    // Dynamic logging delay to make it feel real & high-quality
    setTimeout(() => {
      // Validate credentials (accept admin/admin123 or user/123456 as standard defaults)
      const normalizedUser = username.trim().toLowerCase();
      const normalizedPass = password;

      if (
        (normalizedUser === 'admin' && normalizedPass === 'admin123') ||
        (normalizedUser === 'user' && normalizedPass === '123456') ||
        (normalizedUser === 'cdpm' && normalizedPass === 'password')
      ) {
        if (rememberMe) {
          localStorage.setItem('cdpm_logged_in', 'true');
          localStorage.setItem('cdpm_logged_user', normalizedUser);
        } else {
          sessionStorage.setItem('cdpm_logged_in', 'true');
          sessionStorage.setItem('cdpm_logged_user', normalizedUser);
        }
        onLoginSuccess(normalizedUser);
      } else {
        setError('Tài khoản hoặc mật khẩu không chính xác. Thử "admin" / "admin123".');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden font-sans select-none antialiased">
      {/* Decorative ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse translate-x-1/2 translate-y-1/2" />

      {/* Main card box */}
      <div className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl relative z-10 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        {/* Top brand header */}
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100 relative">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto shadow-md mb-3.5">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-black tracking-wider text-slate-900 uppercase">CD Profile Manager</h1>
          <p className="text-xs text-slate-500 mt-1">Đăng nhập vào bảng điều khiển máy ảo chống phát hiện</p>
          
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-100 border border-emerald-200 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
            <ShieldCheck className="w-2.5 h-2.5" />
            <span>SSL SECURE</span>
          </div>
        </div>

        {/* Login form contents */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-lg text-xs flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Tên tài khoản (User)</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                placeholder="Ví dụ: admin"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition"
              />
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Mật khẩu (Password)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 pl-9 pr-9 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition"
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="text-slate-400 hover:text-slate-700 absolute right-3 top-2 cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Remember Me box */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-slate-800 focus:ring-slate-800 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="font-medium">Duy trì đăng nhập</span>
            </label>
            
            <span className="text-[11px] text-slate-400 hover:text-slate-600 transition cursor-default">Quên mật khẩu?</span>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-slate-850 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:bg-slate-400"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xử lý đăng nhập...</span>
              </span>
            ) : (
              <span>Đăng nhập hệ thống</span>
            )}
          </button>
        </form>

        {/* Form Footer / Hints */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 leading-normal">
          <p className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider mb-1 flex items-center gap-1">
            💡 Gợi ý truy cập:
          </p>
          <p>Sử dụng tài khoản thử nghiệm <strong className="text-slate-850">admin</strong> với mật khẩu <strong className="text-slate-850">admin123</strong> (hoặc <strong className="text-slate-850">user</strong> / <strong className="text-slate-850">123456</strong>) để đăng nhập nhanh.</p>
        </div>
      </div>
    </div>
  );
};
