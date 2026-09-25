import { createFileRoute } from '@tanstack/react-router'
import { AdminApp } from '../components/admin/AdminApp'

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: 'DinoAdmin | DinoToys.hu' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: AdminApp,
})
