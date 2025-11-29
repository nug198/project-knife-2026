"use client"

import { useRouter, useSearchParams } from "next/navigation"

export default function DropdownKategori({ categories, selected }: { categories: any[]; selected: string }) {
  const router = useRouter()
  const params = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value
    router.push(`/collection?category=${newCategory}`)
  }

  return (
    <select
      onChange={handleChange}
      value={selected}
      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-gray-400"
    >
      <option value="all">All</option>
      {categories.map((cat) => (
        <option key={cat.id_kategori} value={cat.slug}>
          {cat.nama_kategori}
        </option>
      ))}
    </select>
  )
}
