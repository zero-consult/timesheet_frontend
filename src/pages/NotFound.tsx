function NotFound() {
    return <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center select-none">
        <div className="relative mb-8">
            <p
                className="text-[140px] font-bold leading-none tracking-tighter text-foreground/5 pointer-events-none"
                style={{fontFamily: "'Instrument Sans', sans-serif"}}>404
            </p>
        </div>
    </div>
}

export default NotFound;