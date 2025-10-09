import duckMascot from "@/assets/duck-mascot.png";

const Footer = () => {
  return (
    <footer className="py-12 px-4 border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-3">
            <img 
              src={duckMascot} 
              alt="Traffic Duck" 
              className="w-8 h-8"
            />
            <span className="font-heading font-semibold text-lg">
              Traffic Duck
            </span>
          </div>
          
          <p className="text-muted-foreground text-sm">
            Coming Soon
          </p>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a 
              href="https://x.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              X
            </a>
            <a 
              href="https://producthunt.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Product Hunt
            </a>
            <a 
              href="#" 
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
