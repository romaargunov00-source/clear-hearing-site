'''
Business: API для управления всеми данными сайта (услуги, статьи, о компании, преимущества, партнеры, главная секция, заказы)
Args: event - dict с httpMethod, queryStringParameters, body
      context - object с request_id, function_name и т.д.
Returns: HTTP response dict
'''

import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor, Json

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    params = event.get('queryStringParameters', {}) or {}
    data_type = params.get('type', 'all')
    
    if method == 'GET':
        if data_type == 'services':
            cur.execute('SELECT * FROM services ORDER BY created_at DESC')
            items = cur.fetchall()
        elif data_type == 'articles':
            cur.execute('SELECT * FROM articles ORDER BY created_at DESC')
            items = cur.fetchall()
        elif data_type == 'about':
            cur.execute('SELECT * FROM about_items ORDER BY created_at DESC')
            items = cur.fetchall()
        elif data_type == 'advantages':
            cur.execute('SELECT * FROM advantages ORDER BY created_at DESC')
            items = cur.fetchall()
        elif data_type == 'partners':
            cur.execute('SELECT * FROM partners ORDER BY created_at DESC')
            items = cur.fetchall()
        elif data_type == 'hero':
            cur.execute('SELECT * FROM hero_section ORDER BY id DESC LIMIT 1')
            item = cur.fetchone()
            items = item if item else {}
        elif data_type == 'orders':
            cur.execute('SELECT * FROM orders ORDER BY created_at DESC')
            items = cur.fetchall()
        elif data_type == 'all':
            result = {}
            cur.execute('SELECT * FROM services ORDER BY created_at DESC')
            result['services'] = cur.fetchall()
            cur.execute('SELECT * FROM articles ORDER BY created_at DESC')
            result['articles'] = cur.fetchall()
            cur.execute('SELECT * FROM about_items ORDER BY created_at DESC')
            result['about'] = cur.fetchall()
            cur.execute('SELECT * FROM advantages ORDER BY created_at DESC')
            result['advantages'] = cur.fetchall()
            cur.execute('SELECT * FROM partners ORDER BY created_at DESC')
            result['partners'] = cur.fetchall()
            cur.execute('SELECT * FROM hero_section ORDER BY id DESC LIMIT 1')
            hero = cur.fetchone()
            result['hero'] = hero if hero else {}
            cur.execute('SELECT * FROM orders ORDER BY created_at DESC')
            result['orders'] = cur.fetchall()
            
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result, default=str)
            }
        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid type parameter'})
            }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(items, default=str)
        }
    
    elif method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        if data_type == 'order':
            cur.execute(
                '''INSERT INTO orders 
                (items, total, customer_first_name, customer_last_name, customer_phone, 
                customer_email, customer_address, customer_comment, status) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *''',
                (
                    Json(body_data.get('items', [])),
                    body_data.get('total'),
                    body_data.get('customer', {}).get('firstName'),
                    body_data.get('customer', {}).get('lastName'),
                    body_data.get('customer', {}).get('phone'),
                    body_data.get('customer', {}).get('email'),
                    body_data.get('customer', {}).get('address'),
                    body_data.get('customer', {}).get('comment'),
                    body_data.get('status', 'new')
                )
            )
            order = cur.fetchone()
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(order, default=str)
            }
        
        elif data_type == 'bulk':
            if 'services' in body_data:
                cur.execute('DELETE FROM services')
                for service in body_data['services']:
                    cur.execute(
                        'INSERT INTO services (name, image_url, contact, link, description) VALUES (%s, %s, %s, %s, %s)',
                        (service.get('name'), service.get('imageUrl'), service.get('contact'), service.get('link'), service.get('description'))
                    )
            
            if 'articles' in body_data:
                cur.execute('DELETE FROM articles')
                for article in body_data['articles']:
                    cur.execute(
                        'INSERT INTO articles (title, content, image_url, date) VALUES (%s, %s, %s, %s)',
                        (article.get('title'), article.get('content'), article.get('imageUrl'), article.get('date'))
                    )
            
            if 'about' in body_data:
                cur.execute('DELETE FROM about_items')
                for item in body_data['about']:
                    cur.execute(
                        'INSERT INTO about_items (title, description) VALUES (%s, %s)',
                        (item.get('title'), item.get('description'))
                    )
            
            if 'advantages' in body_data:
                cur.execute('DELETE FROM advantages')
                for adv in body_data['advantages']:
                    cur.execute(
                        'INSERT INTO advantages (icon, title, description) VALUES (%s, %s, %s)',
                        (adv.get('icon'), adv.get('title'), adv.get('description'))
                    )
            
            if 'partners' in body_data:
                cur.execute('DELETE FROM partners')
                for partner in body_data['partners']:
                    cur.execute(
                        'INSERT INTO partners (name, logo_url) VALUES (%s, %s)',
                        (partner.get('name'), partner.get('logoUrl'))
                    )
            
            if 'hero' in body_data:
                cur.execute('DELETE FROM hero_section')
                hero = body_data['hero']
                cur.execute(
                    'INSERT INTO hero_section (title, highlighted_text, subtitle, description, image_url) VALUES (%s, %s, %s, %s, %s)',
                    (hero.get('title'), hero.get('highlightedText'), hero.get('subtitle'), hero.get('description'), hero.get('imageUrl'))
                )
            
            category_id_map = {}
            if 'categories' in body_data:
                cur.execute('DELETE FROM categories')
                for category in body_data['categories']:
                    old_id = category.get('id')
                    cur.execute(
                        'INSERT INTO categories (name, icon) VALUES (%s, %s) RETURNING id',
                        (category.get('name'), category.get('icon'))
                    )
                    new_id = cur.fetchone()['id']
                    category_id_map[old_id] = new_id
            
            if 'products' in body_data:
                cur.execute('DELETE FROM products')
                for product in body_data['products']:
                    old_category_id = product.get('categoryId')
                    new_category_id = category_id_map.get(old_category_id) if old_category_id else None
                    cur.execute(
                        'INSERT INTO products (name, image_url, price, description, specs, category_id) VALUES (%s, %s, %s, %s, %s, %s)',
                        (product.get('name'), product.get('imageUrl'), product.get('price'), product.get('description'), product.get('specs'), new_category_id)
                    )
            
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Data saved successfully'})
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request'})
        }
    
    cur.close()
    conn.close()
    return {
        'statusCode': 405,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }