import { testimonials } from "@/Constants/dummy";
import Title from "../UI/Title";
import { useState, useEffect, useCallback } from "react";
import { Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Testimonials = () => {
  const [activeTestimonialId, setActiveTestimonialId] = useState(1);

  const activeTestimonial = testimonials.find(
    (testimonial) => testimonial.id === activeTestimonialId
  );

  const autoSlide = useCallback(() => {
    setActiveTestimonialId((prev) => (prev === testimonials.length ? 1 : prev + 1));
  }, []);

  useEffect(() => {
    const interval = setInterval(autoSlide, 5000);
    return () => clearInterval(interval);
  }, [autoSlide]);

  const handlePrev = () => {
    setActiveTestimonialId((prev) => (prev === 1 ? testimonials.length : prev - 1));
  };

  const handleNext = () => {
    setActiveTestimonialId((prev) => (prev === testimonials.length ? 1 : prev + 1));
  };

  return (
    <div>
      <Title title="What our clients say about us." description="We have been provding the best online features for self service and also Quick Response Team for Customers who may need help in handling any financial issue in their transaction." />
      <div className="layout mt-10 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTestimonialId} // Forces animation re-trigger
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-white p-5 rounded-lg shadow-md space-y-4"
          >
            <Quote size={40} className="text-primary flex-shrink-0 absolute top-4 right-4" />
            <div className="flex items-center gap-4">
              <div className="h-[100px] w-[100px] rounded-full overflow-hidden">
                <img
                  src={activeTestimonial?.image}
                  alt={activeTestimonial?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{activeTestimonial?.name}</h3>
                <p className="text-sm text-gray-500">{activeTestimonial?.location}</p>
              </div>
            </div>
            <p className="text-lg">{activeTestimonial?.feedback}</p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-4 mt-7">
          <button
            onClick={handlePrev}
            className="bg-primary text-white h-12 w-12 rounded-full flex items-center justify-center"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={handleNext}
            className="bg-primary text-white h-12 w-12 rounded-full flex items-center justify-center"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
