'use client';

import { Users, Target, Award, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { label: 'Years of Experience', value: '25+', icon: <Award className="w-8 h-8 text-blue-600" /> },
    { label: 'Happy Customers', value: '10,000+', icon: <Users className="w-8 h-8 text-green-600" /> },
    { label: 'Products Available', value: '50,000+', icon: <Target className="w-8 h-8 text-purple-600" /> },
    { label: 'Countries Served', value: '50+', icon: <Globe className="w-8 h-8 text-orange-600" /> }
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We stay at the forefront of technology, constantly evolving to bring you the latest and greatest solutions.',
      icon: '🚀'
    },
    {
      title: 'Reliability',
      description: 'Our customers trust us because we deliver consistent, high-quality products and services every time.',
      icon: '🛡️'
    },
    {
      title: 'Partnership',
      description: 'We believe in building long-term relationships with our customers, growing together towards success.',
      icon: '🤝'
    },
    {
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from product selection to customer service.',
      icon: '⭐'
    }
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      image: '/api/placeholder/200/200',
      bio: 'With over 20 years in the technology industry, John leads our vision for innovation and growth.'
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      image: '/api/placeholder/200/200',
      bio: 'Sarah oversees our technical operations and ensures we stay ahead of the technology curve.'
    },
    {
      name: 'Mike Davis',
      role: 'Head of Sales',
      image: '/api/placeholder/200/200',
      bio: 'Mike leads our sales team and works closely with customers to find the perfect solutions.'
    },
    {
      name: 'Lisa Chen',
      role: 'Customer Success Manager',
      image: '/api/placeholder/200/200',
      bio: 'Lisa ensures our customers have the best experience possible with our products and services.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          About Techcareplus
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Techcareplus is a Canadian technology reseller dedicated to helping partners deliver the right gear, on time, with the wraparound services their customers expect.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {stats.map((stat, index) => (
          <div key={index} className="text-center bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center mb-4">
              {stat.icon}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {stat.value}
            </div>
            <div className="text-gray-600">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Our Story */}
      <div className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Techcareplus launched more than two decades ago as a boutique reseller focused on pairing the right technology with dedicated lifecycle support. From our first warehouse in Ontario to our current national footprint, we&apos;ve stayed rooted in one mission: empower partners to delight their end customers.
              </p>
              <p>
                Along the way we&apos;ve built deep relationships with Ingram Micro and leading manufacturers, giving our partners priority access to inventory, programs, and expertise. Whether it&apos;s a single device drop-ship or a multi-site deployment, our team navigates the supply chain so you can stay focused on the customer experience.
              </p>
              <p>
                Today, Techcareplus supports resellers, MSPs, and procurement teams across Canada with curated catalogs, logistics, and attach services. We continue to invest in people, platforms, and partnerships that make the reseller journey simpler, faster, and more profitable.
              </p>
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <span className="text-gray-500">Company Image</span>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Our Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Our Team */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Meet Our Team
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member, index) => (
            <div key={index} className="text-center bg-white p-6 rounded-lg shadow-md">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500">Photo</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 text-sm">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="bg-blue-50 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Our Mission
          </h3>
          <p className="text-gray-700">
            To empower businesses with innovative technology solutions that drive growth, 
            efficiency, and success. We are committed to providing exceptional products 
            and services that help our customers achieve their goals.
          </p>
        </div>
        
        <div className="bg-green-50 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Our Vision
          </h3>
          <p className="text-gray-700">
            To be the world&apos;s most trusted technology partner, known for our innovation, 
            reliability, and commitment to customer success. We envision a future where 
            technology seamlessly enables business growth and human potential.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Work With Us?
        </h2>
        <p className="text-gray-600 mb-6">
          Let&apos;s discuss how we can help your business succeed with the right technology solutions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/contact">
            <Button size="lg">
              Get in Touch
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="secondary">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
