export type Product = {
  id: string
  slug: string
  name: string
  brand: string
  category: string
  sourceSku: string
  ean: string
  retailPrice: number
  compareAtPrice?: number
  stock: number
  ageFrom: number
  tags: string[]
  description: string
  highlights: string[]
  art: string
  accent: string
  rating: number
  reviewCount: number
  newArrival?: boolean
  trending?: boolean
  compliance: {
    manufacturer: string
    responsiblePerson: string
    warning: string
    ceMarked: boolean
    safetyStatus: 'ready' | 'needs_review'
  }
}

const svg = (label: string, symbol: string, accent: string) => {
  const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" rx="64" fill="#f6f7fb"/><circle cx="650" cy="120" r="150" fill="${accent}" opacity=".14"/><circle cx="130" cy="680" r="190" fill="${accent}" opacity=".10"/><text x="400" y="370" font-family="Arial" font-size="220" text-anchor="middle">${symbol}</text><text x="400" y="560" font-family="Arial" font-weight="700" font-size="42" text-anchor="middle" fill="#111827">${label}</text><text x="400" y="615" font-family="Arial" font-size="24" text-anchor="middle" fill="#6b7280">Demo termékkép</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(image)}`
}

export const products: Product[] = [
  {id:'p-30346',slug:'world-of-dinosaurs-novo-dino-tojas',name:'World of Dinosaurs növekvő dínótojás',brand:'Dinoworld',category:'Dínók & figurák',sourceSku:'6431900124',ean:'64319001241000000200',retailPrice:2490,compareAtPrice:2990,stock:34,ageFrom:3,tags:['dínó','meglepetés','ajándék'],description:'Tedd vízbe a tojást, és figyeld, ahogy fokozatosan előbújik belőle a dínó. Látványos, könnyen ajándékozható meglepetésjáték.',highlights:['6-féle figura','Kis ajándéknak ideális','Gyorsan polcra tehető trendtermék'],art:svg('Dínótojás','🥚','#78c86b'),accent:'#78c86b',rating:4.8,reviewCount:126,newArrival:true,trending:true,compliance:{manufacturer:'Beszállítói adat importálandó',responsiblePerson:'EU felelős személy adata importálandó',warning:'3 éves kor alatt nem ajánlott. Apró alkatrészeket tartalmazhat.',ceMarked:true,safetyStatus:'needs_review'}},
  {id:'p-hotwheels',slug:'hot-wheels-mystery-models-blindbag',name:'Hot Wheels Mystery Models blindbag',brand:'Hot Wheels',category:'Járművek',sourceSku:'DEMO-HW-01',ean:'DEMO00000001',retailPrice:1990,stock:52,ageFrom:3,tags:['autó','blindbag','gyűjthető'],description:'Meglepetés Hot Wheels kisautó gyűjtőknek és játékhoz. A csomag tartalma véletlenszerű.',highlights:['Gyűjthető','Meglepetés csomag','Könnyű ajándék'],art:svg('Hot Wheels','🏎️','#ff5b4d'),accent:'#ff5b4d',rating:4.9,reviewCount:244,trending:true,compliance:{manufacturer:'Mattel / forrásadatból',responsiblePerson:'Forrásadatból',warning:'3 éves kor alatt nem ajánlott. Apró alkatrészek.',ceMarked:true,safetyStatus:'needs_review'}},
  {id:'p-kawaii',slug:'kawaii-kuties-memory-game',name:'Kawaii Kuties memóriajáték',brand:'Kawaii',category:'Puzzle & játék',sourceSku:'DEMO-KW-01',ean:'DEMO00000002',retailPrice:3490,compareAtPrice:3990,stock:19,ageFrom:4,tags:['memória','kawaii','családi'],description:'Vidám, kompakt memóriajáték aranyos karakterekkel. Utazáshoz és családi játékhoz is praktikus.',highlights:['Kompakt méret','Családi játék','4+ éves kortól'],art:svg('Memory','🧠','#f7b4cf'),accent:'#f7b4cf',rating:4.7,reviewCount:87,newArrival:true,compliance:{manufacturer:'Forrásadatból',responsiblePerson:'Forrásadatból',warning:'A csomagolást gyermeknek ne add oda.',ceMarked:true,safetyStatus:'needs_review'}},
  {id:'p-schleich',slug:'schleich-quetzalcoatlus',name:'Schleich Dinosaurs Quetzalcoatlus',brand:'Schleich',category:'Dínók & figurák',sourceSku:'DEMO-SC-01',ean:'DEMO00000003',retailPrice:8990,stock:11,ageFrom:4,tags:['schleich','dínó','figura'],description:'Részletgazdag dinoszaurusz figura szerepjátékhoz és gyűjteménybe.',highlights:['Részletgazdag kidolgozás','Gyűjthető','Tartós játékfigura'],art:svg('Quetzalcoatlus','🦕','#6bb6c9'),accent:'#6bb6c9',rating:4.9,reviewCount:63,compliance:{manufacturer:'Schleich / forrásadatból',responsiblePerson:'Forrásadatból',warning:'A gyártói korhatár- és biztonsági jelölést ellenőrizni kell publikálás előtt.',ceMarked:true,safetyStatus:'needs_review'}},
  {id:'p-stitch',slug:'disney-stitch-pluss-kulcstarto',name:'Disney Stitch plüss kulcstartó',brand:'Disney',category:'Plüss & kulcstartó',sourceSku:'DEMO-DS-01',ean:'DEMO00000004',retailPrice:3290,stock:41,ageFrom:3,tags:['stitch','plüss','kulcstartó'],description:'Puha Stitch plüss bag clip, hátizsákra vagy kulcscsomóra.',highlights:['Licencelt karakter','Ajándéknak könnyű választás','Táskára akasztható'],art:svg('Stitch','💙','#6a8cff'),accent:'#6a8cff',rating:4.8,reviewCount:151,trending:true,compliance:{manufacturer:'Licencelt gyártói adat importálandó',responsiblePerson:'Forrásadatból',warning:'A termék címkéjén szereplő korhatár- és kezelési jelölés az irányadó.',ceMarked:true,safetyStatus:'needs_review'}},
  {id:'p-uno',slug:'uno-express-kartyajatek',name:'UNO Express kártyajáték',brand:'Mattel',category:'Puzzle & játék',sourceSku:'DEMO-UNO-01',ean:'DEMO00000005',retailPrice:2990,stock:27,ageFrom:7,tags:['uno','kártya','utazás'],description:'Kompakt, gyors UNO-változat utazáshoz és rövid játékokhoz.',highlights:['Utazó méret','Gyors játékmenet','Családi klasszikus'],art:svg('UNO Express','🃏','#ffd451'),accent:'#ffd451',rating:4.6,reviewCount:92,compliance:{manufacturer:'Mattel / forrásadatból',responsiblePerson:'Forrásadatból',warning:'A gyártó által megadott korhatár az irányadó.',ceMarked:true,safetyStatus:'needs_review'}},
  {id:'p-hello',slug:'hello-kitty-3d-radir-szett',name:'Hello Kitty 3D radír 3-pack',brand:'Sanrio',category:'Back to School',sourceSku:'DEMO-HK-01',ean:'DEMO00000006',retailPrice:1890,stock:68,ageFrom:6,tags:['hello kitty','iskola','radír'],description:'Háromdarabos 3D radír szett iskolakezdéshez és apró ajándéknak.',highlights:['3 darabos szett','Trend licenc','Iskolakezdésre'],art:svg('Hello Kitty','🎀','#ff9fc8'),accent:'#ff9fc8',rating:4.7,reviewCount:74,newArrival:true,compliance:{manufacturer:'Licencelt gyártói adat importálandó',responsiblePerson:'Forrásadatból',warning:'Nem élelmiszer. Rendeltetésszerű használatra.',ceMarked:false,safetyStatus:'needs_review'}},
  {id:'p-squeeze',slug:'squeeze-vaj-slow-rise',name:'Squeeze vaj slow-rise stresszjáték',brand:'Dinotoys',category:'Fidget & squeeze',sourceSku:'DEMO-SQ-01',ean:'DEMO00000007',retailPrice:2490,stock:23,ageFrom:6,tags:['squeeze','fidget','stressz'],description:'Puha slow-rise squeeze játék látványos formával.',highlights:['Slow-rise anyag','Trendtermék','Impulzusvásárlásra erős'],art:svg('Squeeze','🧈','#f2c864'),accent:'#f2c864',rating:4.5,reviewCount:58,trending:true,compliance:{manufacturer:'Forrásadatból',responsiblePerson:'Forrásadatból',warning:'Nem ehető. Sérült terméket ne használj.',ceMarked:true,safetyStatus:'needs_review'}}
]

export const categories = [
  { name: 'Plüss & kulcstartó', icon: '🧸', blurb: 'Stitch, karakterek és puha ajándékok' },
  { name: 'Dínók & figurák', icon: '🦕', blurb: 'Gyűjthető figurák és felfedező játékok' },
  { name: 'Járművek', icon: '🏎️', blurb: 'Kisautók, meglepetések, versenyzés' },
  { name: 'Puzzle & játék', icon: '🧩', blurb: 'Családi és utazó játékok' },
  { name: 'Fidget & squeeze', icon: '🫧', blurb: 'Tapizható trendjátékok' },
  { name: 'Back to School', icon: '🎒', blurb: 'Iskolai apróságok és kiegészítők' },
]
