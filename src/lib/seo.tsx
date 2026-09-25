import type { ReactNode } from 'react'

export const SITE_ORIGIN='https://dinotoys.hu'
export const SITE_NAME='DinoToys.hu'

export function absoluteUrl(path='/' ){
  return new URL(path,SITE_ORIGIN).toString()
}

export function SeoJsonLd({data}:{data:Record<string,unknown>|Array<Record<string,unknown>>}){
  const json=JSON.stringify(data).replace(/</g,'\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:json}}/>
}

export function OrganizationJsonLd(){
  return <SeoJsonLd data={{
    '@context':'https://schema.org',
    '@type':'OnlineStore',
    name:SITE_NAME,
    url:SITE_ORIGIN,
    logo:absoluteUrl('/favicon.svg'),
    currenciesAccepted:'HUF',
    areaServed:'HU',
  }}/>
}

export function VisuallyHidden({children}:{children:ReactNode}){
  return <span className="sr-only">{children}</span>
}
