import React from "react";

export const WHATSAPP_PHONE_NUMBER = "919685413010";
export const WHATSAPP_DEFAULT_MESSAGE = "Hello! I would like to know more about your courses and services.";

export function FloatingWhatsApp() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(WHATSAPP_DEFAULT_MESSAGE)}`;

  return (
    <div className="whatsapp-fab group fixed bottom-4 right-4 z-[60] sm:bottom-5 sm:right-5 lg:bottom-6 lg:right-6">
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-1/2 mr-[4.5rem] hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-[#111315] px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 md:block"
      >
        Chat with us on WhatsApp
      </span>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="whatsapp-fab-link grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.38)] transition duration-200 hover:scale-110 hover:shadow-[0_10px_30px_rgba(37,211,102,0.58)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40 focus-visible:ring-offset-2 sm:h-16 sm:w-16"
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 fill-current sm:h-9 sm:w-9">
          <path d="M16.04 3A12.87 12.87 0 0 0 5.09 22.64L3 29l6.57-2.05A12.96 12.96 0 1 0 16.04 3Zm0 23.71a10.7 10.7 0 0 1-5.45-1.49l-.39-.23-3.9 1.22 1.27-3.78-.25-.39a10.72 10.72 0 1 1 8.72 4.67Zm5.88-8.03c-.32-.16-1.9-.94-2.2-1.05-.29-.11-.5-.16-.71.16-.21.32-.82 1.05-1 1.27-.19.21-.37.24-.69.08-.32-.16-1.36-.5-2.59-1.6a9.7 9.7 0 0 1-1.79-2.23c-.19-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.36-.26-.62-.52-.54-.71-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.64s1.14 3.07 1.3 3.28c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.9-.78 2.17-1.53.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z" />
        </svg>
      </a>
    </div>
  );
}
