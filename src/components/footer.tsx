import { Copyright, Github, Globe, Linkedin, LinkedinIcon, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Footer(){
    return(
        <>
        <div className="px-10 pt-10 pb-2  bg-yellow-950">
                <div className="border p-2 rounded-2xl border-white">

                <div className=" w-full rounded-2xl text-center flex items-center justify-between px-2 gap-3 border-white text-white text-xs md:text-md"><MessageCircle color="white"/> <span className="tracking-wide"> Your next idea, beautifully designed and flawlessely built </span> <Globe color="white"/> </div>
            </div>

<div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-12 pb-10 md:px-10 items-center">
            <div className="">
            <h1 className="text-4xl md:text-5xl font-serif text-white md:w-79 text-center  md:tracking-widest">Lets Code It TOday</h1>
            </div>

            <div className="flex-col flex gap-4 text-gray-300">
                <div className="pb-5 flex-col flex gap-5">

                <h2 className="text-center text-xl font-bold">Contacts</h2>
                <div className="flex justify-between text-sm">

                <Link href="" className="flex items-center gap-1"><Linkedin size={15}/>Linkedin</Link>
                <Link href="" className="flex items-center gap-1"><Mail size={15}/>Email</Link>
                <Link href="" className="flex items-center gap-1"><MessageCircle size={15}/>Whatsapp</Link>
               
                </div>
                </div>
                <div>

                    <div className=" flex-col flex gap-5">

                <h2 className="text-center text-xl font-bold">CodeWork</h2>
                     <div className="flex justify-between text-sm">

                <Link className="flex items-center gap-2" href=""><Github/>Github</Link>
                <Link href="">Github</Link>
                <Link href="">Github</Link>
                
                    </div>
                </div>
                </div>
              
            </div>

            <div className="text-white md:px-15">
                <h2 className="text-center text-xl font-bold pb-3">Services</h2>
                <ul className="flex-col flex gap-3 text-center text-sm">
                    <li>FrontEnd</li>
                    <li>Backend</li>
                    <li>Full Stack Website</li>
                    <li>Database Management</li>
                    <li>Testing and Debugging</li>
                </ul>

            </div>
</div>

                </div>
<div className="border-t border-white flex justify-center text-xs bg-gray-100 text-black">
<span className="flex gap-1 items-center">Copyright <Copyright color="black"/>2026 TALHA SHABBIR, ALL RIGHTS RESERVED</span>
</div>
        </>
       
    )
}