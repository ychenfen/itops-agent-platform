import { useEffect, useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';
import {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  LayoutDashboard,
  Bot,
  Brain,
  GitBranch,
  Play,
  Bell,
  BookOpen,
  FileCode,
  Settings,
  Server,
  Shield,
  FileText,
  MessageSquare,
  Clock,
  Link2,
  Users,
  Search,
  LogOut,
  User as UserIcon,
  Terminal,
  Globe,
  Layers,
  Monitor,
  MonitorPlay,
  Wrench,
  ListChecks,
  BarChart3,
  Network,
  Sun,
  Moon,
  Key,
  Lightbulb,
  Workflow,
  ChevronDown,
  ChevronRight,
  Home,
  ServerCog,
  Zap,
  AlertTriangle,
  Activity,
  ShieldCheck,
  BookMarked,
  Cog,
  FlaskConical,
  Radio,
  Database,
  Box,
  HardDrive,
  Cpu,
  Building2,
  Image as ImageIcon,
  Container,
  DollarSign,
  TrendingUp,
  LayoutGrid,
  Router,
  Camera,
  Package,
  Menu,
  X,
  /* eslint-enable @typescript-eslint/no-unused-vars */
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ChatWidget from '../../modules/ai/components/ChatWidget';
import { navigationGroups } from '../../config/navigation';

export default function Layout() {
  const { t } = useTranslation();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set([])
  );

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const toggleAllGroups = () => {
    const allNames = navigationGroups.map(g => g.name);
    const allExpanded = allNames.every(n => expandedGroups.has(n));
    if (allExpanded) {
      setExpandedGroups(new Set());
    } else {
      setExpandedGroups(new Set(allNames));
    }
  };

  const allExpanded = navigationGroups.every(g => expandedGroups.has(g.name));

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const activeGroup = navigationGroups.find((group) =>
      group.items.some((item) => location.pathname === item.href || location.pathname.startsWith(`${item.href}/`))
    );
    if (activeGroup) {
      setExpandedGroups((current) => new Set(current).add(activeGroup.name));
    }
    setMobileOpen(false);
  }, [location.pathname]);

  // 使用 staleTime 优化查询，5分钟内使用缓存数据，避免频繁重新请求
  const { data: agentCount } = useQuery({
    queryKey: ['agents-count'],
    queryFn: async () => {
      const res = await api.get('/agents');
      return (res.data.data as Array<{ enabled: number }>).filter((a) => a.enabled === 1).length;
    },
    refetchInterval: 60000,
    staleTime: 5 * 60 * 1000,
  });

  const { data: workflowCount } = useQuery({
    queryKey: ['workflows-count'],
    queryFn: async () => {
      const res = await api.get('/workflows');
      return (res.data.data as Array<{ is_template: number }>).filter((w) => w.is_template === 1).length;
    },
    refetchInterval: 60000,
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleText = (role: string) => {
    const roleMap: Record<string, string> = {
      'admin': t('user.admin'),
      'operator': t('user.operator'),
      'viewer': t('user.viewer')
    };
    return roleMap[role] || role;
  };

  return (
    <div className="flex h-screen bg-background text-text-primary">
      {mobileOpen && (
        <button type="button" aria-label="关闭导航" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-30 bg-black/50 md:hidden" />
      )}
      <aside className={clsx('fixed inset-y-0 left-0 z-40 w-60 flex flex-col border-r transition-transform duration-200 md:static md:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        theme === 'dark'
          ? 'bg-[#16191f] border-[#30343c]'
          : 'bg-white border-gray-200'
      )}>
        <div className={clsx('h-14 px-3 border-b flex items-center',
          theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
        )}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md overflow-hidden flex items-center justify-center bg-surface border border-border flex-shrink-0">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }} />
            </div>
            <div className="min-w-0">
              <h1 className={clsx('text-sm font-semibold truncate',
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              )}>ITOps Agent</h1>
              <p className={clsx('text-xs truncate',
                theme === 'dark' ? 'text-slate-400' : 'text-text-tertiary'
              )}>{t('app.subtitle')}</p>
            </div>
            <button type="button" onClick={() => setMobileOpen(false)} className="ml-auto grid h-9 w-9 place-items-center rounded-md text-text-secondary hover:bg-secondary md:hidden" aria-label="关闭导航">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto scrollbar-thin">
          {/* 一键折叠/展开 */}
          <button
            onClick={toggleAllGroups}
            className={clsx(
              'w-full flex items-center justify-center gap-1.5 px-3 min-h-9 rounded-md text-xs font-medium transition-colors',
              theme === 'dark'
                ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                : 'text-text-tertiary hover:text-gray-700 hover:bg-gray-100/50'
            )}
            title={allExpanded ? t('app.collapseAll') : t('app.expandAll')}
          >
            {allExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {allExpanded ? t('app.collapseAll') : t('app.expandAll')}
          </button>
          {navigationGroups.map((group) => (
            <div key={group.name} className="space-y-0.5">
              <button
                onClick={() => toggleGroup(group.name)}
                className={clsx(
                  'w-full flex items-center gap-2 px-2.5 min-h-10 rounded-md text-sm font-medium transition-colors group',
                  theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    : 'text-text-tertiary hover:text-gray-700 hover:bg-gray-100/50'
                )}
              >
                <group.icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="flex-1 text-left">{t(group.name)}</span>
                {expandedGroups.has(group.name) ? (
                  <ChevronDown className="w-3 h-3 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                )}
              </button>
              
              {expandedGroups.has(group.name) && (
                <div className="pl-1 space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        clsx(
                          'flex items-center gap-2 px-2.5 min-h-9 rounded-md text-sm font-medium transition-colors group',
                          isActive
                            ? 'bg-primary/15 text-primary border border-primary/20'
                            : theme === 'dark'
                              ? 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                              : 'text-text-secondary hover:bg-gray-100 hover:text-gray-900'
                        )
                      }
                      onClick={() => setMobileOpen(false)}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {t(item.name)}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className={clsx('border-t',
          theme === 'dark' ? 'border-slate-700/50' : 'border-gray-200'
        )}>
          <div className="px-2 py-2">
            {user && (
              <div className="flex items-center gap-1.5 mb-2">
                <div className={clsx('flex items-center gap-2 px-2 py-2 rounded-md flex-1 min-w-0',
                  theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100'
                )}>
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                    <UserIcon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={clsx('text-xs font-semibold truncate leading-tight',
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    )}>
                      {user.username}
                    </p>
                    <p className="text-xs text-text-tertiary truncate leading-tight">
                      {getRoleText(user.role)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="grid h-9 w-9 place-items-center rounded-md text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                  title={t('app.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className={clsx('flex items-center justify-between rounded-md px-2 py-2 border',
              theme === 'dark'
                ? 'bg-surface border-border'
                : 'bg-gray-50 border border-gray-200'
            )}>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse shadow shadow-green-500/30" />
                <div>
                  <span className={clsx('text-xs font-semibold leading-tight',
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>{t('app.systemNormal')}</span>
                  <p className="text-[11px] text-text-tertiary leading-tight">
                    {agentCount ?? '...'} Agent · {workflowCount ?? '...'} Workflow
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={clsx('grid h-9 w-9 place-items-center rounded-md transition-colors flex-shrink-0',
                  theme === 'dark'
                    ? 'text-slate-400 hover:text-amber-300 hover:bg-slate-700/60'
                    : 'text-gray-400 hover:text-purple-600 hover:bg-gray-200'
                )}
                title={theme === 'dark' ? t('app.lightMode') : t('app.darkMode')}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 md:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-md text-text-secondary hover:bg-secondary" aria-label="打开导航">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">ITOps Agent</span>
          <span className="ml-auto inline-flex items-center gap-2 text-xs text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            系统正常
          </span>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>

      <ChatWidget />
    </div>
  );
}
