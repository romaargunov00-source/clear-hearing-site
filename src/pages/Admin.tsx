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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

const PRODUCTS_API = 'https://functions.poehali.dev/d21add4f-1d9e-4a84-92ca-f909205b9b38';
const CATEGORIES_API = 'https://functions.poehali.dev/18f56703-a9d5-4d5d-ac38-86c6f3079366';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

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
    loadCategories();
    loadProducts();
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Панель администратора</h1>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              <Icon name="Home" className="mr-2 h-4 w-4" />
              На главную
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
                  <Select
                    value={productForm.category_id}
                    onValueChange={(value) =>
                      setProductForm({ ...productForm, category_id: value })
                    }
                  >
                    <SelectTrigger id="prod-category">
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
      </main>
    </div>
  );
};

export default Admin;
