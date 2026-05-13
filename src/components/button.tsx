type buttonProps = {
name:string
status:  "Primary" | "Secondary" | "Danger"
variants: "lg" | "md" | "sm"
}

export default function Button({name,status,variants}: buttonProps){
    return (
        
<button className={`${variants}`}>{name}</button>
        
    )
}