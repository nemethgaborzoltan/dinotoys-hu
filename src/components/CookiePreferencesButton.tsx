export function CookiePreferencesButton({className='footer-cookie-button',label='Cookie beállítások'}:{className?:string;label?:string}){
 return <button type="button" className={className} onClick={()=>window.dispatchEvent(new CustomEvent('dinotoys:open-consent'))}>{label}</button>
}
