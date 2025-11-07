import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

const DATA_MANAGER_API = 'https://functions.poehali.dev/8181fa7b-ed7e-4e77-acb1-1f69039b9fd9';
const PRODUCTS_API = 'https://functions.poehali.dev/d21add4f-1d9e-4a84-92ca-f909205b9b38';
const CATEGORIES_API = 'https://functions.poehali.dev/18f56703-a9d5-4d5d-ac38-86c6f3079366';

interface Service {
  id?: number;
  title: string;
  description: string;
  price: string;
  icon: string;
}

interface Article {
  id?: number;
  title: string;
  content: string;
  image: string;
  date: string;
}

interface AboutItem {
  id?: number;
  title: string;
  description: string;
  icon: string;
}

interface Advantage {
  id?: number;
  title: string;
  description: string;
  icon: string;
}

interface Partner {
  id?: number;
  name: string;
  logo: string;
}

interface Hero {
  title: string;
  highlightedText: string;
  subtitle: string;
  description: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  items: any[];
  total_amount: string;
  status: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number | null;
  is_service: boolean;
  category_name?: string;
}

const Admin = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [about, setAbout] = useState<AboutItem[]>([]);
  const [advantages, setAdvantages] = useState<Advantage[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [hero, setHero] = useState<Hero>({
    title: '',
    highlightedText: '',
    subtitle: '',
    description: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    is_service: false,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
  });

  useEffect(() => {
    loadAllData();
    loadCategories();
    loadProducts();
  }, []);

  const loadAllData = async () => {
    try {
      const response = await fetch(`${DATA_MANAGER_API}?type=all`);
      const data = await response.json();
      
      setServices(data.services || []);
      setArticles(data.articles || []);
      setAbout(data.about || []);
      setAdvantages(data.advantages || []);
      setPartners(data.partners || []);
      setOrders(data.orders || []);
      
      if (data.hero) {
        setHero({
          title: data.hero.title || '',
          highlightedText: data.hero.highlighted_text || '',
          subtitle: data.hero.subtitle || '',
          description: data.hero.description || '',
        });
      }
    } catch (error) {
      toast.error('Ошибка загрузки данных');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_API);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error('Ошибка загрузки категорий');
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast.error('Ошибка загрузки товаров');
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${DATA_MANAGER_API}?type=bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          services,
          articles,
          about,
          advantages,
          partners,
          hero,
        }),
      });

      if (response.ok) {
        toast.success('✅ Все данные сохранены в базе!');
        await loadAllData();
      } else {
        toast.error('Ошибка сохранения данных');
      }
    } catch (error) {
      toast.error('Ошибка сохранения данных');
    } finally {
      setSaving(false);
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.services) setServices(data.services);
      if (data.articles) setArticles(data.articles);
      if (data.about) setAbout(data.about);
      if (data.advantages) setAdvantages(data.advantages);
      if (data.partners) setPartners(data.partners);
      if (data.hero) setHero(data.hero);

      toast.success('Данные импортированы. Нажмите "Сохранить в базу"!');
    } catch (error) {
      toast.error('Ошибка чтения файла');
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      services,
      articles,
      about,
      advantages,
      partners,
      hero,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(CATEGORIES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        toast.success('Категория создана');
        setCategoryForm({ name: '', slug: '', description: '' });
        loadCategories();
      } else {
        toast.error('Ошибка создания категории');
      }
    } catch (error) {
      toast.error('Ошибка создания категории');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(PRODUCTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          category_id: productForm.category_id ? parseInt(productForm.category_id) : null,
        }),
      });

      if (response.ok) {
        toast.success('Товар создан');
        setProductForm({
          name: '',
          slug: '',
          description: '',
          price: '',
          image_url: '',
          category_id: '',
          is_service: false,
        });
        loadProducts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Ошибка создания товара');
      }
    } catch (error) {
      toast.error('Ошибка создания товара');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\wа-яё\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const addService = () => {
    setServices([...services, { title: '', description: '', price: '', icon: 'Wrench' }]);
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const deleteService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addArticle = () => {
    setArticles([...articles, { title: '', content: '', image: '', date: new Date().toLocaleDateString('ru-RU') }]);
  };

  const updateArticle = (index: number, field: keyof Article, value: string) => {
    const updated = [...articles];
    updated[index] = { ...updated[index], [field]: value };
    setArticles(updated);
  };

  const deleteArticle = (index: number) => {
    setArticles(articles.filter((_, i) => i !== index));
  };

  const addAbout = () => {
    setAbout([...about, { title: '', description: '', icon: 'Info' }]);
  };

  const updateAbout = (index: number, field: keyof AboutItem, value: string) => {
    const updated = [...about];
    updated[index] = { ...updated[index], [field]: value };
    setAbout(updated);
  };

  const deleteAbout = (index: number) => {
    setAbout(about.filter((_, i) => i !== index));
  };

  const addAdvantage = () => {
    setAdvantages([...advantages, { title: '', description: '', icon: 'Star' }]);
  };

  const updateAdvantage = (index: number, field: keyof Advantage, value: string) => {
    const updated = [...advantages];
    updated[index] = { ...updated[index], [field]: value };
    setAdvantages(updated);
  };

  const deleteAdvantage = (index: number) => {
    setAdvantages(advantages.filter((_, i) => i !== index));
  };

  const addPartner = () => {
    setPartners([...partners, { name: '', logo: '' }]);
  };

  const updatePartner = (index: number, field: keyof Partner, value: string) => {
    const updated = [...partners];
    updated[index] = { ...updated[index], [field]: value };
    setPartners(updated);
  };

  const deletePartner = (index: number) => {
    setPartners(partners.filter((_, i) => i !== index));
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      const response = await fetch(`${DATA_MANAGER_API}?type=orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      });

      if (response.ok) {
        toast.success('Статус заказа обновлен');
        await loadAllData();
      } else {
        toast.error('Ошибка обновления статуса');
      }
    } catch (error) {
      toast.error('Ошибка обновления статуса');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h1 className="text-2xl font-bold">Админ-панель</h1>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/'}>
                <Icon name="Home" className="mr-2 h-4 w-4" />
                На главную
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                <Icon name="Download" className="mr-2 h-4 w-4" />
                Экспорт
              </Button>
              <Button variant="outline" size="sm" asChild>
                <label>
                  <Icon name="Upload" className="mr-2 h-4 w-4" />
                  Импорт
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </Button>
              <Button onClick={handleSaveAll} disabled={saving} size="lg" className="font-bold">
                <Icon name="Save" className="mr-2 h-5 w-5" />
                {saving ? 'Сохранение...' : 'СОХРАНИТЬ В БАЗУ'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="catalog" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-8 mb-8">
            <TabsTrigger value="catalog">Каталог</TabsTrigger>
            <TabsTrigger value="hero">Главная</TabsTrigger>
            <TabsTrigger value="services">Услуги</TabsTrigger>
            <TabsTrigger value="articles">Статьи</TabsTrigger>
            <TabsTrigger value="about">О компании</TabsTrigger>
            <TabsTrigger value="advantages">Преимущества</TabsTrigger>
            <TabsTrigger value="partners">Партнеры</TabsTrigger>
            <TabsTrigger value="orders">Заказы ({orders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="catalog">
            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Создать категорию</CardTitle>
                  <CardDescription>Добавьте новую категорию товаров</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCategory} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cat-name">Название</Label>
                      <Input
                        id="cat-name"
                        placeholder="Слуховые аппараты"
                        value={categoryForm.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setCategoryForm({
                            ...categoryForm,
                            name,
                            slug: generateSlug(name),
                          });
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cat-slug">Slug (URL)</Label>
                      <Input
                        id="cat-slug"
                        placeholder="hearing-aids"
                        value={categoryForm.slug}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, slug: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cat-desc">Описание</Label>
                      <Textarea
                        id="cat-desc"
                        placeholder="Современные слуховые аппараты"
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm({ ...categoryForm, description: e.target.value })
                        }
                      />
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Создать категорию
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Создать товар/услугу</CardTitle>
                  <CardDescription>Добавьте новый товар или услугу</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prod-name">Название</Label>
                      <Input
                        id="prod-name"
                        placeholder="Слуховой аппарат Signia"
                        value={productForm.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setProductForm({
                            ...productForm,
                            name,
                            slug: generateSlug(name),
                          });
                        }}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prod-slug">Slug (URL)</Label>
                      <Input
                        id="prod-slug"
                        placeholder="signia-hearing-aid"
                        value={productForm.slug}
                        onChange={(e) =>
                          setProductForm({ ...productForm, slug: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prod-desc">Описание</Label>
                      <Textarea
                        id="prod-desc"
                        placeholder="Описание товара"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({ ...productForm, description: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prod-price">Цена (₽)</Label>
                      <Input
                        id="prod-price"
                        type="number"
                        placeholder="25000"
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({ ...productForm, price: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prod-image">URL изображения</Label>
                      <Input
                        id="prod-image"
                        placeholder="https://example.com/image.jpg"
                        value={productForm.image_url}
                        onChange={(e) =>
                          setProductForm({ ...productForm, image_url: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prod-category">Категория</Label>
                      <select
                        id="prod-category"
                        value={productForm.category_id}
                        onChange={(e) =>
                          setProductForm({ ...productForm, category_id: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="">Выберите категорию</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="prod-service"
                        type="checkbox"
                        checked={productForm.is_service}
                        onChange={(e) =>
                          setProductForm({ ...productForm, is_service: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <Label htmlFor="prod-service" className="text-sm font-normal">
                        Это услуга
                      </Label>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Создать товар
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Существующие категории ({categories.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-sm text-muted-foreground">{cat.slug}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Существующие товары ({products.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {products.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{prod.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{prod.price} ₽</span>
                            {prod.category_name && <span>• {prod.category_name}</span>}
                            {prod.is_service && <span>• Услуга</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Главный экран</CardTitle>
                <CardDescription>Редактировать текст на главном экране</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Заголовок</Label>
                  <Input
                    value={hero.title}
                    onChange={(e) => setHero({ ...hero, title: e.target.value })}
                    placeholder="ОТКРОЙТЕ ДЛЯ СЕБЯ"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Выделенный текст</Label>
                  <Input
                    value={hero.highlightedText}
                    onChange={(e) => setHero({ ...hero, highlightedText: e.target.value })}
                    placeholder="МИР ЧЕТКОГО ЗВУКА"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Подзаголовок</Label>
                  <Input
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    placeholder="С НАШИМИ РЕШЕНИЯМИ!"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={hero.description}
                    onChange={(e) => setHero({ ...hero, description: e.target.value })}
                    placeholder="Инновационные слуховые технологии..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Услуги ({services.length})</CardTitle>
                <CardDescription>Управление услугами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {services.map((service, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label>Услуга #{index + 1}</Label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteService(index)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Название"
                        value={service.title}
                        onChange={(e) => updateService(index, 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder="Описание"
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                      />
                      <Input
                        placeholder="Цена"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', e.target.value)}
                      />
                      <Input
                        placeholder="Иконка (lucide icon name)"
                        value={service.icon}
                        onChange={(e) => updateService(index, 'icon', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addService} className="w-full">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить услугу
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>Статьи ({articles.length})</CardTitle>
                <CardDescription>Управление статьями</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {articles.map((article, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label>Статья #{index + 1}</Label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteArticle(index)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Заголовок"
                        value={article.title}
                        onChange={(e) => updateArticle(index, 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder="Содержание"
                        value={article.content}
                        onChange={(e) => updateArticle(index, 'content', e.target.value)}
                        rows={4}
                      />
                      <Input
                        placeholder="URL изображения"
                        value={article.image}
                        onChange={(e) => updateArticle(index, 'image', e.target.value)}
                      />
                      <Input
                        placeholder="Дата"
                        value={article.date}
                        onChange={(e) => updateArticle(index, 'date', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addArticle} className="w-full">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить статью
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>О компании ({about.length})</CardTitle>
                <CardDescription>Управление блоками о компании</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {about.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label>Блок #{index + 1}</Label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAbout(index)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Заголовок"
                        value={item.title}
                        onChange={(e) => updateAbout(index, 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder="Описание"
                        value={item.description}
                        onChange={(e) => updateAbout(index, 'description', e.target.value)}
                      />
                      <Input
                        placeholder="Иконка"
                        value={item.icon}
                        onChange={(e) => updateAbout(index, 'icon', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addAbout} className="w-full">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить блок
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advantages">
            <Card>
              <CardHeader>
                <CardTitle>Преимущества ({advantages.length})</CardTitle>
                <CardDescription>Управление преимуществами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {advantages.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label>Преимущество #{index + 1}</Label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteAdvantage(index)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Заголовок"
                        value={item.title}
                        onChange={(e) => updateAdvantage(index, 'title', e.target.value)}
                      />
                      <Textarea
                        placeholder="Описание"
                        value={item.description}
                        onChange={(e) => updateAdvantage(index, 'description', e.target.value)}
                      />
                      <Input
                        placeholder="Иконка"
                        value={item.icon}
                        onChange={(e) => updateAdvantage(index, 'icon', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addAdvantage} className="w-full">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить преимущество
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle>Партнеры ({partners.length})</CardTitle>
                <CardDescription>Управление партнерами</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {partners.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label>Партнер #{index + 1}</Label>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deletePartner(index)}
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Название"
                        value={item.name}
                        onChange={(e) => updatePartner(index, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="URL логотипа"
                        value={item.logo}
                        onChange={(e) => updatePartner(index, 'logo', e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addPartner} className="w-full">
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить партнера
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Заказы ({orders.length})</CardTitle>
                <CardDescription>Управление заказами с сайта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Заказов пока нет</p>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-lg">{order.customer_name}</p>
                              <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                              {order.customer_email && (
                                <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{order.total_amount}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleString('ru-RU')}
                              </p>
                            </div>
                          </div>
                          
                          <div className="border-t pt-3">
                            <Label className="text-xs">Товары:</Label>
                            {JSON.parse(order.items as any).map((item: any, idx: number) => (
                              <div key={idx} className="text-sm mt-1">
                                • {item.name} x{item.quantity} - {item.price}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant={order.status === 'new' ? 'default' : 'outline'}
                              onClick={() => updateOrderStatus(order.id, 'new')}
                            >
                              Новый
                            </Button>
                            <Button
                              size="sm"
                              variant={order.status === 'processing' ? 'default' : 'outline'}
                              onClick={() => updateOrderStatus(order.id, 'processing')}
                            >
                              В работе
                            </Button>
                            <Button
                              size="sm"
                              variant={order.status === 'completed' ? 'default' : 'outline'}
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                            >
                              Выполнен
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
