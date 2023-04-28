import dynamic from 'next/dynamic';

const DynamicCarousel = dynamic(() => import('./Carousel'), { ssr: false });

export default DynamicCarousel;
