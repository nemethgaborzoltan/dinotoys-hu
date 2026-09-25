import type { StorefrontPromotion,StorefrontPopup } from '../server/storefront'
export const demoPromotions:StorefrontPromotion[]=[
{id:'demo-welcome',name:'Első rendelés 10%',code:'WELCOME10',kind:'percentage',value:10,description:'10% kedvezmény minimum 8 000 Ft kosárértéktől.',conditions:{minSubtotal:8000},maxDiscountHuf:null},
{id:'demo-fixed',name:'1 500 Ft kedvezmény',code:'DINO1500',kind:'fixed',value:1500,description:'Fix kedvezmény 15 000 Ft feletti kosárra.',conditions:{minSubtotal:15000},maxDiscountHuf:null},
{id:'demo-free',name:'Ingyenes szállítás',code:'SHIPFREE',kind:'free_shipping',value:0,description:'Ingyenes standard szállítás 7 000 Ft felett.',conditions:{minSubtotal:7000},maxDiscountHuf:null},
]
export const demoPopup:StorefrontPopup={id:'demo-popup',name:'Üdvözlő kupon',title:'Szerezz 10% kedvezményt az első rendelésedre',body:'Aktiváld a WELCOME10 kupont, és a kosárban azonnal látod a kedvezményt.',eyebrow:'Exkluzív ajánlat',couponCode:'WELCOME10',ctaLabel:'Kupon aktiválása',ctaHref:'/termekek',triggerType:'delay',delaySeconds:4,minCartHuf:null,pageScope:'all',frequency:'session',content:{}}
