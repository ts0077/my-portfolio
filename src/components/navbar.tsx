'use client'
import { ArrowBigRightDash, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";


type NavLink = {
    name: string
    href: string
}

export default function Navbar() {
    const pathname = usePathname()
    const links: NavLink[] = [
        { name: "Home", href: "/" },
        { name: "Services", href: "#services-section" },
        { name: "Projects", href: "/#project-section" },
        { name: "About", href: "#about-section" },
        { name: "Contact", href: "#contact-section" },
    ]

    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)
const navRef = useRef<HTMLDivElement | null>(null)

useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {

        if (
            navRef.current &&
            !navRef.current.contains(event.target as Node)
        ) {
            setIsHamburgerOpen(false)
        }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
        document.removeEventListener("mousedown", handleClickOutside)
    }

}, [])

    return (

        <nav className="bg-yellow-950 shadow-md relative">
            <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">

                <div className="flex items-center justify-between py-4">

                    <div className=" font-bold text-xl text-white ">
                        <Link href="/" >TALHA SHABBIR</Link>
                    </div>
                    <div className="md:flex items-center gap-6 hidden">

                        <div className="flex gap-5 ">
                            {
                                links.map((l) => (
                                    <Link className={`${pathname === l.href ? "font-bold bg-white text-black px-4 py-2 rounded-3xl" : "px-4 py-2 text-white"}`} key={l.href} href={l.href}>{l.name}</Link>
                                ))
                            }

                        </div>
                        <button className="bg-white rounded-2xl px-4 py-2 font-semibold text-black flex gap-2 items-center">Hire me <ArrowBigRightDash /></button>
                    </div>

                    <button onClick={() => setIsHamburgerOpen(prev => !prev)} className="md:hidden text-white">
                        {isHamburgerOpen ? <X /> : <Menu />}

                    </button>

                </div>
            </div>


            <div ref={navRef}  className={` md:hidden absolute w-full top-full z-50 left-0  transition-all duration-300 overflow-hidden ease-in-out ${isHamburgerOpen ? "max-h-96 opacity-100 pb-6 bg-yellow-950" : "max-h-0 opacity-0 "}`}>
                <div className="max-w-7xl mx-auto px-4 flex flex-col gap-5 items-center">

                    {
                        links.map((l) => (
                            <Link onClick={() => setIsHamburgerOpen(false)} className={` ${pathname === l.href ? "font-bold bg-white text-black px-4 py-2 rounded-3xl w-full max-w-xs text-center" : "px-4 py-2 text-white"}`} key={l.href} href={l.href}>{l.name}</Link>
                        ))
                    }

                    <button className="bg-white rounded-2xl w-full justify-center px-4 py-2 font-semibold text-black flex gap-2 items-center">Hire me <ArrowBigRightDash /></button>
                </div>


            </div>
        </nav>
    )
}