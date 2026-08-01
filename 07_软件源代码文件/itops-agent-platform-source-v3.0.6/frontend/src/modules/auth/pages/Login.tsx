import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../lib/api';
import { getAxiosErrorMessage } from '@/lib/errorHandler';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const submittedUsername = String(formData.get('username') || username).trim();
    const submittedPassword = String(formData.get('password') || password);

    try {
      const response = await api.post('/auth/login', {
        username: submittedUsername,
        password: submittedPassword,
      });
      const loginResponse = response.data;
      const loginData = loginResponse?.data;

      if (loginResponse?.success && loginData?.token && loginData?.user) {
        login(loginData.token, loginData.user, loginData.refreshToken);
        navigate(loginData.user.passwordMustChange ? '/force-password-change' : '/dashboard', { replace: true });
      } else {
        setError('登录响应缺少用户信息');
      }
    } catch (err: unknown) {
      setError(getAxiosErrorMessage(err, '网络错误，请稍后重试'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#111318] px-4 py-10 text-slate-100">
      <main className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-md border border-sky-400/20 bg-sky-400/10">
            <Activity className="h-5 w-5 text-sky-300" />
          </div>
          <div>
            <h1 className="text-base font-semibold">ITOps Agent</h1>
            <p className="text-xs text-slate-400">运维自动化控制台</p>
          </div>
        </div>

        <section className="rounded-lg border border-[#30343c] bg-[#1a1d23] p-6 shadow-2xl shadow-black/20">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">登录</h2>
            <p className="mt-1 text-sm text-slate-400">使用平台账号进入工作台</p>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-start gap-3 rounded-md border border-rose-400/20 bg-rose-400/10 p-3 text-rose-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="text-sm leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-200">用户名</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input id="username" type="text" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入用户名" className="h-11 w-full rounded-md border border-[#3a3f48] bg-[#111318] pl-10 pr-3 text-sm text-white placeholder-slate-500 transition-colors hover:border-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" required />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-200">密码</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input id="password" type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" className="h-11 w-full rounded-md border border-[#3a3f48] bg-[#111318] pl-10 pr-11 text-sm text-white placeholder-slate-500 transition-colors hover:border-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20" required />
                <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-white/5 hover:text-white" aria-label={showPassword ? '隐藏密码' : '显示密码'}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />登录中...</> : <>登录<ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
        </section>

        <p className="mt-5 text-center text-xs text-slate-500">受保护的运维管理入口</p>
      </main>
    </div>
  );
}
