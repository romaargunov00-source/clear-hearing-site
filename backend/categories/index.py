'''
Business: Управление категориями товаров (CRUD операции)
Args: event - dict с httpMethod, body, queryStringParameters
      context - объект с атрибутами request_id, function_name
Returns: HTTP response dict с категориями или результатом операции
'''

import json
import os
from typing import Dict, Any
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
            cur.execute('''
                SELECT id, name, slug, description, created_at, updated_at
                FROM t_p14385979_clear_hearing_site.categories
                ORDER BY created_at DESC
            ''')
            categories = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(categories, default=str)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            slug = body_data.get('slug', '').strip()
            description = body_data.get('description', '').strip()
            
            if not name or not slug:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Название и slug обязательны'})
                }
            
            cur.execute('SELECT COUNT(*) as count FROM t_p14385979_clear_hearing_site.categories WHERE slug = %s', (slug,))
            existing = cur.fetchone()
            
            if existing and existing['count'] > 0:
                import time
                slug = f"{slug}-{int(time.time())}"
            
            insert_query = '''
                INSERT INTO t_p14385979_clear_hearing_site.categories 
                (name, slug, description)
                VALUES (%s, %s, %s)
                RETURNING id, name, slug, description, created_at
            '''
            
            cur.execute(insert_query, (name, slug, description))
            new_category = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': cors_headers,
                'body': json.dumps(new_category, default=str)
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            category_id = body_data.get('id')
            
            if not category_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'ID категории обязателен'})
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
            
            if not update_fields:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Нет полей для обновления'})
                }
            
            update_fields.append('updated_at = CURRENT_TIMESTAMP')
            params.append(category_id)
            
            update_query = f'''
                UPDATE t_p14385979_clear_hearing_site.categories 
                SET {', '.join(update_fields)}
                WHERE id = %s
                RETURNING id, name, slug, description, updated_at
            '''
            
            cur.execute(update_query, params)
            updated_category = cur.fetchone()
            conn.commit()
            
            if not updated_category:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Категория не найдена'})
                }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps(updated_category, default=str)
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters') or {}
            category_id = query_params.get('id')
            
            if not category_id:
                return {
                    'statusCode': 400,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'ID категории обязателен'})
                }
            
            delete_query = '''
                DELETE FROM t_p14385979_clear_hearing_site.categories 
                WHERE id = %s
                RETURNING id
            '''
            
            cur.execute(delete_query, (int(category_id),))
            deleted = cur.fetchone()
            conn.commit()
            
            if not deleted:
                return {
                    'statusCode': 404,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Категория не найдена'})
                }
            
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'Категория удалена'})
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