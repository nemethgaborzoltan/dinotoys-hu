export function CookiePreferencesButton({className='footer-cookie-button'}:{className?:string}){
 return <button type="button" className={className} onClick={()=>window.dispatchEvent(new CustomEvent('dinotoys:open-consent'))}>Cookie beállítások</button>
}
