import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import CrudManager from "@/admin/CrudManager";
import { entityConfigs, heroFields, orderStatusOptions } from "@/admin/entityConfigs";

const AUTH_KEY = "yasny-slukh-admin-auth";
const AUTH_TTL = 4 * 60 * 60 * 1000;

type Section = "hero" | "orders" | "products" | "categories" | "services" | "articles" | "about_items" | "advantages" | "partners" | "settings";

interface OrderRow {
  id: string;
  total: number;
  status: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string;
  customer_comment: string | null;
  date: string;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export default function Admin() {
  const { toast } = useToast();
  const [authed, setAuthed] = useState(false);
  const [loginChecked, setLoginChecked] = useState(false);
  const [section, setSection] = useState<Section>("hero");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Login state
  const [loginMode, setLoginMode] = useState<"login" | "setup">("login");
  const [loginUsername, setLoginUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);

  // Hero state
  const [heroData, setHeroData] = useState<Record<string, string>>({});
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroSaving, setHeroSaving] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [orderItemsLoading, setOrderItemsLoading] = useState(false);

  // Settings state
  const [settingsCurrent, setSettingsCurrent] = useState("");
  const [settingsNew, setSettingsNew] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const ts = parseInt(stored, 10);
      if (Date.now() - ts < AUTH_TTL) {
        setAuthed(true);
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setLoginChecked(true);
  }, []);

  const checkHasPassword = useCallback(async () => {
    const { data, error } = await supabase.from("admin_credentials").select("id").limit(1);
    if (!error) {
      setHasPassword(data && data.length > 0);
      setLoginMode(data && data.length > 0 ? "login" : "setup");
    }
  }, []);

  useEffect(() => {
    if (loginChecked && !authed) {
      checkHasPassword();
    }
  }, [loginChecked, authed, checkHasPassword]);

  const callAuthApi = async (action: string, body: Record<string, string>) => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-auth?action=${action}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Ошибка запроса");
    return json;
  };

  const ADMIN_USERNAME = "yasn_admin!27_vxod";

  const handleLogin = async () => {
    if (!password.trim()) return;
    if (loginMode !== "setup" && loginUsername.trim() !== ADMIN_USERNAME) {
      toast({ title: "Неверный логин", description: "Проверьте логин и попробуйте снова", variant: "destructive" });
      return;
    }
    setLoginLoading(true);
    try {
      if (loginMode === "setup") {
        if (password.length < 4) {
          toast({ title: "Пароль слишком короткий", description: "Минимум 4 символа", variant: "destructive" });
          setLoginLoading(false);
          return;
        }
        await callAuthApi("setup", { password });
        toast({ title: "Пароль установлен", description: "Вход выполнен" });
      } else {
        await callAuthApi("login", { password });
        toast({ title: "Вход выполнен" });
      }
      localStorage.setItem(AUTH_KEY, Date.now().toString());
      setAuthed(true);
      setPassword("");
    } catch (err) {
      toast({ title: "Ошибка входа", description: err.message, variant: "destructive" });
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setSection("hero");
  };

  const handleChangePassword = async () => {
    if (!settingsCurrent.trim() || !settingsNew.trim()) return;
    if (settingsNew.length < 4) {
      toast({ title: "Новый пароль слишком короткий", description: "Минимум 4 символа", variant: "destructive" });
      return;
    }
    setSettingsLoading(true);
    try {
      await callAuthApi("change-password", { password: settingsCurrent, newPassword: settingsNew });
      toast({ title: "Пароль изменён" });
      setSettingsCurrent("");
      setSettingsNew("");
    } catch (err) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    }
    setSettingsLoading(false);
  };

  // Fetch categories for product select
  useEffect(() => {
    if (authed) {
      supabase.from("categories").select("id, name").order("name").then(({ data }) => {
        if (data) setCategories(data);
      });
    }
  }, [authed]);

  // Fetch hero
  useEffect(() => {
    if (authed && section === "hero") {
      setHeroLoading(true);
      supabase.from("hero").select("*").maybeSingle().then(({ data, error }) => {
        if (error) {
          toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
        }
        const initial: Record<string, string> = {};
        heroFields.forEach((f) => {
          initial[f.key] = data && data[f.key] ? String(data[f.key]) : "";
        });
        setHeroData(initial);
        setHeroLoading(false);
      });
    }
  }, [authed, section, toast]);

  const handleHeroSave = async () => {
    setHeroSaving(true);
    const payload: Record<string, string> = {};
    heroFields.forEach((f) => {
      payload[f.key] = heroData[f.key] || "";
    });
    const { data: existing } = await supabase.from("hero").select("id").maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from("hero").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("hero").insert(payload));
    }
    if (error) {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Баннер сохранён" });
    }
    setHeroSaving(false);
  };

  // Fetch orders
  useEffect(() => {
    if (authed && section === "orders") {
      setOrdersLoading(true);
      supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
        if (error) {
          toast({ title: "Ошибка загрузки", description: error.message, variant: "destructive" });
        }
        setOrders((data || []) as OrderRow[]);
        setOrdersLoading(false);
      });
    }
  }, [authed, section, toast]);

  const fetchOrderItems = async (orderId: string) => {
    setOrderItemsLoading(true);
    const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    }
    setOrderItems((data || []) as OrderItemRow[]);
    setOrderItemsLoading(false);
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } else {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      toast({ title: "Статус обновлён" });
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const statusLabel = (status: string) => orderStatusOptions.find((o) => o.value === status)?.label || status;

  const handleExportExcel = () => {
    const rows = orders.map((o) => ({
      "№": o.id.slice(0, 8),
      "Дата": new Date(o.created_at).toLocaleString("ru-RU"),
      "Статус": statusLabel(o.status),
      "Имя": o.customer_first_name,
      "Фамилия": o.customer_last_name,
      "Телефон": o.customer_phone,
      "Email": o.customer_email || "",
      "Адрес": o.customer_address,
      "Комментарий": o.customer_comment || "",
      "Сумма (₽)": o.total,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Заказы");
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Заказы_${dateStr}.xlsx`);
  };

  if (!loginChecked) {
    return <div className="min-h-screen flex items-center justify-center bg-white"><div className="h-6 w-6 border-2 border-[#1a3a5c] border-t-transparent animate-spin" /></div>;
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-[#1a3a5c] tracking-tight">Ясный СЛУХ</h1>
            <p className="text-xs text-gray-500 mt-1">Панель администратора</p>
          </div>
          <div className="border border-gray-300 p-6">
            {loginMode === "setup" ? (
              <div className="space-y-3">
                <div>
                  <Label className="block text-xs font-bold text-gray-700 mb-1">Создать пароль</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="Минимум 4 символа"
                    autoFocus
                    className="rounded-none border-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-500">Первый вход — установите пароль</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <Label className="block text-xs font-bold text-gray-700 mb-1">Логин</Label>
                    <Input
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="Введите логин"
                      autoFocus
                      className="rounded-none border-gray-400"
                    />
                  </div>
                  <div>
                    <Label className="block text-xs font-bold text-gray-700 mb-1">Пароль</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      placeholder="Введите пароль"
                      className="rounded-none border-gray-400"
                    />
                  </div>
                </div>
              </>
            )}
            <button
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full mt-4 bg-[#1a3a5c] hover:bg-[#0f2a44] text-white py-2.5 text-sm font-bold transition-colors disabled:opacity-50"
            >
              {loginLoading ? "..." : loginMode === "setup" ? "Установить и войти" : "Войти"}
            </button>
          </div>
          <div className="text-center mt-4">
            <a href="/" className="text-xs text-gray-500 hover:text-[#1a3a5c]">← Вернуться на сайт</a>
          </div>
        </div>
      </div>
    );
  }

  const navItems: { key: Section; label: string }[] = [
    { key: "hero", label: "Баннер" },
    { key: "orders", label: "Заказы" },
    { key: "products", label: "Товары" },
    { key: "categories", label: "Категории" },
    { key: "services", label: "Услуги" },
    { key: "articles", label: "Статьи" },
    { key: "about_items", label: "О компании" },
    { key: "advantages", label: "Преимущества" },
    { key: "partners", label: "Партнёры" },
    { key: "settings", label: "Настройки" },
  ];

  const renderSection = () => {
    if (section === "hero") {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a3a5c]">Баннер главной страницы</h2>
          {heroLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="border border-gray-300 p-5 space-y-4">
              {heroFields.map((field) => (
                <div key={field.key} className="space-y-1">
                  <Label className="block text-xs font-bold text-gray-700">
                    {field.label}{field.required && <span className="text-red-700 ml-1">*</span>}
                  </Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={heroData[field.key] || ""}
                      onChange={(e) => setHeroData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      rows={4}
                      className="rounded-none border-gray-400"
                    />
                  ) : (
                    <Input
                      value={heroData[field.key] || ""}
                      onChange={(e) => setHeroData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      className="rounded-none border-gray-400"
                    />
                  )}
                </div>
              ))}
              <button onClick={handleHeroSave} disabled={heroSaving} className="bg-[#1a3a5c] hover:bg-[#0f2a44] text-white px-5 py-2 text-sm font-bold transition-colors disabled:opacity-50">
                {heroSaving ? "Сохранение..." : "Сохранить баннер"}
              </button>
            </div>
          )}
        </div>
      );
    }

    if (section === "orders") {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-[#1a3a5c]">Заказы</h2>
            {orders.length > 0 && (
              <button onClick={handleExportExcel} className="border border-gray-400 hover:bg-gray-100 px-4 py-2 text-sm font-bold transition-colors">
                Экспорт в Excel
              </button>
            )}
          </div>
          {ordersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-gray-300 py-12 text-center text-gray-500">
              <p className="text-sm">Заказов пока нет</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-300 p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm">№ {order.id.slice(0, 8)}</span>
                        <Badge className={`${statusColor(order.status)} rounded-none border border-gray-300`}>{statusLabel(order.status)}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleString("ru-RU")}
                        </span>
                      </div>
                      <p className="text-sm">
                        {order.customer_first_name} {order.customer_last_name} — {order.customer_phone}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{order.customer_address}</p>
                      <p className="font-bold text-sm text-[#1a3a5c]">{order.total.toLocaleString("ru-RU")} ₽</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Select value={order.status} onValueChange={(v) => handleOrderStatusChange(order.id, v)}>
                        <SelectTrigger className="w-40 rounded-none border-gray-400"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {orderStatusOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <button
                        className="border border-gray-400 hover:bg-gray-100 px-3 py-1.5 text-xs font-bold transition-colors"
                        onClick={() => {
                          if (expandedOrder === order.id) {
                            setExpandedOrder(null);
                          } else {
                            setExpandedOrder(order.id);
                            fetchOrderItems(order.id);
                          }
                        }}
                      >
                        {expandedOrder === order.id ? "Свернуть" : "Детали"}
                      </button>
                    </div>
                  </div>
                  {expandedOrder === order.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      {orderItemsLoading ? (
                        <p className="text-sm text-gray-500">Загрузка...</p>
                      ) : (
                        <>
                          <div className="space-y-1">
                            {orderItems.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm py-1">
                                <span>{item.product_name} × {item.quantity}</span>
                                <span className="font-medium">{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</span>
                              </div>
                            ))}
                            {orderItems.length === 0 && <p className="text-sm text-gray-500">Состав заказа недоступен</p>}
                          </div>
                          <div className="text-sm space-y-1 text-gray-500">
                            {order.customer_email && <p>Email: {order.customer_email}</p>}
                            {order.customer_comment && <p>Комментарий: {order.customer_comment}</p>}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (section === "settings") {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#1a3a5c]">Настройки</h2>
          <div className="border border-gray-300 p-5 space-y-4">
            <h3 className="text-sm font-bold text-gray-800">Сменить пароль</h3>
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">Текущий пароль</Label>
              <Input type="password" value={settingsCurrent} onChange={(e) => setSettingsCurrent(e.target.value)} className="rounded-none border-gray-400" />
            </div>
            <div>
              <Label className="block text-xs font-bold text-gray-700 mb-1">Новый пароль</Label>
              <Input type="password" value={settingsNew} onChange={(e) => setSettingsNew(e.target.value)} className="rounded-none border-gray-400" />
            </div>
            <button onClick={handleChangePassword} disabled={settingsLoading} className="bg-[#1a3a5c] hover:bg-[#0f2a44] text-white px-5 py-2 text-sm font-bold transition-colors disabled:opacity-50">
              {settingsLoading ? "..." : "Сменить пароль"}
            </button>
          </div>
          <div className="border border-gray-300 p-5">
            <button onClick={handleLogout} className="border border-red-700 text-red-700 hover:bg-red-50 px-5 py-2 text-sm font-bold transition-colors">
              Выйти из админ-панели
            </button>
          </div>
        </div>
      );
    }

    const config = entityConfigs[section];
    if (config) {
      return <CrudManager key={section} config={config} categories={categories} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
      {/* Top bar (mobile) */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#1a3a5c] border-b border-gray-300 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-white text-sm">Ясный СЛУХ — Админ-панель</span>
        <button onClick={() => setSidebarOpen(true)} className="text-white">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          h-screen w-56 bg-white border-r border-gray-300 flex-shrink-0
          flex flex-col transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="px-4 py-4 border-b border-gray-300">
            <p className="font-bold text-sm text-[#1a3a5c]">Ясный СЛУХ</p>
            <p className="text-xs text-gray-500">Панель администратора</p>
          </div>
          <nav className="flex-1 overflow-y-auto py-2">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setSection(item.key); setSidebarOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium border-l-4 transition-colors
                  ${section === item.key ? "border-[#1a3a5c] bg-gray-100 text-[#1a3a5c] font-bold" : "border-transparent text-gray-700 hover:bg-gray-50"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="border-t border-gray-300 py-2">
            <a href="/" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Открыть сайт
            </a>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors">
              Выйти
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 max-w-5xl">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
