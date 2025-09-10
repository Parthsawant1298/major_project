import Navbaritem from '@/components/Host/Navbar';
import Aboutus from '@/components/About';
import Footeritem from '@/components/Footer';

import Heroitem from '@/components/Hero';
import LowerFooter from '@/components/Lowerfooter';
import Pricingitem from '@/components/Pricing';
import RevenueBreakdown from '@/components/Revenue';
import Servicesitem from '@/components/Services';
import Testimonialsitem from '@/components/Testimonials';
import Whychooseus from '@/components/Why';
export default function DashboardPage() {
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