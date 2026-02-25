"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  type: "sweets" | "catering";
  eventDetail?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  { id: "t1", name: "Priya Sharma", location: "Mumbai", rating: 5, text: "The Kaju Katli was absolutely divine — it melted in my mouth! I ordered 5 kg for Diwali gifting and every single person called to ask where I got it from. OmarHam is now my go-to for every festive season.", type: "sweets" },
  { id: "t2", name: "Rajesh & Anita Gupta", location: "Delhi", rating: 5, text: "We hired OmarHam for our daughter's wedding reception (400 guests, 2 days). The food was spectacular — guests are still talking about the live chaat counter and the Moong Dal Halwa. Flawless service from start to finish.", type: "catering", eventDetail: "Wedding Reception · 400 guests" },
  { id: "t3", name: "Fatima Khan", location: "Hyderabad", rating: 5, text: "I've been ordering their Motichoor Ladoo for every celebration for the past two years. Consistent quality every single time. The 1 kg box is the perfect size for our family gatherings.", type: "sweets" },
  { id: "t4", name: "Arjun Mehta", location: "Bangalore", rating: 5, text: "Used their catering for our company's annual offsite — 150 people, 3 days. The quote builder made planning so easy. The team was punctual, the food was outstanding, and they handled all the special dietary requirements without any fuss.", type: "catering", eventDetail: "Corporate Offsite · 150 guests" },
  { id: "t5", name: "Sneha Patel", location: "Ahmedabad", rating: 4, text: "Ordered the Royal Assorted Box as a gift for my in-laws. The packaging was beautiful and the sweets were incredibly fresh. The Pista Barfi was the star. Only wish they had a sugar-free option too!", type: "sweets" },
  { id: "t6", name: "Mohammed Aziz", location: "Lucknow", rating: 5, text: "They catered our Eid celebration at home — 80 guests, a single day. The biryani was restaurant-quality, the jalebis were hot and crispy, and the staff was courteous and professional. Worth every rupee.", type: "catering", eventDetail: "Eid Celebration · 80 guests" },
  { id: "t7", name: "Kavitha Rajan", location: "Chennai", rating: 5, text: "I'm very particular about ingredients because of allergies in my family. OmarHam clearly lists all ingredients and allergens on their website, which gave me so much confidence. The Coconut Ladoo is safe for my son and he loves it!", type: "sweets" },
  { id: "t8", name: "Vikram Singh", location: "Jaipur", rating: 5, text: "Booked them for my parents' 50th anniversary — 200 guests, premium setup with bone china crockery. The Royal Counter looked absolutely stunning. The on-site chef managed everything perfectly. My parents were overjoyed.", type: "catering", eventDetail: "Anniversary Party · 200 guests" },
  { id: "t9", name: "Deepa Nair", location: "Kochi", rating: 4, text: "Their Chocolate Modak is a game-changer! My kids prefer it over regular chocolate. I order a big batch every Ganesh Chaturthi. Delivery was smooth and the sweets arrived perfectly intact.", type: "sweets" },
  { id: "t10", name: "Amit Joshi", location: "Pune", rating: 5, text: "We've used OmarHam for 3 corporate events now. The quote process is transparent, no hidden costs. The live pasta station at our last event was a huge hit. Highly recommend for any scale of event.", type: "catering", eventDetail: "Corporate Events · Multiple" },
  { id: "t11", name: "Sunita Agarwal", location: "Kolkata", rating: 5, text: "As a Bengali, I'm very picky about my Rasgulla and Sandesh. OmarHam's Bengali sweets genuinely surprised me — soft, perfectly sweetened, and fresh. Reminded me of the sweet shops in North Kolkata.", type: "sweets" },
  { id: "t12", name: "Rohan & Meera Kapoor", location: "Chandigarh", rating: 5, text: "From sangeet to reception, OmarHam handled all 3 days of our wedding catering. Different menus each day, 300+ guests, and not a single complaint. The late-night Maggi station was the highlight everyone remembers!", type: "catering", eventDetail: "3-Day Wedding · 300+ guests" },
];

interface TestimonialsState {
  testimonials: Testimonial[];
  addTestimonial: (t: Omit<Testimonial, "id">) => void;
  updateTestimonial: (id: string, updates: Partial<Omit<Testimonial, "id">>) => void;
  deleteTestimonial: (id: string) => void;
}

export const useTestimonialsStore = create<TestimonialsState>()(
  persist(
    (set) => ({
      testimonials: DEFAULT_TESTIMONIALS,

      addTestimonial: (t) =>
        set((state) => ({
          testimonials: [
            ...state.testimonials,
            { ...t, id: `t${Date.now()}` },
          ],
        })),

      updateTestimonial: (id, updates) =>
        set((state) => ({
          testimonials: state.testimonials.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTestimonial: (id) =>
        set((state) => ({
          testimonials: state.testimonials.filter((t) => t.id !== id),
        })),
    }),
    { name: "omarham-testimonials" }
  )
);
