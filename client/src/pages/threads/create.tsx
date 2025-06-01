import React, { useState } from "react";
import { CreateThreadForm } from "@/features/forum/components/CreateThreadForm";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";

export default function CreateThreadPage() {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12 flex-grow flex flex-col items-center">
        <CreateThreadForm 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
          onSuccess={() => {
            handleCloseModal();
          }}
        />
      </main>
      <SiteFooter />
    </div>
  );
}