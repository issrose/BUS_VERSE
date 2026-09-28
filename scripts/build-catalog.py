"""Build fictional daily demo schedules, without passenger or booking data."""
import json, pathlib, copy
root = pathlib.Path(__file__).resolve().parents[1]
original = json.loads((root / 'busverse_db.json').read_text())
stops = original['stops']
extra = [
 ('Kollam','Kollam'),('Pathanamthitta','Pathanamthitta'),('Thodupuzha','Idukki'),('Munnar','Idukki'),
 ('Guruvayur','Thrissur'),('Irinjalakuda','Thrissur'),('Aluva','Ernakulam'),('Angamaly','Ernakulam'),
 ('Perumbavoor','Ernakulam'),('Muvattupuzha','Ernakulam'),('Pala','Kottayam'),('Changanassery','Kottayam'),
 ('Malappuram','Malappuram'),('Manjeri','Malappuram'),('Perinthalmanna','Malappuram'),('Tirur','Malappuram'),
 ('Nilambur','Malappuram'),('Ottapalam','Palakkad'),('Pazhayangadi','Kannur'),('Peringome','Kannur')]
for i,(name,district) in enumerate(extra):
 if not any(s['name']==name for s in stops):
  stops.append(dict(id=name.lower(),name=name,code='ST'+str(i+41),district=district,state='Kerala',landmark=name+' Bus Stand',isHub=False))
routes=copy.deepcopy(original['routes'])
# Every directory stop gets a connection to a regional hub; no claim of all-to-all direct service.
for s in stops:
 if any(r['source']==s['name'] or r['destination']==s['name'] for r in routes): continue
 hub = 'Kannur' if s['district']=='Kannur' else 'Kozhikode' if s['district'] in ['Kozhikode','Wayanad','Malappuram','Kasaragod'] else 'Ernakulam'
 routes.append(dict(id=s['id']+'-'+hub.lower(),source=s['name'],destination=hub,fareFrom=100,accent='blue',distanceKm=80,duration='2h 00m'))
for r in list(routes):
 if not any(x['source']==r['destination'] and x['destination']==r['source'] for x in routes):
  routes.append(dict(r,id=r['id']+'-return',source=r['destination'],destination=r['source']))
buses=copy.deepcopy(original['buses'])
# Include every existing service pair in the route directory.
for b in buses:
 if not any(r['source']==b['source'] and r['destination']==b['destination'] for r in routes):
  routes.append(dict(id=b['id']+'-route',source=b['source'],destination=b['destination'],fareFrom=b['fare'],accent='blue',duration=b['duration']))
for i,r in enumerate(routes):
 matches=[b for b in buses if b['source']==r['source'] and b['destination']==r['destination']]
 for n in range(len(matches),2):
  bid=f'demo-route-{i+1}-{n+1}'
  fare=r['fareFrom']+(40 if n else 0)
  import re
  h=re.search(r'(\d+)h',r['duration']); m=re.search(r'(\d+)m',r['duration'])
  minutes=(int(h[1])*60 if h else 0)+(int(m[1]) if m else 0)
  departure=8*60 if n==0 else 20*60
  def clock(t): return f'{(t//60)%24:02d}:{t%60:02d}'
  seats=[dict(id=f'{bid}-s{k+1}',busId=bid,seatNumber=f'{k//4+1}{"ABCD"[k%4]}',row=k//4+1,col=k%4+1,type='seater',fare=fare+(20 if k%4 in [0,3] else 0),status='available') for k in range(36)]
  buses.append(dict(id=bid,busNumber=f'DEMO-{i+1:03}-{n+1}',operator='BusVerse Demo Service',busType='AC Seater' if n else 'Non-AC Seater',isAc=bool(n),source=r['source'],destination=r['destination'],departure=clock(departure),arrival=clock(departure+minutes),duration=r['duration'],fare=fare,rating=4.2,amenities=['Luggage Rack'],boardingPoints=[r['source']+' Bus Stand'],droppingPoints=[r['destination']+' Bus Stand'],totalSeats=36,availableSeats=36,seats=seats))
 r['buses']=sum(b['source']==r['source'] and b['destination']==r['destination'] for b in buses)
 r['fareFrom']=min(b['fare'] for b in buses if b['source']==r['source'] and b['destination']==r['destination'])
for b in buses:
 b['isDemo']=True
 for s in b['seats']: s['status']='available'
 b['availableSeats']=len(b['seats'])
catalog=dict(version=2,isDemo=True,stops=stops,routes=routes,buses=buses)
for p in ['catalog.json','web/catalog.json']:
 (root / p).write_text(json.dumps(catalog,separators=(',',':')))
print(f'{len(stops)} stops, {len(routes)} routes, {len(buses)} demo services')
