import React from 'react';
import { Layout } from './Layout';

const AboutPage = () => {
  return (
    <Layout>
      <div className="bg-stone-50 py-20 px-4">
        <div className="container mx-auto max-w-4xl bg-white p-10 rounded-2xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-pal-green/5 rounded-full blur-3xl" />
          <h1 className="text-4xl font-bold mb-6 text-stone-800">About A'ruq</h1>
          <p className="text-xl text-stone-600 leading-relaxed mb-6">
            A'ruq (عروق), meaning "Roots" or "Veins" in Arabic, is a digital heritage platform dedicated to preserving the rich tapestry of Palestinian culture.
          </p>
          <p className="text-lg text-stone-600 leading-relaxed mb-6">
            Our mission is to safeguard literature, poetry, music, and folk performances from loss and erasure. By digitizing these artifacts, we ensure that the voices of the past continue to speak to future generations.
          </p>
          <div className="bg-stone-100 p-6 rounded-lg border-l-4 border-pal-red">
            <h3 className="font-bold text-lg mb-2 text-[#000000]">Our Vision</h3>
            <p className="text-stone-700 italic">"Where Roots Speak"</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;
