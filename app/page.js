import React from 'react';
import Navbaritem from '@/components/Navbar';
import Heroitem from '@/components/Hero';
import RevenueBreakdown from '@/components/Revenue';
import Aboutus from '@/components/About';
import Whychooseus from '@/components/Why';
import Footeritem from '@/components/Footer';
import Servicesitem from '@/components/Services';
import Testimonialsitem from '@/components/Testimonials';
import Pricingitem from '@/components/Pricing';
import LowerFooter from '@/components/Lowerfooter';
export default function Page() {
  return (
    <main>
      <Navbaritem />
      <Heroitem />
      <Aboutus />
      <Servicesitem />
      <Whychooseus />
      <RevenueBreakdown />
      <Pricingitem />
      <Testimonialsitem/>
      <LowerFooter />
      <Footeritem />
      
   
    </main>
  );
}