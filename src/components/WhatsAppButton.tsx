import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const phone = "919876543210";
  const message = encodeURIComponent("Hi! I'm interested in joining IronForge Gym. Can you share details?");
  
  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </a>
  );
}
