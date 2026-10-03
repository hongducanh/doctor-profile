# python3 design/i18n/check.py <lang>  → kiểm cấu trúc bản dịch khớp src (khoá, độ dài mảng, số <br>, chuỗi không rỗng)
import json,sys
lang=sys.argv[1]; bad=0
def cmp(a,b,p):
    global bad
    if isinstance(a,dict):
        if not isinstance(b,dict) or set(a)!=set(b): print('KEYS',p,set(a)^set(b if isinstance(b,dict) else {})); bad+=1; return
        for k in a: cmp(a[k],b[k],p+'.'+k)
    elif isinstance(a,list):
        if not isinstance(b,list) or len(a)!=len(b): print('LEN',p); bad+=1; return
        for i,(x,y) in enumerate(zip(a,b)): cmp(x,y,f'{p}[{i}]')
    else:
        if not isinstance(b,str) or (a.strip() and not b.strip()): print('EMPTY',p); bad+=1
        elif a.count('<br>')!=b.count('<br>'): print('BR',p); bad+=1
for k in ['kate','chris','giang','hailey','henry']:
    try: cmp(json.load(open(f'design/i18n/src/{k}.json')),json.load(open(f'design/i18n/{lang}/{k}.json')),k)
    except Exception as e: print('ERR',k,e); bad+=1
print('OK' if not bad else f'{bad} lỗi')
