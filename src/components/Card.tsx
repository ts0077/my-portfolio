type CardServiceProps = {
    icon: string
    title: string
    description: string
}

type CardHomeProjects = {
    name?: string
    link?: string
    onViewDetails?: () => void 
}

export default function CardServices({icon,title,description}:CardServiceProps) {
    return (
        <>
            <div className="py-10 px-5 flex flex-col justify-center gap-4 items-center bg-white rounded-xl
            hover:scale-103 transition duration-300 hover:bg-[#decab969] shadow-2xl ">
                <span className="bg-gray-200 rounded-full p-3 text-xl">{icon}</span>
                <h5 className="font-bold">{title}</h5>
            <span className="text-sm text-center">{description}</span>
            </div>
        </>
    )
}

export function CardHomeProjects ({name = "Project Name",link = "pjtestdesign.png",onViewDetails}:CardHomeProjects){
    return (
         <div className="bg-yellow-950 flex flex-col w-70 rounded-2xl hover:scale-105 transition-all duration-300 ease-in-out animation-pulse">
            <img className="max-w-70 border object-fill" src={link} alt="" />
            <div className="flex justify-between ">
        <h2 className="p-3 text-center text-white text-md">{name}</h2>
        <button
        onClick={onViewDetails}
        className="bg-white px-4 font-bold cursor-pointer outline rounded-l-xl text-s  outline-yellow-950 ">View Details</button>
            </div>
         </div>
        
    )
}