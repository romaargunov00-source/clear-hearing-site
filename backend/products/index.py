'''
Business: Управление товарами и услугами (CRUD операции)
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с товарами или результатом операции
'''

import json
import os
from typing import Dict, Any, List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get('DATABASE_URL')

def get_db_connection():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    }
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': ''
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            search = query_params.get('search', '').strip()
            category_id = query_params.get('category_id')
            
            query = '''
                SELECT p.*, c.name as category_name 
                FROM t_p14385979_clear_hearing_site.products p
                LEFT JOIN t_p14385979_clear_hearing_site.categories c ON p.category_id = c.id
            '''
            conditions = []
            
            if search:
                conditions.append(f"(p.name ILIKE '%{search}%' OR p.description ILIKE '%{search}%')")
            
            if category_id:
                conditions.append(f"p.category_id = {int(category_id)}")
            
            if conditions:
                query += ' WHERE ' + ' AND '.join(conditions)
            
            query += ' ORDER BY p.created_at DESC'
            
            cur.execute(query)
            products = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(products, default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            slug = body_data.get('slug', '').strip()
            description = body_data.get('description', '').strip()
            price = body_data.get('price')
            image_url = body_data.get('image_url', '').strip()
            category_id = body_data.get('category_id')
            is_service = body_data.get('is_service', False)
            
            if not name or not slug or price is None:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Заполните обязательные поля: название, slug, цена'})
                }
            
            cur.execute('SELECT COUNT(*) as count FROM t_p14385979_clear_hearing_site.products WHERE slug = %s', (slug,))
            existing = cur.fetchone()
            
            if existing and existing['count'] > 0:
                import time
                slug = f"{slug}-{int(time.time())}"
            
            insert_query = '''
                INSERT INTO t_p14385979_clear_hearing_site.products 
                (name, slug, description, price, image_url, category_id, is_service)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id, name, slug, description, price, image_url, category_id, is_service, created_at
            '''
            
            cur.execute(insert_query, (name, slug, description, price, image_url, category_id, is_service))
            new_product = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps(new_product, default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            product_id = body_data.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'ID товара обязателен'})
                }
            
            update_fields = []
            params = []
            
            if 'name' in body_data:
                update_fields.append('name = %s')
                params.append(body_data['name'])
            if 'slug' in body_data:
                update_fields.append('slug = %s')
                params.append(body_data['slug'])
            if 'description' in body_data:
                update_fields.append('description = %s')
                params.append(body_data['description'])
            if 'price' in body_data:
                update_fields.append('price = %s')
                params.append(body_data['price'])
            if 'image_url' in body_data:
                update_fields.append('image_url = %s')
                params.append(body_data['image_url'])
            if 'category_id' in body_data:
                update_fields.append('category_id = %s')
                params.append(body_data['category_id'])
            if 'is_service' in body_data:
                update_fields.append('is_service = %s')
                params.append(body_data['is_service'])
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Нет полей для обновления'})
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(product_id)
            
            update_query = f'''
                UPDATE t_p14385979_clear_hearing_site.products 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, name, slug, description, price, image_url, category_id, is_service, updated_at
            '''
            
            cur.execute(update_query, params)
            updated_product = cur.fetchone()
            conn.commit()
            
            if not updated_product:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Товар не найден'})
                }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(updated_product, default=str)
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            product_id = query_params.get('id')
            
            if not product_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'ID товара обязателен'})
                }
            
            delete_query = '''
                DELETE FROM t_p14385979_clear_hearing_site.products 
                WHERE id = %s
                RETURNING id
            '''
            
            cur.execute(delete_query, (int(product_id),))
            deleted = cur.fetchone()
            conn.commit()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Товар не найден'})
                }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'Товар удален'})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': cors_headers,
                'body': json.dumps({'error': 'Метод не поддерживается'})
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': cors_headers,
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cur.close()
        conn.close()