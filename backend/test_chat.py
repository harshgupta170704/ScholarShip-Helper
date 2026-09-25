import httpx

c = httpx.Client(base_url='http://127.0.0.1:8000')
r = c.post('/api/chat/start', json={})
sid = r.json()['session_id']
print('=== START OK ===')

steps = [
    ('harsh gupta', 'NAME'),
    ('lokesh kumar gupta', 'FATHER'),
    ('aarti gupta', 'MOTHER'),
    ('2004-07-17', 'DOB'),
    ('Male', 'GENDER'),
    ('OBC', 'CATEGORY'),
]
for msg, label in steps:
    r = c.post(f'/api/chat/message/{sid}', data={'message': msg})
    if r.status_code != 200:
        print(f'{label}: ERROR {r.status_code} - {r.text[:200]}')
        break
    d = r.json()
    resp_text = d["message"][:120]
    print(f'{label}: {resp_text}')

print('=== DONE ===')
