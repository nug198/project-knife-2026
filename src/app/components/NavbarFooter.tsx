'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { name: "Main Hall", href: "/" },
  { name: "Collection", href: "/collection" },
  { name: "Craftsmen", href: "/craftsmen" },
  { name: "Knife-Talks", href: "/article" },
]

export default function NavbarFooter() {
  const pathname = usePathname()

  return (
    <nav className="w-full bg-transparent py-4">
      <div className="flex flex-wrap justify-center gap-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              text-gray-600 hover:text-green-600 transition-colors text-sm font-medium
              ${pathname === item.href ? 'text-green-600 font-semibold' : ''}
            `}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}