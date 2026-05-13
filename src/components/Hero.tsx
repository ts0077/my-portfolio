import { Download, Facebook, Instagram, Linkedin, LinkedinIcon, LucideLinkedin, Twitter } from "lucide-react"
import styles from './Typing.module.css';
import Link from "next/link";
type HeroProps = {
    name: string
    title: string
    subTitle: string
    buttonText?: string
    onButtonClick?: () => void
}

export default function Hero({ name, title, subTitle, buttonText, onButtonClick }: HeroProps) {
    return (
        <>
            <section className="bg-gray-50 py-10 md:py-0 ">

                <div className="max-w-7xl mx-auto ">

                    <div className="flex flex-col-reverse md:flex-row items-center justify-between md:min-h-[90vh] gap-12">


                        <div className="flex flex-col gap-7 max-w-xl">

                            <div className=" flex flex-col gap-2 ">
                                <p className="text-gray-600">Hello I'm</p>
                                <span className="text-yellow-950 font-bold text-xl">{name}</span>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight ">{title}</h1>
                                <span className="text-gray-600 ">{subTitle}</span>
                            </div>

                            <div className="  flex-col gap-2 flex md:flex-wrap md:flex-row  md:gap-3">

                                <Link href={"#services-section"}
                                    onClick={onButtonClick}
                                    className="bg-yellow-950 text-white px-6 py-2 text-center rounded-xl focus:ring-2 transition-all duration-300 hover:bg-yellow-900 font-semibold">{buttonText}</Link>
                                <a href="/talhashabbir-13-05-2026-Resume.pdf" download={"Talha Shabbir Resume"}>

                                    <button className="py-2 px-6 w-full  flex gap-2 justify-center  border items-center rounded-xl cursor-pointer">Download CV <Download /> </button>
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">

                            <img src="/pfp.jpg" alt="Profile Picture" className="w-64 md:w-80 aspect-square rounded-full object-cover" />


                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}