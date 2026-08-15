import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import CustomCursor from './CustomCursor'

export default function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <CustomCursor />
      <Navbar />
      <main className="page-body">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
