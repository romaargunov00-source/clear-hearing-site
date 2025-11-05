import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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

interface Service {
  id: string;
  name: string;
  imageUrl: string;
  contact: string;
  link: string;
  description?: string;
}

interface AboutItem {
  id: string;
  title: string;
  description: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  date: string;
}

interface Advantage {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  highlightedText: string;
  description: string;
}

interface AppData {
  categories: Category[];
  products: Product[];
  services: Service[];
  about: AboutItem[];
  articles: Article[];
  advantages: Advantage[];
  partners: Partner[];
  hero: HeroContent;
}

const STORAGE_KEY = 'yasny-slukh-data';
const ADMIN_PASSWORD = '3956Qqqq';

const Index = () => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<'home' | 'catalog' | 'services' | 'about' | 'articles'>('home');
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isAdvantagesVisible, setIsAdvantagesVisible] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const advantagesRef = useRef<HTMLDivElement>(null);
  const defaultAdvantages: Advantage[] = [
    { id: '1', icon: 'UserCheck', title: 'Индивидуальный подбор', description: 'Подбираем аппарат с учетом особенностей слуха, образа жизни и бюджета' },
    { id: '2', icon: 'Settings', title: 'Профессиональная настройка', description: 'Настраиваем аппарат под индивидуальные параметры вашего слуха' },
    { id: '3', icon: 'Volume2', title: 'Проверка слуха', description: 'Проводим тест слуха для точного определения потери слуха' },
    { id: '4', icon: 'Shield', title: 'Гарантийное обслуживание', description: 'Обеспечиваем сервисное обслуживание на весь гарантийный срок' },
    { id: '5', icon: 'Headphones', title: 'Поддержка клиентов', description: 'Отвечаем на вопросы и помогаем в процессе привыкания к аппарату' },
    { id: '6', icon: 'Sparkles', title: 'Современные технологии', description: 'Используем новейшие достижения в области аудиологии' }
  ];

  const defaultPartners: Partner[] = [
    { id: '1', name: 'Oticon', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Oticon_logo.svg/320px-Oticon_logo.svg.png' },
    { id: '2', name: 'Phonak', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Phonak_logo.svg/320px-Phonak_logo.svg.png' },
    { id: '3', name: 'Signia', logoUrl: 'https://www.signia-hearing.com/globalassets/signia/shared-components/shared-header/signia_logo.svg' },
    { id: '4', name: 'ReSound', logoUrl: 'https://www.resound.com/SiteCollectionImages/ReSound_logo.png' },
    { id: '5', name: 'Widex', logoUrl: 'https://www.widex.com/media/images/logo.svg' }
  ];

  const defaultCategories: Category[] = [
    { id: '1', name: 'Заушные аппараты', icon: 'Ear' },
    { id: '2', name: 'Внутриушные аппараты', icon: 'Radio' },
    { id: '3', name: 'Аксессуары', icon: 'Cable' }
  ];

  const [data, setData] = useState<AppData>({
    categories: defaultCategories,
    products: [],
    services: [],
    about: [],
    articles: [],
    advantages: defaultAdvantages,
    partners: defaultPartners,
    hero: {
      title: 'ОТКРОЙТЕ ДЛЯ СЕБЯ',
      highlightedText: 'МИР ЧЕТКОГО ЗВУКА',
      subtitle: 'С НАШИМИ РЕШЕНИЯМИ!',
      description: 'Инновационные слуховые технологии от мировых лидеров с персональной настройкой и пожизненной поддержкой'
    }
  });

  const loadData = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData({
          categories: parsed.categories || defaultCategories,
          products: parsed.products || [],
          services: parsed.services || [],
          about: parsed.about || [],
          articles: parsed.articles || [],
          advantages: parsed.advantages || defaultAdvantages,
          partners: parsed.partners || defaultPartners,
          hero: parsed.hero || {
            title: 'ОТКРОЙТЕ ДЛЯ СЕБЯ',
            highlightedText: 'МИР ЧЕТКОГО ЗВУКА',
            subtitle: 'С НАШИМИ РЕШЕНИЯМИ!',
            description: 'Инновационные слуховые технологии от мировых лидеров с персональной настройкой и пожизненной поддержкой'
          }
        });
      } catch (e) {
        console.error('Failed to parse data', e);
      }
    }
  };

  const saveData = (newData: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setData(newData);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsAdvantagesVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = advantagesRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [activeSection]);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminAuthed(true);
      setShowAdminDialog(false);
      setShowWelcomeDialog(true);
      setAdminPassword('');
      
      setTimeout(() => {
        setShowWelcomeDialog(false);
        setShowAdminDialog(true);
      }, 3000);
    } else {
      toast({ title: 'Ошибка', description: 'Неверный пароль', variant: 'destructive' });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'yasny-slukh-data.json';
    link.click();
    toast({ title: 'Экспорт выполнен', description: 'Данные сохранены в файл' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          saveData(imported);
          toast({ title: 'Импорт выполнен', description: 'Данные загружены' });
        } catch (err) {
          toast({ title: 'Ошибка', description: 'Неверный формат файла', variant: 'destructive' });
        }
      };
      reader.readAsText(file);
    }
  };

  const scrollItems = [...data.products, ...data.services];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-primary shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <button onClick={() => setActiveSection('home')} className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition">
              <img src="https://cdn.poehali.dev/files/76bd75c3-4d4d-4b91-a795-2a19bb4fd126.png" alt="Ясный слух" className="h-10 w-10 md:h-12 md:w-12" />
              <h1 className="text-xl md:text-3xl font-black text-foreground tracking-tight">ЯСНЫЙ СЛУХ</h1>
            </button>
            <nav className="hidden lg:flex gap-6">
              <button onClick={() => setActiveSection('home')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'home' ? 'text-primary' : 'text-foreground'}`}>ГЛАВНАЯ</button>
              <button onClick={() => setActiveSection('catalog')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'catalog' ? 'text-primary' : 'text-foreground'}`}>КАТАЛОГ</button>
              <button onClick={() => setActiveSection('services')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'services' ? 'text-primary' : 'text-foreground'}`}>УСЛУГИ</button>
              <button onClick={() => setActiveSection('about')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'about' ? 'text-primary' : 'text-foreground'}`}>О КОМПАНИИ</button>
              <button onClick={() => setActiveSection('articles')} className={`text-base font-bold hover:text-primary transition ${activeSection === 'articles' ? 'text-primary' : 'text-foreground'}`}>СТАТЬИ</button>
            </nav>
            <div className="flex gap-2">
              <Button onClick={() => setShowAppointmentDialog(true)} className="bg-primary hover:bg-primary/90 font-bold text-white hidden md:flex">
                <Icon name="Calendar" className="mr-2" size={18} />
                ЗАПИСЬ НА КОНСУЛЬТАЦИЮ
              </Button>
              <Button onClick={() => setShowAppointmentDialog(true)} size="icon" className="bg-primary hover:bg-primary/90 text-white md:hidden">
                <Icon name="Calendar" size={20} />
              </Button>
              <Button onClick={() => setShowMobileMenu(!showMobileMenu)} variant="outline" size="icon" className="border-2 lg:hidden">
                <Icon name={showMobileMenu ? "X" : "Menu"} size={20} />
              </Button>
              <Button onClick={() => setShowAdminDialog(true)} variant="outline" size="icon" className="border-2 hidden lg:flex">
                <Icon name="Settings" size={18} />
              </Button>
            </div>
          </div>
          {showMobileMenu && (
            <nav className="lg:hidden pb-4 space-y-2 animate-fade-in">
              <button onClick={() => { setActiveSection('home'); setShowMobileMenu(false); }} className={`block w-full text-left py-2 px-4 rounded font-bold hover:bg-primary/10 transition ${activeSection === 'home' ? 'text-primary bg-primary/10' : 'text-foreground'}`}>ГЛАВНАЯ</button>
              <button onClick={() => { setActiveSection('catalog'); setShowMobileMenu(false); }} className={`block w-full text-left py-2 px-4 rounded font-bold hover:bg-primary/10 transition ${activeSection === 'catalog' ? 'text-primary bg-primary/10' : 'text-foreground'}`}>КАТАЛОГ</button>
              <button onClick={() => { setActiveSection('services'); setShowMobileMenu(false); }} className={`block w-full text-left py-2 px-4 rounded font-bold hover:bg-primary/10 transition ${activeSection === 'services' ? 'text-primary bg-primary/10' : 'text-foreground'}`}>УСЛУГИ</button>
              <button onClick={() => { setActiveSection('about'); setShowMobileMenu(false); }} className={`block w-full text-left py-2 px-4 rounded font-bold hover:bg-primary/10 transition ${activeSection === 'about' ? 'text-primary bg-primary/10' : 'text-foreground'}`}>О КОМПАНИИ</button>
              <button onClick={() => { setActiveSection('articles'); setShowMobileMenu(false); }} className={`block w-full text-left py-2 px-4 rounded font-bold hover:bg-primary/10 transition ${activeSection === 'articles' ? 'text-primary bg-primary/10' : 'text-foreground'}`}>СТАТЬИ</button>
              <button onClick={() => { setShowAdminDialog(true); setShowMobileMenu(false); }} className="block w-full text-left py-2 px-4 rounded font-bold hover:bg-primary/10 transition text-foreground">АДМИН-ПАНЕЛЬ</button>
            </nav>
          )}
        </div>
      </header>

      {scrollItems.length > 0 && (
        <div className="bg-foreground text-white py-3 overflow-hidden">
          <div className="flex whitespace-nowrap animate-scroll">
            {[...scrollItems, ...scrollItems].map((item, index) => (
              <div key={index} className="inline-flex items-center mx-8">
                <span className="text-lg font-bold">
                  {'price' in item ? `${item.name} — ${item.price} ₽` : item.name}
                </span>
                <span className="mx-4 text-primary">●</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-4 md:py-8">
        {activeSection === 'home' && (
          <div className="space-y-8 md:space-y-12 section-transition">
            <section className="text-center py-10 md:py-20">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 text-foreground px-2">{data.hero.title} <span className="text-primary">{data.hero.highlightedText}</span> {data.hero.subtitle}</h2>
              <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">{data.hero.description}</p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 px-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white text-base md:text-lg font-bold px-6 md:px-8 w-full sm:w-auto" onClick={() => setActiveSection('catalog')}>
                  <Icon name="Package" className="mr-2" size={20} />
                  ПОСМОТРЕТЬ КАТАЛОГ
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-base md:text-lg font-bold px-6 md:px-8 w-full sm:w-auto" onClick={() => setActiveSection('services')}>
                  <Icon name="Briefcase" className="mr-2" size={20} />
                  НАШИ УСЛУГИ
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-base md:text-lg font-bold px-6 md:px-8 w-full sm:w-auto" onClick={() => setActiveSection('about')}>
                  <Icon name="Info" className="mr-2" size={20} />
                  О КОМПАНИИ
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-white text-base md:text-lg font-bold px-6 md:px-8 w-full sm:w-auto" onClick={() => setActiveSection('articles')}>
                  <Icon name="BookOpen" className="mr-2" size={20} />
                  СТАТЬИ
                </Button>
              </div>
            </section>

            <section ref={advantagesRef} className={`py-12 md:py-20 bg-secondary/30 rounded-3xl scroll-fade-in ${isAdvantagesVisible ? 'visible' : ''}`}>
              <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-center mb-4 title-transition">
                  ОТКРОЙТЕ ДЛЯ СЕБЯ <span className="text-primary">МИР ЧЕТКОГО ЗВУКА</span><br />С НАШИМИ РЕШЕНИЯМИ!
                </h2>
                <p className="text-center text-base md:text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
                  Инновационные слуховые технологии от мировых лидеров с персональной настройкой и пожизненной поддержкой
                </p>
                
                {data.advantages.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {data.advantages.map((advantage) => (
                      <Card key={advantage.id} className="border-2 hover:border-primary transition card-transition">
                        <CardHeader>
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Icon name={advantage.icon as any} className="text-primary" size={24} fallback="Star" />
                          </div>
                          <CardTitle className="text-xl font-black">{advantage.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{advantage.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground mb-16">Преимущества отсутствуют. Добавьте их через админ-панель.</p>
                )}

                <div className="bg-background rounded-2xl p-8 md:p-12 border-2 border-primary/20">
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-center mb-4 title-transition">
                    РАБОТАЕМ С <span className="text-primary">ВЕДУЩИМИ ПРОИЗВОДИТЕЛЯМИ</span>
                  </h3>
                  <p className="text-center text-base md:text-lg text-muted-foreground mb-8">
                    Представляем слуховые аппараты от мировых лидеров в области аудиологии
                  </p>
                  
                  {data.partners.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
                      {data.partners.map((partner) => (
                        <div key={partner.id} className="flex items-center justify-center p-4 bg-white rounded-lg hover:shadow-lg transition">
                          <img src={partner.logoUrl} alt={partner.name} className="max-h-12 w-auto grayscale hover:grayscale-0 transition" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">Партнёры отсутствуют. Добавьте их через админ-панель.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeSection === 'catalog' && (
          <div className="section-transition">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 md:mb-8 text-primary title-transition">КАТАЛОГ</h2>
            
            {data.categories.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8">
                <Button
                  onClick={() => setSelectedCategoryId(null)}
                  variant={selectedCategoryId === null ? "default" : "outline"}
                  className={`font-bold ${selectedCategoryId === null ? 'bg-primary hover:bg-primary/90 text-white' : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'}`}
                >
                  <Icon name="Grid" className="mr-2" size={18} />
                  Все категории
                </Button>
                {data.categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    variant={selectedCategoryId === category.id ? "default" : "outline"}
                    className={`font-bold ${selectedCategoryId === category.id ? 'bg-primary hover:bg-primary/90 text-white' : 'border-2 border-primary text-primary hover:bg-primary hover:text-white'}`}
                  >
                    <Icon name={category.icon as any} className="mr-2" size={18} fallback="Package" />
                    {category.name}
                  </Button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {data.products.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-12">Товары отсутствуют. Добавьте их через админ-панель.</p>
              ) : data.products.filter(product => selectedCategoryId === null || product.categoryId === selectedCategoryId).length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-12">В этой категории пока нет товаров.</p>
              ) : (
                data.products
                  .filter(product => selectedCategoryId === null || product.categoryId === selectedCategoryId)
                  .map((product) => {
                    const category = data.categories.find(c => c.id === product.categoryId);
                    return (
                      <Card key={product.id} className="overflow-hidden hover:border-primary transition border-2 card-transition">
                        <div className="w-full h-48 bg-secondary/30 flex items-center justify-center p-4">
                          <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain" />
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            {category && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                                <Icon name={category.icon as any} size={14} fallback="Tag" />
                                {category.name}
                              </span>
                            )}
                          </div>
                          <CardTitle className="text-2xl font-black">{product.name}</CardTitle>
                          <CardDescription className="text-primary text-xl font-bold">{product.price} ₽</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm mb-2">{product.description}</p>
                          <p className="text-xs text-muted-foreground">{product.specs}</p>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold" onClick={() => setShowAppointmentDialog(true)}>
                            ЗАКАЗАТЬ
                          </Button>
                        </CardFooter>
                      </Card>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {activeSection === 'services' && (
          <div className="section-transition">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 md:mb-8 text-primary title-transition">УСЛУГИ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {data.services.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-12">Услуги отсутствуют. Добавьте их через админ-панель.</p>
              ) : (
                data.services.map((service) => (
                  <Card key={service.id} className="hover:border-primary transition border-2 card-transition">
                    <img src={service.imageUrl} alt={service.name} className="w-full h-48 object-cover" />
                    <CardHeader>
                      <CardTitle className="text-2xl font-black">{service.name}</CardTitle>
                      <CardDescription>{service.contact}</CardDescription>
                    </CardHeader>
                    {service.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </CardContent>
                    )}
                    <CardFooter>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold" 
                        onClick={() => setShowAppointmentDialog(true)}
                      >
                        ЗАПИСАТЬСЯ НА КОНСУЛЬТАЦИЮ
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'about' && (
          <div className="section-transition">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 md:mb-8 text-primary title-transition">О КОМПАНИИ</h2>
            <div className="space-y-4 md:space-y-6">
              {data.about.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">Информация отсутствует. Добавьте её через админ-панель.</p>
              ) : (
                data.about.map((item) => (
                  <Card key={item.id} className="border-2 card-transition">
                    <CardHeader>
                      <CardTitle className="text-xl md:text-2xl lg:text-3xl font-black">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm md:text-base text-muted-foreground whitespace-pre-wrap">{item.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeSection === 'articles' && (
          <div className="section-transition">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 md:mb-8 text-primary title-transition">СТАТЬИ</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {data.articles.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-12">Статьи отсутствуют. Добавьте их через админ-панель.</p>
              ) : (
                data.articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden hover:border-primary transition border-2 card-transition cursor-pointer" onClick={() => setSelectedArticle(article)}>
                    {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />}
                    <CardHeader>
                      <CardTitle className="text-xl font-black">{article.title}</CardTitle>
                      <CardDescription className="text-xs">{article.date}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
                      <Button variant="link" className="text-primary font-bold p-0 mt-2">
                        Читать далее →
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-secondary border-t-4 border-primary mt-12 md:mt-20">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black text-primary mb-3 md:mb-4">ДОСТАВКА</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="Package" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Самовывоз</p>
                    <p className="text-sm text-muted-foreground">Бесплатно из центра слухопротезирования</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Truck" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Курьер по Москве</p>
                    <p className="text-sm text-muted-foreground">1-2 рабочих дня, 300 ₽</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Почта России</p>
                    <p className="text-sm text-muted-foreground">5-14 рабочих дней, от 350 ₽</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-black text-primary mb-3 md:mb-4">ОПЛАТА</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="CreditCard" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Банковской картой</p>
                    <p className="text-sm text-muted-foreground">Visa, MasterCard, МИР</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Banknote" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Наличными</p>
                    <p className="text-sm text-muted-foreground">При получении в центре</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="FileText" className="text-primary mt-1" size={20} />
                  <div>
                    <p className="font-bold">Электронные сертификаты</p>
                    <p className="text-sm text-muted-foreground">ГЭР, СФР</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl md:text-2xl font-black text-primary mb-3 md:mb-4">КОНТАКТЫ</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Icon name="MapPin" className="text-primary mt-1" size={20} />
                  <p className="text-sm">ул. Люблинская д. 100 кор. 2, Москва, Россия</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Phone" className="text-primary mt-1" size={20} />
                  <p className="text-sm">+7 (495) 799-09-26</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Mail" className="text-primary mt-1" size={20} />
                  <p className="text-sm">info@yasnyzvuk.ru</p>
                </div>
                <div className="flex items-start gap-3">
                  <Icon name="Clock" className="text-primary mt-1" size={20} />
                  <div className="text-sm">
                    <p>пн.-сб.: 10:00-19:00</p>
                    <p>вс.: выходной</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold mt-2"
                  onClick={() => window.open('https://yandex.ru/maps/org/yasny_zvuk/157540054545/?ll=37.739680%2C55.654808&z=16', '_blank')}
                >
                  <Icon name="Map" className="mr-2" size={18} />
                  ОТКРЫТЬ НА КАРТЕ
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-primary/20 mt-6 md:mt-8 pt-4 md:pt-6 text-center">
            <p className="text-xs md:text-sm text-muted-foreground">
              © 2025 Ясный слух. Все права защищены
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black text-center">ЗАПИСЬ НА КОНСУЛЬТАЦИЮ</DialogTitle>
            <DialogDescription className="text-center text-sm md:text-base">Свяжитесь с нами удобным способом</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 md:gap-4 py-4">
            <Button size="lg" className="bg-[#0088cc] hover:bg-[#0088cc]/90 text-white font-bold h-14 md:h-16 justify-start text-left" asChild>
              <a href="https://t.me/+79629102391" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Icon name="Send" className="mr-3 md:mr-4 flex-shrink-0" size={20} />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                  <span className="text-sm md:text-base font-bold truncate">Написать в Telegram</span>
                  <span className="text-xs md:text-sm opacity-90">+7 (962) 910-23-91</span>
                </div>
              </a>
            </Button>
            <Button size="lg" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white font-bold h-14 md:h-16 justify-start text-left" asChild>
              <a href="https://wa.me/79629102391" target="_blank" rel="noopener noreferrer" className="flex items-center">
                <Icon name="MessageCircle" className="mr-3 md:mr-4 flex-shrink-0" size={20} />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                  <span className="text-sm md:text-base font-bold truncate">Написать в WhatsApp</span>
                  <span className="text-xs md:text-sm opacity-90">+7 (962) 910-23-91</span>
                </div>
              </a>
            </Button>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold h-14 md:h-16 justify-start text-left" asChild>
              <a href="tel:+74957990926" className="flex items-center">
                <Icon name="Phone" className="mr-3 md:mr-4 flex-shrink-0" size={20} />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0">
                  <span className="text-sm md:text-base font-bold truncate">Позвонить</span>
                  <span className="text-xs md:text-sm opacity-90">+7 (495) 799-09-26</span>
                </div>
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">АДМИН-ПАНЕЛЬ</DialogTitle>
          </DialogHeader>
          {!isAdminAuthed ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="Lock" className="text-primary" size={40} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black">ВХОД В СИСТЕМУ</h3>
                <p className="text-muted-foreground">Введите пароль для доступа к панели управления</p>
              </div>
              <div className="w-full max-w-sm space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-base font-bold">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    placeholder="••••••••"
                    className="h-12 text-base"
                  />
                </div>
                <Button onClick={handleAdminLogin} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-base">
                  <Icon name="LogIn" className="mr-2" size={20} />
                  ВОЙТИ
                </Button>
              </div>
              <div className="text-xs text-muted-foreground text-center">
                <p>© 2025 Ясный слух. Все права защищены</p>
              </div>
            </div>
          ) : (
            <AdminPanel data={data} onSave={saveData} onExport={handleExport} onImport={handleImport} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
              <Icon name="CheckCircle" className="text-primary" size={50} />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black">С ВОЗВРАЩЕНИЕМ!</DialogTitle>
              <p className="text-lg text-muted-foreground">Вы успешно вошли в систему</p>
            </div>
            <div className="pt-4 border-t w-full">
              <p className="text-sm text-muted-foreground">© 2025 Ясный слух</p>
              <p className="text-xs text-muted-foreground mt-1">Все права защищены</p>
            </div>
            <Button 
              onClick={() => { setShowWelcomeDialog(false); setShowAdminDialog(true); }} 
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
            >
              ПЕРЕЙТИ К ПАНЕЛИ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedArticle !== null} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl lg:text-3xl font-black">{selectedArticle.title}</DialogTitle>
                <DialogDescription className="text-sm">{selectedArticle.date}</DialogDescription>
              </DialogHeader>
              {selectedArticle.imageUrl && (
                <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-48 md:h-64 object-cover rounded-lg" />
              )}
              <div className="prose max-w-none">
                <p className="text-sm md:text-base text-foreground whitespace-pre-wrap">{selectedArticle.content}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdminPanel = ({ data, onSave, onExport, onImport }: {
  data: AppData;
  onSave: (data: AppData) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [activeTab, setActiveTab] = useState('catalog');

  const addCategory = () => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: '',
      icon: 'Package'
    };
    onSave({ ...data, categories: [...data.categories, newCategory] });
  };

  const updateCategory = (id: string, field: keyof Category, value: string) => {
    const updated = data.categories.map(c => c.id === id ? { ...c, [field]: value } : c);
    onSave({ ...data, categories: updated });
  };

  const deleteCategory = (id: string) => {
    onSave({ 
      ...data, 
      categories: data.categories.filter(c => c.id !== id),
      products: data.products.map(p => p.categoryId === id ? { ...p, categoryId: '' } : p)
    });
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: '',
      imageUrl: '',
      price: 0,
      description: '',
      specs: '',
      categoryId: data.categories.length > 0 ? data.categories[0].id : ''
    };
    onSave({ ...data, products: [...data.products, newProduct] });
  };

  const updateProduct = (id: string, field: keyof Product, value: string | number) => {
    const updated = data.products.map(p => p.id === id ? { ...p, [field]: value } : p);
    onSave({ ...data, products: updated });
  };

  const deleteProduct = (id: string) => {
    onSave({ ...data, products: data.products.filter(p => p.id !== id) });
  };

  const addService = () => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      imageUrl: '',
      contact: '',
      link: ''
    };
    onSave({ ...data, services: [...data.services, newService] });
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    const updated = data.services.map(s => s.id === id ? { ...s, [field]: value } : s);
    onSave({ ...data, services: updated });
  };

  const deleteService = (id: string) => {
    onSave({ ...data, services: data.services.filter(s => s.id !== id) });
  };

  const addAbout = () => {
    const newAbout: AboutItem = {
      id: Date.now().toString(),
      title: '',
      description: ''
    };
    onSave({ ...data, about: [...data.about, newAbout] });
  };

  const updateAbout = (id: string, field: keyof AboutItem, value: string) => {
    const updated = data.about.map(a => a.id === id ? { ...a, [field]: value } : a);
    onSave({ ...data, about: updated });
  };

  const deleteAbout = (id: string) => {
    onSave({ ...data, about: data.about.filter(a => a.id !== id) });
  };

  const addArticle = () => {
    const newArticle: Article = {
      id: Date.now().toString(),
      title: '',
      content: '',
      imageUrl: '',
      date: new Date().toLocaleDateString('ru-RU')
    };
    onSave({ ...data, articles: [...data.articles, newArticle] });
  };

  const updateArticle = (id: string, field: keyof Article, value: string) => {
    const updated = data.articles.map(a => a.id === id ? { ...a, [field]: value } : a);
    onSave({ ...data, articles: updated });
  };

  const deleteArticle = (id: string) => {
    onSave({ ...data, articles: data.articles.filter(a => a.id !== id) });
  };

  const addAdvantage = () => {
    const newAdvantage: Advantage = {
      id: Date.now().toString(),
      icon: 'Star',
      title: '',
      description: ''
    };
    onSave({ ...data, advantages: [...data.advantages, newAdvantage] });
  };

  const updateAdvantage = (id: string, field: keyof Advantage, value: string) => {
    const updated = data.advantages.map(a => a.id === id ? { ...a, [field]: value } : a);
    onSave({ ...data, advantages: updated });
  };

  const deleteAdvantage = (id: string) => {
    onSave({ ...data, advantages: data.advantages.filter(a => a.id !== id) });
  };

  const addPartner = () => {
    const newPartner: Partner = {
      id: Date.now().toString(),
      name: '',
      logoUrl: ''
    };
    onSave({ ...data, partners: [...data.partners, newPartner] });
  };

  const updatePartner = (id: string, field: keyof Partner, value: string) => {
    const updated = data.partners.map(p => p.id === id ? { ...p, [field]: value } : p);
    onSave({ ...data, partners: updated });
  };

  const deletePartner = (id: string) => {
    onSave({ ...data, partners: data.partners.filter(p => p.id !== id) });
  };

  const updateHero = (field: keyof HeroContent, value: string) => {
    onSave({ ...data, hero: { ...data.hero, [field]: value } });
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="home">Главная</TabsTrigger>
        <TabsTrigger value="categories">Категории</TabsTrigger>
        <TabsTrigger value="catalog">Каталог</TabsTrigger>
        <TabsTrigger value="services">Услуги</TabsTrigger>
        <TabsTrigger value="about">О компании</TabsTrigger>
        <TabsTrigger value="articles">Статьи</TabsTrigger>
        <TabsTrigger value="data">Данные</TabsTrigger>
      </TabsList>

      <TabsContent value="home" className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Главный баннер</h3>
          <div className="space-y-3">
            <div>
              <Label>Заголовок</Label>
              <Input value={data.hero.title} onChange={(e) => updateHero('title', e.target.value)} placeholder="ОТКРОЙТЕ ДЛЯ СЕБЯ" />
            </div>
            <div>
              <Label>Выделенный текст (цветной)</Label>
              <Input value={data.hero.highlightedText} onChange={(e) => updateHero('highlightedText', e.target.value)} placeholder="МИР ЧЕТКОГО ЗВУКА" />
            </div>
            <div>
              <Label>Подзаголовок</Label>
              <Input value={data.hero.subtitle} onChange={(e) => updateHero('subtitle', e.target.value)} placeholder="С НАШИМИ РЕШЕНИЯМИ!" />
            </div>
            <div>
              <Label>Описание</Label>
              <Textarea value={data.hero.description} onChange={(e) => updateHero('description', e.target.value)} placeholder="Описание услуг..." rows={3} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Преимущества</h3>
            <Button onClick={addAdvantage} size="sm" className="bg-primary hover:bg-primary/90">
              <Icon name="Plus" className="mr-2" size={16} />
              Добавить
            </Button>
          </div>
          {data.advantages.map((advantage) => (
            <Card key={advantage.id} className="p-4">
              <div className="space-y-3">
                <div>
                  <Label>Иконка (название из Lucide)</Label>
                  <Input value={advantage.icon} onChange={(e) => updateAdvantage(advantage.id, 'icon', e.target.value)} placeholder="Star, Heart, Settings..." />
                </div>
                <div>
                  <Label>Заголовок</Label>
                  <Input value={advantage.title} onChange={(e) => updateAdvantage(advantage.id, 'title', e.target.value)} />
                </div>
                <div>
                  <Label>Описание</Label>
                  <Textarea value={advantage.description} onChange={(e) => updateAdvantage(advantage.id, 'description', e.target.value)} rows={2} />
                </div>
                <Button onClick={() => deleteAdvantage(advantage.id)} variant="destructive" size="sm">
                  <Icon name="Trash2" className="mr-2" size={16} />
                  Удалить
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Партнёры</h3>
            <Button onClick={addPartner} size="sm" className="bg-primary hover:bg-primary/90">
              <Icon name="Plus" className="mr-2" size={16} />
              Добавить
            </Button>
          </div>
          {data.partners.map((partner) => (
            <Card key={partner.id} className="p-4">
              <div className="space-y-3">
                <div>
                  <Label>Название</Label>
                  <Input value={partner.name} onChange={(e) => updatePartner(partner.id, 'name', e.target.value)} />
                </div>
                <div>
                  <Label>URL логотипа</Label>
                  <Input value={partner.logoUrl} onChange={(e) => updatePartner(partner.id, 'logoUrl', e.target.value)} placeholder="https://..." />
                </div>
                <Button onClick={() => deletePartner(partner.id)} variant="destructive" size="sm">
                  <Icon name="Trash2" className="mr-2" size={16} />
                  Удалить
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="categories" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Управление категориями</h3>
          <Button onClick={addCategory} className="bg-primary hover:bg-primary/90 text-white font-bold">
            <Icon name="Plus" className="mr-2" size={16} />
            Добавить категорию
          </Button>
        </div>
        {data.categories.map((category) => (
          <Card key={category.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название категории</Label>
                <Input value={category.name} onChange={(e) => updateCategory(category.id, 'name', e.target.value)} placeholder="Заушные аппараты" />
              </div>
              <div>
                <Label>Иконка (название из Lucide)</Label>
                <Input value={category.icon} onChange={(e) => updateCategory(category.id, 'icon', e.target.value)} placeholder="Ear, Radio, Battery..." />
                <p className="text-xs text-muted-foreground mt-1">Примеры: Ear, Radio, Cable, Battery, Package, Tag</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded">
                <Icon name={category.icon as any} className="text-primary" size={24} fallback="Package" />
                <span className="font-bold">{category.name || 'Предпросмотр категории'}</span>
              </div>
              <Button variant="destructive" onClick={() => deleteCategory(category.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить категорию
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="catalog" className="space-y-4">
        <Button onClick={addProduct} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить товар
        </Button>
        {data.products.map((product) => (
          <Card key={product.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Категория</Label>
                <select 
                  value={product.categoryId} 
                  onChange={(e) => updateProduct(product.id, 'categoryId', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Без категории</option>
                  {data.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Название</Label>
                <Input value={product.name} onChange={(e) => updateProduct(product.id, 'name', e.target.value)} />
              </div>
              <div>
                <Label>URL картинки</Label>
                <Input value={product.imageUrl} onChange={(e) => updateProduct(product.id, 'imageUrl', e.target.value)} />
              </div>
              <div>
                <Label>Цена</Label>
                <Input type="number" value={product.price} onChange={(e) => updateProduct(product.id, 'price', Number(e.target.value))} />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea value={product.description} onChange={(e) => updateProduct(product.id, 'description', e.target.value)} />
              </div>
              <div>
                <Label>Характеристики</Label>
                <Textarea value={product.specs} onChange={(e) => updateProduct(product.id, 'specs', e.target.value)} />
              </div>
              <Button variant="destructive" onClick={() => deleteProduct(product.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="services" className="space-y-4">
        <Button onClick={addService} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить услугу
        </Button>
        {data.services.map((service) => (
          <Card key={service.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={service.name} onChange={(e) => updateService(service.id, 'name', e.target.value)} />
              </div>
              <div>
                <Label>URL картинки</Label>
                <Input value={service.imageUrl} onChange={(e) => updateService(service.id, 'imageUrl', e.target.value)} />
              </div>
              <div>
                <Label>Контакты</Label>
                <Input value={service.contact} onChange={(e) => updateService(service.id, 'contact', e.target.value)} />
              </div>
              <div>
                <Label>Описание услуги</Label>
                <Textarea value={service.description || ''} onChange={(e) => updateService(service.id, 'description', e.target.value)} rows={3} />
              </div>
              <div>
                <Label>Ссылка</Label>
                <Input value={service.link} onChange={(e) => updateService(service.id, 'link', e.target.value)} />
              </div>
              <Button variant="destructive" onClick={() => deleteService(service.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="about" className="space-y-4">
        <Button onClick={addAbout} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить раздел
        </Button>
        {data.about.map((item) => (
          <Card key={item.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={item.title} onChange={(e) => updateAbout(item.id, 'title', e.target.value)} />
              </div>
              <div>
                <Label>Описание</Label>
                <Textarea value={item.description} onChange={(e) => updateAbout(item.id, 'description', e.target.value)} rows={6} />
              </div>
              <Button variant="destructive" onClick={() => deleteAbout(item.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="articles" className="space-y-4">
        <Button onClick={addArticle} className="bg-primary hover:bg-primary/90 text-white font-bold">
          <Icon name="Plus" className="mr-2" size={16} />
          Добавить статью
        </Button>
        {data.articles.map((article) => (
          <Card key={article.id} className="border-2">
            <CardContent className="pt-6 space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={article.title} onChange={(e) => updateArticle(article.id, 'title', e.target.value)} />
              </div>
              <div>
                <Label>URL картинки (опционально)</Label>
                <Input value={article.imageUrl} onChange={(e) => updateArticle(article.id, 'imageUrl', e.target.value)} />
              </div>
              <div>
                <Label>Дата</Label>
                <Input value={article.date} onChange={(e) => updateArticle(article.id, 'date', e.target.value)} />
              </div>
              <div>
                <Label>Содержание</Label>
                <Textarea value={article.content} onChange={(e) => updateArticle(article.id, 'content', e.target.value)} rows={8} />
              </div>
              <Button variant="destructive" onClick={() => deleteArticle(article.id)}>
                <Icon name="Trash2" className="mr-2" size={16} />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="data" className="space-y-4">
        <div className="space-y-3">
          <Button onClick={onExport} className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
            <Icon name="Download" className="mr-2" size={16} />
            Экспортировать данные
          </Button>
          <div>
            <Label htmlFor="import-file" className="cursor-pointer">
              <div className="flex items-center justify-center w-full border-2 border-dashed rounded-lg p-6 hover:border-primary transition">
                <Icon name="Upload" className="mr-2" size={16} />
                <span className="font-bold">Импортировать данные</span>
              </div>
            </Label>
            <Input id="import-file" type="file" accept=".json" onChange={onImport} className="hidden" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default Index;