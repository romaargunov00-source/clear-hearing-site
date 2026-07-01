import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
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

  const handleLogin = async () => {
    if (!password.trim()) return;
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

  if (!loginChecked) {
    return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
              <Icon name="Ear" size={32} className="text-white" />
            </div>
            <CardTitle className="text-2xl">Админ-панель</CardTitle>
            <p className="text-sm text-muted-foreground">Ясный слух — центр слуховых аппаратов</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{loginMode === "setup" ? "Создать пароль" : "Пароль"}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder={loginMode === "setup" ? "Придумайте пароль (мин. 4 символа)" : "Введите пароль"}
                autoFocus
              />
              {loginMode === "setup" && (
                <p className="text-xs text-muted-foreground">Первый вход — установите пароль для админ-панели</p>
              )}
            </div>
            <Button onClick={handleLogin} disabled={loginLoading} className="w-full bg-primary hover:bg-primary/90 text-white">
              {loginLoading ? "..." : loginMode === "setup" ? "Установить и войти" : "Войти"}
            </Button>
            <a href="/" className="block text-center text-sm text-muted-foreground hover:text-primary transition">
              ← Вернуться на сайт
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navItems: { key: Section; label: string; icon: string }[] = [
    { key: "hero", label: "Баннер", icon: "Image" },
    { key: "orders", label: "Заказы", icon: "ShoppingCart" },
    { key: "products", label: "Товары", icon: "Package" },
    { key: "categories", label: "Категории", icon: "FolderTree" },
    { key: "services", label: "Услуги", icon: "Briefcase" },
    { key: "articles", label: "Статьи", icon: "Newspaper" },
    { key: "about_items", label: "О компании", icon: "Info" },
    { key: "advantages", label: "Преимущества", icon: "Sparkles" },
    { key: "partners", label: "Партнёры", icon: "Handshake" },
    { key: "settings", label: "Настройки", icon: "Settings" },
  ];

  const renderSection = () => {
    if (section === "hero") {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Баннер главной страницы</h2>
          {heroLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}
            </div>
          ) : (
            <Card>
              <CardContent className="space-y-4 py-4">
                {heroFields.map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <Label>{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        value={heroData[field.key] || ""}
                        onChange={(e) => setHeroData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        rows={4}
                      />
                    ) : (
                      <Input
                        value={heroData[field.key] || ""}
                        onChange={(e) => setHeroData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
                <Button onClick={handleHeroSave} disabled={heroSaving} className="bg-primary hover:bg-primary/90 text-white">
                  {heroSaving ? "Сохранение..." : "Сохранить баннер"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (section === "orders") {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Заказы</h2>
          {ordersLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
            </div>
          ) : orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Icon name="Inbox" size={48} className="mx-auto mb-4 opacity-50" />
                <p>Заказов пока нет</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold">№ {order.id.slice(0, 8)}</span>
                          <Badge className={statusColor(order.status)}>{statusLabel(order.status)}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <p className="text-sm">
                          {order.customer_first_name} {order.customer_last_name} — {order.customer_phone}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">{order.customer_address}</p>
                        <p className="font-bold text-primary">{order.total.toLocaleString("ru-RU")} ₽</p>
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Select value={order.status} onValueChange={(v) => handleOrderStatusChange(order.id, v)}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {orderStatusOptions.map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (expandedOrder === order.id) {
                              setExpandedOrder(null);
                            } else {
                              setExpandedOrder(order.id);
                              fetchOrderItems(order.id);
                            }
                          }}
                        >
                          <Icon name={expandedOrder === order.id ? "ChevronUp" : "ChevronDown"} className="mr-1" size={16} />
                          Детали
                        </Button>
                      </div>
                    </div>
                    {expandedOrder === order.id && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {orderItemsLoading ? (
                          <p className="text-sm text-muted-foreground">Загрузка...</p>
                        ) : (
                          <>
                            <div className="space-y-1">
                              {orderItems.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm py-1">
                                  <span>{item.product_name} × {item.quantity}</span>
                                  <span className="font-medium">{(item.price * item.quantity).toLocaleString("ru-RU")} ₽</span>
                                </div>
                              ))}
                              {orderItems.length === 0 && <p className="text-sm text-muted-foreground">Состав заказа недоступен</p>}
                            </div>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              {order.customer_email && <p>Email: {order.customer_email}</p>}
                              {order.customer_comment && <p>Комментарий: {order.customer_comment}</p>}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (section === "settings") {
      return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Настройки</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Сменить пароль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Текущий пароль</Label>
                <Input type="password" value={settingsCurrent} onChange={(e) => setSettingsCurrent(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Новый пароль</Label>
                <Input type="password" value={settingsNew} onChange={(e) => setSettingsNew(e.target.value)} />
              </div>
              <Button onClick={handleChangePassword} disabled={settingsLoading} className="bg-primary hover:bg-primary/90 text-white">
                {settingsLoading ? "..." : "Сменить пароль"}
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <Button onClick={handleLogout} variant="outline" className="text-destructive hover:text-destructive">
                <Icon name="LogOut" className="mr-2" size={18} />
                Выйти из админ-панели
              </Button>
            </CardContent>
          </Card>
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
    <div className="min-h-screen bg-slate-50">
      {/* Top bar (mobile) */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="Ear" size={18} className="text-white" />
          </div>
          <span className="font-bold">Админ-панель</span>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setSidebarOpen(true)}>
          <Icon name="Menu" size={24} />
        </Button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-50 lg:z-auto
          h-screen w-64 bg-white border-r flex-shrink-0
          flex flex-col transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Icon name="Ear" size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-sm">Ясный слух</p>
                <p className="text-xs text-muted-foreground">Админ-панель</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { setSection(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${section === item.key ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-2 border-t space-y-1">
            <a href="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition">
              <Icon name="ExternalLink" size={18} />
              Открыть сайт
            </a>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-red-50 transition">
              <Icon name="LogOut" size={18} />
              Выйти
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-8 max-w-5xl">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
