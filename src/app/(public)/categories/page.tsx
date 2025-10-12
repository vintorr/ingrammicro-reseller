'use client';

import { useState } from 'react';
import { Package, Server, Laptop, Smartphone, Headphones, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'computers',
      name: 'Computers & Laptops',
      icon: <Laptop className="w-12 h-12 text-blue-600" />,
      description: 'High-performance computers and laptops for business and personal use',
      productCount: 1250,
      image: '/api/placeholder/400/300'
    },
    {
      id: 'servers',
      name: 'Servers & Storage',
      icon: <Server className="w-12 h-12 text-green-600" />,
      description: 'Enterprise servers, storage solutions, and networking equipment',
      productCount: 850,
      image: '/api/placeholder/400/300'
    },
    {
      id: 'mobile',
      name: 'Mobile Devices',
      icon: <Smartphone className="w-12 h-12 text-purple-600" />,
      description: 'Smartphones, tablets, and mobile accessories',
      productCount: 650,
      image: '/api/placeholder/400/300'
    },
    {
      id: 'audio',
      name: 'Audio & Video',
      icon: <Headphones className="w-12 h-12 text-orange-600" />,
      description: 'Professional audio equipment, headphones, and video solutions',
      productCount: 420,
      image: '/api/placeholder/400/300'
    },
    {
      id: 'cameras',
      name: 'Cameras & Photography',
      icon: <Camera className="w-12 h-12 text-red-600" />,
      description: 'Digital cameras, lenses, and photography equipment',
      productCount: 380,
      image: '/api/placeholder/400/300'
    },
    {
      id: 'accessories',
      name: 'Accessories',
      icon: <Package className="w-12 h-12 text-gray-600" />,
      description: 'Cables, adapters, cases, and other essential accessories',
      productCount: 1200,
      image: '/api/placeholder/400/300'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Product Categories
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Explore our comprehensive range of technology products organized by category. 
          Find exactly what you need for your business or personal use.
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer ${
              selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedCategory(
              selectedCategory === category.id ? null : category.id
            )}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  {category.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.productCount} products
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                {category.description}
              </p>
              
              <div className="flex justify-between items-center">
                <Link href={`/products?category=${category.id}`}>
                  <Button variant="primary" size="sm">
                    View Products
                  </Button>
                </Link>
                <span className="text-sm text-gray-500">
                  {category.productCount} items
                </span>
              </div>
            </div>
            
            {/* Category Image Placeholder */}
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Category Image</span>
            </div>
          </div>
        ))}
      </div>

      {/* Featured Categories */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Popular Categories
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Laptop className="w-8 h-8 mr-3" />
              <h3 className="text-xl font-semibold">Business Laptops</h3>
            </div>
            <p className="text-blue-100 mb-6">
              Professional laptops designed for productivity and performance. 
              Perfect for business users who need reliability and power.
            </p>
            <Link href="/products?category=computers&type=business">
              <Button variant="secondary" size="sm">
                Shop Business Laptops
              </Button>
            </Link>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-8">
            <div className="flex items-center mb-4">
              <Server className="w-8 h-8 mr-3" />
              <h3 className="text-xl font-semibold">Enterprise Solutions</h3>
            </div>
            <p className="text-green-100 mb-6">
              Scalable server and storage solutions for growing businesses. 
              Built for performance, reliability, and future growth.
            </p>
            <Link href="/products?category=servers">
              <Button variant="secondary" size="sm">
                Explore Enterprise
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Can&apos;t Find What You&apos;re Looking For?
        </h2>
        <p className="text-gray-600 mb-6">
          Our team of experts can help you find the perfect solution for your needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg">
              Contact Our Experts
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="secondary">
              Browse All Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
