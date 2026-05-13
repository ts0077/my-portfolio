'use client'
import CardServices, { CardHomeProjects } from "@/components/Card";
import Card from "@/components/Card";
import Footer from "@/components/footer";
import Hero from "@/components/Hero";
import { ArrowRight, Contact, Dot, Github, Globe, MailOpen } from "lucide-react";
import { useState } from "react";
import Link from "next/link";


type ProjectType = {
  name: string
  link:string,
  websiteLink?: string
  githubLink?: string
  techStack?: string
  description?: string
  coreFeatures?: string
}


export default function HOME() {
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);

  const services = [
    {
      title: "Frontend Excellence",
      desc: "Building interactive, responsive, and SEO friendly interfaces using Next.js and Tailwind CSS.",
      icon: "🖥️" // Or a Lucide Icon
    },
    {
      title: "Backend Architecture",
      desc: "Developing robust APIs and server-side logic using ASP.NET Core for high-performance apps.",
      icon: "🛠️"
    },
    {
      title: "Database Solutions",
      desc: "Expertise in MSSQL, designing complex relational structures and optimizing stored procedures.",
      icon: "🗄️"
    }
  ];

  const projects:ProjectType[] = [
    {
      name: "Water Supply",
      link: "/pjtestdesign.png",
      websiteLink: "/",
      githubLink: "/",
      techStack: "NEXT.js, Type SCript, C#, ASP.net, JavaScript, MSSQL",
      description:"This project has been built for water supply service",
      coreFeatures: "Add Customer, Connections, Generate Bill, Print Bills, DSOwnload Bills PDF"
    },
    {
      name: "Water Supply",
      link: "/pjtestdesign.png"
    },
    {
      name: "Water Supply",
      link: "/pjtestdesign.png"
    },
    {
      name: "Water Supply",
      link: "/pjtestdesign.png"
    }
  ]
  return (
    <div className="min-h-screen text-gray-900 bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <Hero name="TALHA SHABBIR" title="Full Stack Developer And Website Designer" subTitle="I am designing from 2024 and currently designing website front end and in the backend, The main focus on designing the websites by developing i an efficient way" buttonText="Explore Services" />
      </div>

      <div id="services-section" className="w-full bg-gray-100 py-10 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-3xl font-bold text-center font-serif text-yellow-950">Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-5">
            {services.map((service, index) => (
              <CardServices icon={service.icon} title={service.title} description={service.desc} />
            ))}
          </div>
        </div>
      </div>

      <div id="about-section" className="grid grid-cols-1 md:grid-cols-2 p-10 gap-5 py-10 scroll-mt-20 ">
        <div className="bg-gray-50 p-5 flex flex-col gap-3 border-gray-800 border-2 rounded-4xl  outline-2 -outline-offset-6 outline-yellow-950 shadow-md ">
          <h2 className="text-2xl font-bold text-center font-serif text-yellow-950">Education</h2>
          <span className="flex gap-2 items-center"><Dot />BS IT (2021-2025)</span>
          <span>Completed my graduation in IT from University of Chakwal</span>
        </div>
        <div className="bg-yellow-950 text-white p-5 flex flex-col gap-3 border-yellow-950 outline -outline-offset-4 outline-white rounded-4xl">
          <h2 className="text-2xl font-bold text-center font-serif">Work Experience</h2>
          <div className="flex flex-col gap-1">
            <span className="flex pb-2"><Dot />Full Stack Role (7+ Months - Ongoing)</span>
            <span>Working at Mind Links Software House, where developing and integrating Apis while keeping UI as eyecatching as of customer need </span>
          </div>
        </div>
      </div>

      <div className="p-10 bg-gray-100">
        <h2 className="text-3xl font-bold text-center py-2 font-serif text-yellow-950">Tech Stack</h2>
        <div className="grid grid-cols-4 items-center ">
          <img className="rounded-full p-4 w-35" src="Nextjslogo.png" alt="" />
          <img className="rounded-full  p-4 w-35" src="tailwindlogo.png" alt="" />
          <img className="rounded-full  p-4 w-35" src="typelogo.png" alt="" />
          <img className="rounded-full  p-4 w-35" src="chashlogo.png" alt="" />
          <img className="rounded-full  p-4 w-35" src="asplogo.png" alt="" />
          <img className="rounded-full p-4 w-35" src="javalogo.png" alt="" />
          <img className="rounded-full  p-4 w-35" src="springbootlogo.png" alt="" />
          <img className="  p-4 w-35" src="mssqllogo.png" alt="" />
        </div>
      </div>

      <h1 className="font-bold font-serif text-3xl text-center pt-10  text-yellow-950 ">Projects</h1>
      <div id="project-section" className=" pt-3 md:pt-0 pb-10 px-10 scroll-mt-35">
        <div className=" flex justify-between items-center md:flex md:justify-between md:items-center py-2">
          <span className="text-sm md:text-xl font-semibold">Featured Ones</span>
          <button className="bg-yellow-950 hover:bg-yellow-900 transition-all duration-300 cursor-pointer text-white px-3 py-1 text-sm md:text-md md:px-5 md:py-2 font-bold rounded flex items-center gap-2 justify-center mr-4 md:mr-0 ">VIEW ALL <ArrowRight /></button>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-4 gap-5 md:gap-3">
          {
            projects.map((project) => (
              <CardHomeProjects key={project.name} name={project.name} link={project.link} onViewDetails={() => setSelectedProject(project)}/>
            ))
          }
        </div>
        {
          selectedProject && (
            <div onClick={()=> setSelectedProject(null)}  className="fixed inset-0 z-100 bg-black/50 flex justify-center items-center p-4">
              <div onClick={(e)=> e.stopPropagation()} className="bg-white p-8 rounded-xl max-w-lg w-full fixed scroll-y-auto max-h-[90vh] overflow-y-auto ">
                <button onClick={()=> setSelectedProject(null)} className="absolute top-2 right-5 bg-yellow-950 hover:bg-yellow-900 px-4 py-2 text-white cursor-pointer">
                  x
                </button>
                <div>

                <h2 className="mt-4 text-center text-xl font-bold">
                  {selectedProject.name}
                </h2>
                <img className="p-3" src={selectedProject.link} alt="" />
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold py-1">Links</h3>
                  <Link className=" pt-1 flex items-center gap-2" href="/"> <Globe size={15}/>{selectedProject.websiteLink}</Link>
                  <Link className=" pt-1 flex items-center gap-2" href="/"><Github size={15}/> {selectedProject.githubLink}</Link>

                  <h3 className="pt-2 pb-1 text-xl font-bold">Tech Stack</h3>
                <span>
                   {selectedProject.techStack}
                </span>

                <h3 className="pt-2 pb-1 text-xl font-bold">Core Features</h3>
                <span>
                 {selectedProject.coreFeatures}
    
                </span>
                 <h3 className="pt-2 pb-1 text-xl font-bold">Description</h3>
                <span>
                 {selectedProject.description} 
                </span>
                </div>
                </div>
              </div>
            </div>
          )
        }

      </div>

      <div id="contact-section" className="bg-gray-100 py-10 scroll-mt-20 ">
        <div className="flex justify-center">
          <h2 className="flex gap-2 text-3xl font-bold items-center font-serif text-yellow-950"><Contact />Get in Touch</h2>
        </div>

        <div className="md:grid md:grid-cols-2 gap-10 px-10 pb-5 pt-5 md:px-25 md:py-5">

          <div className="flex flex-col gap-5 md:gap-10">
            <span className="text-xl text-yellow-950 font-serif font-semibold">I'd like to hear from you!</span>
            <span className="max-w-2xs">If you have any inquiries or just want to say hi, please use this form!</span>
            <span className="underline flex gap-2 pb-10 md:pb-0 md:pt-18"><MailOpen /> talhashabbir0077@gmail.com</span>
          </div>

          <div className="grid gap-5" >

            <div className="flex md:flex-row flex-col gap-5 md:gap-10 ">
              <div className="flex-col flex gap-1  w-full">
                <label className="block" htmlFor="">First Name</label>
                <input type="text" className="border w-full h-8 p-2" />
              </div>

              <div className="flex-col flex gap-1 w-full">
                <label className="block" htmlFor="">Last Name</label>
                <input type="text" className="border w-full h-8 p-2" />
              </div>
            </div>

            <div className="flex-col flex gap-1">

              <label htmlFor="">Email</label>
              <input type="text" className="border w-full h-8 p-2" />
            </div>
            <div className="flex-col flex gap-1">
              <label htmlFor="">Message</label>
              <textarea className="border w-full h-15 resize-none p-2" />
            </div>
            <button className="px-4 py-2 bg-yellow-950 text-white font-bold">SEND</button>
          </div>

        </div>
      </div>
      <div>


      </div>
      <Footer />
    </div>

  )
}