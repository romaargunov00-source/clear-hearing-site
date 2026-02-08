import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const STORAGE_KEY = 'yasniy_sluh_data';

interface Service {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
}

interface AboutItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Advantage {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

interface Hero {
  title: string;
  highlightedText: string;
  subtitle: string;
  description: string;
}

interface Order {
  id: string;
  items: any[];
  total: number;
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    address: string;
    comment: string;
  };
  date: string;
  status: 'new' | 'processing' | 'completed';
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
  specs: string;
  categoryId: string;
}

interface AppData {
  services: Service[];
  articles: Article[];
  about: AboutItem[];
  advantages: Advantage[];
  partners: Partner[];
  hero: Hero;
  orders: Order[];
  categories: Category[];
  products: Product[];
}

const Admin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AppData>({
    services: [],
    articles: [],
    about: [],
    advantages: [],
    partners: [],
    hero: {
      title: '',
      highlightedText: '',
      subtitle: '',
      description: '',
    },
    orders: [],
    categories: [],
    products: [],
  });

  const [newService, setNewService] = useState({ title: '', description: '', price: '', icon: 'Wrench' });
  const [newArticle, setNewArticle] = useState({ title: '', content: '', imageUrl: '', date: '' });
  const [newAbout, setNewAbout] = useState({ title: '', description: '', icon: 'Users' });
  const [newAdvantage, setNewAdvantage] = useState({ title: '', description: '', icon: 'CheckCircle' });
  const [newPartner, setNewPartner] = useState({ name: '', logoUrl: '' });
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'Package' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    imageUrl: '',
    price: '',
    description: '',
    specs: '',
    categoryId: ''
  });

  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setData({
          services: parsed.services || [],
          articles: parsed.articles || [],
          about: parsed.about || [],
          advantages: parsed.advantages || [],
          partners: parsed.partners || [],
          hero: parsed.hero || { title: '', highlightedText: '', subtitle: '', description: '' },
          orders: parsed.orders || [],
          categories: parsed.categories || [],
          products: parsed.products || [],
        });
      }
    } catch (e) {
      console.error('Failed to load data', e);
      toast.error('Ошибка загрузки данных');
    }
  };

  const saveData = (newData: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
    toast.success('Данные сохранены!');
  };

  const addService = async () => {
    if (!newService.title || !newService.description) {
      toast.error('Заполните все поля');
      return;
    }
    try {
      const { data: service, error } = await supabase.from('services').insert([newService]).select();
      if (error) throw error;
      if (service) {
        setData({ ...data, services: [...data.services, service[0]] });
        setNewService({ title: '', description: '', price: '', icon: 'Wrench' });
        toast.success('Услуга добавлена!');
      }
    } catch (e) {
      console.error('Error adding service', e);
      toast.error('Ошибка добавления услуги');
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, services: data.services.filter(s => s.id !== id) });
      toast.success('Услуга удалена!');
    } catch (e) {
      console.error('Error deleting service', e);
      toast.error('Ошибка удаления услуги');
    }
  };

  const addArticle = async () => {
    if (!newArticle.title || !newArticle.content) {
      toast.error('Заполните все поля');
      return;
    }
    try {
      const article = {
        title: newArticle.title,
        content: newArticle.content,
        image_url: newArticle.imageUrl,
        date: newArticle.date || new Date().toISOString().split('T')[0]
      };
      const { data: result, error } = await supabase.from('articles').insert([article]).select();
      if (error) throw error;
      if (result) {
        const mapped = {
          ...result[0],
          imageUrl: result[0].image_url
        };
        setData({ ...data, articles: [...data.articles, mapped] });
        setNewArticle({ title: '', content: '', imageUrl: '', date: '' });
        toast.success('Статья добавлена!');
      }
    } catch (e) {
      console.error('Error adding article', e);
      toast.error('Ошибка добавления статьи');
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, articles: data.articles.filter(a => a.id !== id) });
      toast.success('Статья удалена!');
    } catch (e) {
      console.error('Error deleting article', e);
      toast.error('Ошибка удаления статьи');
    }
  };

  const addAbout = async () => {
    if (!newAbout.title || !newAbout.description) {
      toast.error('Заполните все поля');
      return;
    }
    try {
      const { data: result, error } = await supabase.from('about_items').insert([newAbout]).select();
      if (error) throw error;
      if (result) {
        setData({ ...data, about: [...data.about, result[0]] });
        setNewAbout({ title: '', description: '', icon: 'Users' });
        toast.success('Пункт добавлен!');
      }
    } catch (e) {
      console.error('Error adding about item', e);
      toast.error('Ошибка добавления пункта');
    }
  };

  const deleteAbout = async (id: string) => {
    try {
      const { error } = await supabase.from('about_items').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, about: data.about.filter(a => a.id !== id) });
      toast.success('Пункт удален!');
    } catch (e) {
      console.error('Error deleting about item', e);
      toast.error('Ошибка удаления пункта');
    }
  };

  const addAdvantage = async () => {
    if (!newAdvantage.title || !newAdvantage.description) {
      toast.error('Заполните все поля');
      return;
    }
    try {
      const { data: result, error } = await supabase.from('advantages').insert([newAdvantage]).select();
      if (error) throw error;
      if (result) {
        setData({ ...data, advantages: [...data.advantages, result[0]] });
        setNewAdvantage({ title: '', description: '', icon: 'CheckCircle' });
        toast.success('Преимущество добавлено!');
      }
    } catch (e) {
      console.error('Error adding advantage', e);
      toast.error('Ошибка добавления преимущества');
    }
  };

  const deleteAdvantage = async (id: string) => {
    try {
      const { error } = await supabase.from('advantages').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, advantages: data.advantages.filter(a => a.id !== id) });
      toast.success('Преимущество удалено!');
    } catch (e) {
      console.error('Error deleting advantage', e);
      toast.error('Ошибка удаления преимущества');
    }
  };

  const addPartner = async () => {
    if (!newPartner.name || !newPartner.logoUrl) {
      toast.error('Заполните все поля');
      return;
    }
    try {
      const partner = {
        name: newPartner.name,
        logo_url: newPartner.logoUrl
      };
      const { data: result, error } = await supabase.from('partners').insert([partner]).select();
      if (error) throw error;
      if (result) {
        const mapped = {
          ...result[0],
          logoUrl: result[0].logo_url
        };
        setData({ ...data, partners: [...data.partners, mapped] });
        setNewPartner({ name: '', logoUrl: '' });
        toast.success('Партнер добавлен!');
      }
    } catch (e) {
      console.error('Error adding partner', e);
      toast.error('Ошибка добавления партнера');
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, partners: data.partners.filter(p => p.id !== id) });
      toast.success('Партнер удален!');
    } catch (e) {
      console.error('Error deleting partner', e);
      toast.error('Ошибка удаления партнера');
    }
  };

  const updateHero = async () => {
    try {
      const heroData = {
        title: data.hero.title,
        highlighted_text: data.hero.highlightedText,
        subtitle: data.hero.subtitle,
        description: data.hero.description
      };
      const { error } = await supabase.from('hero').update(heroData).eq('id', (await supabase.from('hero').select('id').single()).data?.id);
      if (error) throw error;
      toast.success('Главная страница обновлена!');
    } catch (e) {
      console.error('Error updating hero', e);
      toast.error('Ошибка обновления');
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'new' | 'processing' | 'completed') => {
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      const updatedOrders = data.orders.map(order =>
        order.id === orderId ? { ...order, status } : order
      );
      setData({ ...data, orders: updatedOrders });
      toast.success('Статус обновлен!');
    } catch (e) {
      console.error('Error updating order', e);
      toast.error('Ошибка обновления статуса');
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, orders: data.orders.filter(o => o.id !== id) });
      toast.success('Заказ удален!');
    } catch (e) {
      console.error('Error deleting order', e);
      toast.error('Ошибка удаления заказа');
    }
  };

  const addCategory = async () => {
    if (!newCategory.name) {
      toast.error('Введите название категории');
      return;
    }
    try {
      const { data: result, error } = await supabase.from('categories').insert([newCategory]).select();
      if (error) throw error;
      if (result) {
        setData({ ...data, categories: [...data.categories, result[0]] });
        setNewCategory({ name: '', icon: 'Package' });
        toast.success('Категория добавлена!');
      }
    } catch (e) {
      console.error('Error adding category', e);
      toast.error('Ошибка добавления категории');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, categories: data.categories.filter(c => c.id !== id) });
      toast.success('Категория удалена!');
    } catch (e) {
      console.error('Error deleting category', e);
      toast.error('Ошибка удаления категории');
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.categoryId) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    try {
      const product = {
        name: newProduct.name,
        image_url: newProduct.imageUrl,
        price: parseFloat(newProduct.price),
        description: newProduct.description,
        specs: newProduct.specs,
        category_id: newProduct.categoryId
      };
      const { data: result, error } = await supabase.from('products').insert([product]).select();
      if (error) throw error;
      if (result) {
        const mapped = {
          ...result[0],
          imageUrl: result[0].image_url,
          categoryId: result[0].category_id
        };
        setData({ ...data, products: [...data.products, mapped] });
        setNewProduct({ name: '', imageUrl: '', price: '', description: '', specs: '', categoryId: '' });
        toast.success('Товар добавлен!');
      }
    } catch (e) {
      console.error('Error adding product', e);
      toast.error('Ошибка добавления товара');
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setData({ ...data, products: data.products.filter(p => p.id !== id) });
      toast.success('Товар удален!');
    } catch (e) {
      console.error('Error deleting product', e);
      toast.error('Ошибка удаления товара');
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      saveData({ ...data, ...imported });
      toast.success('Данные импортированы!');
    } catch (error) {
      toast.error('Ошибка импорта данных');
    }
  };

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yasniy-sluh-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Панель администратора</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Icon name="Home" size={18} className="mr-2" />
              На сайт
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              <Icon name="Download" size={18} className="mr-2" />
              Экспорт
            </Button>
            <Button variant="outline" asChild>
              <label>
                <Icon name="Upload" size={18} className="mr-2" />
                Импорт
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="w-full">
          <TabsList className="grid grid-cols-9 w-full">
            <TabsTrigger value="hero">Главная</TabsTrigger>
            <TabsTrigger value="categories">Категории</TabsTrigger>
            <TabsTrigger value="products">Товары</TabsTrigger>
            <TabsTrigger value="services">Услуги</TabsTrigger>
            <TabsTrigger value="about">О нас</TabsTrigger>
            <TabsTrigger value="articles">Статьи</TabsTrigger>
            <TabsTrigger value="advantages">Преимущества</TabsTrigger>
            <TabsTrigger value="partners">Партнеры</TabsTrigger>
            <TabsTrigger value="orders">Заказы</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Главный экран</CardTitle>
                <CardDescription>Настройка главного баннера сайта</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Заголовок</Label>
                  <Input 
                    value={data.hero.title} 
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, title: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Выделенный текст</Label>
                  <Input 
                    value={data.hero.highlightedText} 
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, highlightedText: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Подзаголовок</Label>
                  <Input 
                    value={data.hero.subtitle} 
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea 
                    value={data.hero.description} 
                    onChange={(e) => setData({ ...data, hero: { ...data.hero, description: e.target.value } })}
                  />
                </div>
                <Button onClick={updateHero}>Сохранить</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Управление категориями</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    placeholder="Название" 
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  />
                  <Input 
                    placeholder="Иконка (lucide)" 
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                  />
                  <Button onClick={addCategory}>Добавить</Button>
                </div>
                <div className="space-y-2">
                  {data.categories.map(cat => (
                    <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <Icon name={cat.icon as any} size={20} />
                        <span>{cat.name}</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteCategory(cat.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Управление товарами</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Название" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                  <Input 
                    placeholder="Цена" 
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                  <Input 
                    placeholder="URL изображения" 
                    value={newProduct.imageUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  />
                  <select 
                    className="border rounded px-3 py-2"
                    value={newProduct.categoryId}
                    onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                  >
                    <option value="">Выберите категорию</option>
                    {data.categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <Textarea 
                    placeholder="Описание"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="col-span-2"
                  />
                  <Textarea 
                    placeholder="Характеристики"
                    value={newProduct.specs}
                    onChange={(e) => setNewProduct({ ...newProduct, specs: e.target.value })}
                    className="col-span-2"
                  />
                  <Button onClick={addProduct} className="col-span-2">Добавить товар</Button>
                </div>
                <div className="space-y-2">
                  {data.products.map(prod => (
                    <div key={prod.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        {prod.imageUrl && <img src={prod.imageUrl} alt={prod.name} className="w-12 h-12 object-cover rounded" />}
                        <div>
                          <div className="font-semibold">{prod.name}</div>
                          <div className="text-sm text-gray-500">{prod.price} ₽</div>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteProduct(prod.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Управление услугами</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Название" 
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  />
                  <Input 
                    placeholder="Цена" 
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  />
                  <Textarea 
                    placeholder="Описание"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="col-span-2"
                  />
                  <Input 
                    placeholder="Иконка (lucide)"
                    value={newService.icon}
                    onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                  />
                  <Button onClick={addService}>Добавить</Button>
                </div>
                <div className="space-y-2">
                  {data.services.map(service => (
                    <div key={service.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-semibold">{service.title}</div>
                        <div className="text-sm text-gray-500">{service.price}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteService(service.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>О компании</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Заголовок" 
                    value={newAbout.title}
                    onChange={(e) => setNewAbout({ ...newAbout, title: e.target.value })}
                  />
                  <Input 
                    placeholder="Иконка (lucide)"
                    value={newAbout.icon}
                    onChange={(e) => setNewAbout({ ...newAbout, icon: e.target.value })}
                  />
                  <Textarea 
                    placeholder="Описание"
                    value={newAbout.description}
                    onChange={(e) => setNewAbout({ ...newAbout, description: e.target.value })}
                    className="col-span-2"
                  />
                  <Button onClick={addAbout} className="col-span-2">Добавить</Button>
                </div>
                <div className="space-y-2">
                  {data.about.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteAbout(item.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>Управление статьями</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Заголовок" 
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                  />
                  <Input 
                    placeholder="URL изображения"
                    value={newArticle.imageUrl}
                    onChange={(e) => setNewArticle({ ...newArticle, imageUrl: e.target.value })}
                  />
                  <Textarea 
                    placeholder="Содержание"
                    value={newArticle.content}
                    onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                    className="col-span-2"
                  />
                  <Input 
                    type="date"
                    value={newArticle.date}
                    onChange={(e) => setNewArticle({ ...newArticle, date: e.target.value })}
                  />
                  <Button onClick={addArticle}>Добавить</Button>
                </div>
                <div className="space-y-2">
                  {data.articles.map(article => (
                    <div key={article.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-semibold">{article.title}</div>
                        <div className="text-sm text-gray-500">{article.date}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteArticle(article.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advantages">
            <Card>
              <CardHeader>
                <CardTitle>Преимущества</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    placeholder="Заголовок" 
                    value={newAdvantage.title}
                    onChange={(e) => setNewAdvantage({ ...newAdvantage, title: e.target.value })}
                  />
                  <Input 
                    placeholder="Иконка (lucide)"
                    value={newAdvantage.icon}
                    onChange={(e) => setNewAdvantage({ ...newAdvantage, icon: e.target.value })}
                  />
                  <Textarea 
                    placeholder="Описание"
                    value={newAdvantage.description}
                    onChange={(e) => setNewAdvantage({ ...newAdvantage, description: e.target.value })}
                    className="col-span-2"
                  />
                  <Button onClick={addAdvantage} className="col-span-2">Добавить</Button>
                </div>
                <div className="space-y-2">
                  {data.advantages.map(adv => (
                    <div key={adv.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="font-semibold">{adv.title}</div>
                        <div className="text-sm text-gray-500">{adv.description}</div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteAdvantage(adv.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="partners">
            <Card>
              <CardHeader>
                <CardTitle>Партнеры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Input 
                    placeholder="Название" 
                    value={newPartner.name}
                    onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  />
                  <Input 
                    placeholder="URL логотипа"
                    value={newPartner.logoUrl}
                    onChange={(e) => setNewPartner({ ...newPartner, logoUrl: e.target.value })}
                  />
                  <Button onClick={addPartner}>Добавить</Button>
                </div>
                <div className="space-y-2">
                  {data.partners.map(partner => (
                    <div key={partner.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <img src={partner.logoUrl} alt={partner.name} className="h-8" />
                        <span>{partner.name}</span>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deletePartner(partner.id)}>
                        Удалить
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Заказы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.orders.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Заказов пока нет</div>
                  ) : (
                    data.orders.map(order => (
                      <Card key={order.id}>
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center">
                            <span>Заказ #{order.id}</span>
                            <div className="flex gap-2">
                              <select 
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                                className="border rounded px-2 py-1 text-sm"
                              >
                                <option value="new">Новый</option>
                                <option value="processing">В обработке</option>
                                <option value="completed">Завершен</option>
                              </select>
                              <Button variant="destructive" size="sm" onClick={() => deleteOrder(order.id)}>
                                Удалить
                              </Button>
                            </div>
                          </CardTitle>
                          <CardDescription>
                            {order.date} • {order.total} ₽
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div><strong>Клиент:</strong> {order.customer.firstName} {order.customer.lastName}</div>
                            <div><strong>Телефон:</strong> {order.customer.phone}</div>
                            <div><strong>Email:</strong> {order.customer.email}</div>
                            <div><strong>Адрес:</strong> {order.customer.address}</div>
                            {order.customer.comment && <div><strong>Комментарий:</strong> {order.customer.comment}</div>}
                            <div className="mt-4">
                              <strong>Товары:</strong>
                              <ul className="list-disc list-inside">
                                {order.items.map((item, idx) => (
                                  <li key={idx}>{item.product.name} × {item.quantity}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
