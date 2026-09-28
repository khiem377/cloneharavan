import json, os

json_path = os.path.join(os.path.dirname(__file__), '..', '..', 'cloneharavan.products.json')
with open(json_path, 'r', encoding='utf-8') as f:
    prods = json.load(f)

for p in prods:
    oid = p.get('_id', {}).get('$oid', '')
    sku = p.get('sku', '')
    name = p.get('name', '')
    price = p.get('price', 0)
    sale = p.get('salePrice', 0)
    stock = p.get('stock', 0)
    print(f'OID={oid} | SKU={sku} | NAME={name} | price={price} | salePrice={sale} | stock={stock}')
