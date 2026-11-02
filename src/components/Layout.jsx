
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Sidebar />

      <div className="md:pl-[252px]">
        <Navbar />

        <main className="mx-auto max-w-[1440px] p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
