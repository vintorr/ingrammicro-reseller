'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Truck, Shield, Headphones } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCart } from '@/lib/hooks/useCart';

export const HomePageClient = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { products, loading, searchProducts } = useProducts();
  const { addToCart } = useCart();

  const carouselSlides = [
    {
      id: 1,
      title: "Latest Technology Solutions",
      subtitle: "Discover cutting-edge products for your business",
      image: "/api/placeholder/800/400",
      cta: "Shop Now",
      link: "/products"
    },
    {
      id: 2,
      title: "Enterprise Solutions",
      subtitle: "Scalable technology for growing businesses",
      image: "/api/placeholder/800/400",
      cta: "Learn More",
      link: "/categories"
    },
    {
      id: 3,
      title: "Expert Support",
      subtitle: "24/7 technical support from our experts",
      image: "/api/placeholder/800/400",
      cta: "Get Support",
      link: "/contact"
    }
  ];

  const features = [
    {
      icon: <Truck className="w-8 h-8 text-blue-600" />,
      title: "Fast Shipping",
      description: "Free shipping on orders over $500"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Secure Payment",
      description: "Your payment information is safe with us"
    },
    {
      icon: <Headphones className="w-8 h-8 text-purple-600" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support"
    }
  ];

  const testimonials = [
    {
      name: "John Smith",
      company: "TechCorp Inc.",
      rating: 5,
      comment: "Excellent service and fast delivery. Highly recommended!"
    },
    {
      name: "Sarah Johnson",
      company: "Innovate Solutions",
      rating: 5,
      comment: "Great products and outstanding customer support."
    },
    {
      name: "Mike Davis",
      company: "Digital Dynamics",
      rating: 5,
      comment: "Reliable partner for all our technology needs."
    }
  ];

  useEffect(() => {
    searchProducts({ pageNumber: 1, pageSize: 8 });
  }, [searchProducts]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleAddToCart = (product: any) => {
    const cartItem = {
      product,
      quantity: 1,
      unitPrice: product.price || 0,
      totalPrice: product.price || 0,
    };
    addToCart(cartItem);
  };

  return (
    <div className="space-y-16">
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="relative overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carouselSlides.map((slide) => (
                <div key={slide.id} className="w-full flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-8">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl mb-8 text-blue-100">
                        {slide.subtitle}
                      </p>
                      <Link href={slide.link}>
                        <Button size="lg" variant="secondary">
                          {slide.cta}
                        </Button>
                      </Link>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-lg h-80 flex items-center justify-center">
                        <span className="text-gray-500">Hero Image</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose TechStore?
            </h2>
            <p className="text-lg text-gray-600">
              We provide exceptional service and quality products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Discover our most popular technology solutions
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.ingramPartNumber}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onViewDetails={() => {}}
                  priceAvailabilityData={null}
                  priceLoading={false}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link href="/products">
              <Button size="lg">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by businesses worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers and transform your business today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                Browse Products
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="secondary"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
