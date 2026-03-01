'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function NavTabs() {
  const pathname = usePathname()

  const tabValue = pathname.startsWith('/lembretes/novo')
    ? '/lembretes/novo'
    : pathname.startsWith('/lembretes')
      ? '/lembretes'
      : ''

  return (
    <Tabs value={tabValue}>
      <TabsList>
        <TabsTrigger value="/lembretes/novo" asChild>
          <Link 
            href="/lembretes/novo"
            className='text-primary'
          >
              Novo lembrete
            </Link>
        </TabsTrigger>
        <TabsTrigger value="/lembretes" asChild>
          <Link 
            href="/lembretes/"
            className='text-primary'
          >
              Meus lembretes
            </Link>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
