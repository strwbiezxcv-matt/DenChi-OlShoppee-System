/* =========================================================
   DENCHI OLSHOPPE — Content source
   All copy, products, prices and contact details come from
   the existing Denchi Olshoppe site. Nothing invented.
   ========================================================= */
window.DENCHI = (function () {
  'use strict';

  const site = {
    name: 'DENCHI',
    tagline: 'Fashion, lifestyle, and indulgence brought together.',
    blurb:
      'A professionally designed online business platform that showcases and promotes a curated selection of stylish clothing, handcrafted artisan foods, and contemporary bags, delivering a seamless and engaging shopping experience for modern consumers.'
  };

  const nav = [
    { label: 'Home', route: '#/home' },
    { label: 'Shop', route: '#/shop' },
    { label: 'Benefits', route: '#/benefits' }
  ];

  /* --- Categories --- */
  const categories = [
    {
      id: 'clothes',
      name: 'Premium Clothes',
      tag: 'Premium Clothes',
      short: 'Elevate your wardrobe effortlessly.',
      long:
        'Step into style with our Premium Clothes collection! Designed for those who seek quality and elegance, these garments are crafted from the finest materials to deliver comfort and durability. Whether you’re dressing up for a special occasion or looking for everyday wear, our selection will elevate your wardrobe effortlessly. Discover the difference today!'
    },
    {
      id: 'bags',
      name: 'Modern Bags',
      tag: 'High Quality Bags',
      short: 'Crafted for style and functionality.',
      long:
        'Discover our stunning collection of Bags, crafted with quality materials and designed for both style and functionality. Whether you’re looking for a chic handbag or a versatile tote, our selection has something to elevate every outfit. Take a closer look at our range and find the perfect bag to complement your lifestyle today!'
    },
    {
      id: 'foods',
      name: 'Artisan Foods',
      tag: 'Artisan Foods',
      short: 'A delightful treat, layered to perfection.',
      long:
        'Our Artisan Foods Tiramisu is a perfect blend of flavors, featuring creamy mascarpone and lightly soaked graham layered to perfection. Finished with a dusting of cocoa, this dessert encapsulates the essence of traditional Italian cuisine. Treat yourself and your loved ones to a slice of our tiramisu, and elevate your dining experience with this delightful indulgence.'
    }
  ];

  const benefits = [
    {
      title: 'Premium Clothes',
      text: 'Garments crafted from the finest materials for comfort, durability and effortless everyday elegance.',
      category: 'clothes'
    },
    {
      title: 'Modern Bags',
      text: 'Quality materials and considered design — chic handbags and versatile totes that elevate every outfit.',
      category: 'bags'
    },
    {
      title: 'Artisan Foods',
      text: 'Creamy mascarpone and lightly soaked graham, layered to perfection and finished with a dusting of cocoa.',
      category: 'foods'
    }
  ];

  const about = [
    'At Denchi Olshoppe, we’re more than just a store; we’re a lifestyle destination. Our unique blend of stylish bags and trendy clothing offers something for every fashion enthusiast, while our delectable tiramisu adds a delightful treat to your shopping experience.',
    'We aim to make every visit enjoyable and inspiring, allowing you to express your personality through what you wear and taste. Join us in exploring the fusion of fashion and flavor at Denchi Olshoppe.'
  ];

  /* --- Products (exactly as listed on the store) --- */
  const products = [
    {
      id: 'p1',
      name: 'Two-Tone High Waist Denim Shorts with Double Button',
      price: 170.1,
      compareAt: 189,
      badge: 'Hot',
      category: 'clothes',
      tone: 'indigo',
      isNew: true
    },
    {
      id: 'p2',
      name: 'Light Wash Denim Cuffed Shorts',
      price: 151.2,
      compareAt: 189,
      badge: '',
      category: 'clothes',
      tone: 'denim',
      isNew: true
    },
    {
      id: 'p3',
      name: 'Grey Wash Denim Cuffed Shorts',
      price: 189,
      compareAt: null,
      badge: '',
      category: 'clothes',
      tone: 'stone',
      isNew: true
    },
    {
      id: 'p4',
      name: 'Classic Washed Denim Cuffed Shorts',
      price: 239,
      compareAt: null,
      badge: '',
      category: 'clothes',
      tone: 'indigo',
      isNew: true
    },
    {
      id: 'p5',
      name: 'Asymmetrical Button-Front Denim Skirt with Pleated Hem',
      price: 239,
      compareAt: null,
      badge: '',
      category: 'clothes',
      tone: 'denim',
      isNew: true
    },
    {
      id: 'p6',
      name: 'Classic Brown Straight Mini Skirt',
      price: 189,
      compareAt: null,
      badge: '',
      category: 'clothes',
      tone: 'cocoa',
      isNew: true
    }
  ];

  const editorial = {
    heading: 'Elevate Your Style and Indulge Your Taste',
    items: [
      { tag: 'High Quality Bags', category: 'bags' },
      { tag: 'Premium Clothes', category: 'clothes' },
      { tag: 'Artisan Foods', category: 'foods' }
    ]
  };

  const tiramisu = {
    kicker: 'Artisan Food',
    heading: 'Best Tiramisu In Town',
    text: 'Indulge in rich, creamy tiramisu—every bite is pure bliss.',
    long:
      'A perfect blend of flavors, featuring creamy mascarpone and lightly soaked graham layered to perfection. Finished with a dusting of cocoa, this dessert encapsulates the essence of traditional Italian cuisine. Treat yourself and your loved ones to a slice of our tiramisu, and elevate your dining experience with this delightful indulgence.'
  };

  const newest = {
    heading: 'Explore the Newest Product on our store',
    productId: 'p1'
  };

  const contact = {
    title: 'Contact Our Customer Care',
    email: 'denchi.olshoppe@gmail.com',
    phone: '0969 - 275 - 9695',
    phoneHref: '+639692759695',
    addressLines: [
      '0590 Palayan Street',
      'Cut - cot, Pulilan, Bulacan',
      'Philippines 3005'
    ]
  };

  const newsletter = {
    heading: 'Subscribe to our newsletter',
    text: 'Be the first to hear about new drops, restocks and the latest from Denchi Olshoppe.'
  };

  /* --- FAQ: answers drawn from existing site copy --- */
  const faq = [
    {
      q: 'What does Denchi Olshoppe sell?',
      a: 'A curated selection of stylish clothing, handcrafted artisan foods and contemporary bags — presented as a lifestyle destination rather than just a store.'
    },
    {
      q: 'Why should I choose Denchi Olshoppe?',
      a: 'Premium Clothes, Modern Bags and Artisan Foods in one place, so you can express your personality through what you wear and taste.'
    },
    {
      q: 'What is the tiramisu like?',
      a: 'A perfect blend of flavors — creamy mascarpone and lightly soaked graham layered to perfection, finished with a dusting of cocoa.'
    },
    {
      q: 'How do I reach Customer Care?',
      a: 'Email denchi.olshoppe@gmail.com or call 0969 - 275 - 9695, or visit us at 0590 Palayan Street, Cut - cot, Pulilan, Bulacan, Philippines 3005.'
    }
  ];

  /* Policies without published copy are rendered as honest
     placeholders pointing to Customer Care — no invented terms. */
  const policies = [
    { id: 'faq', title: 'FAQ', ready: true },
    { id: 'privacy', title: 'Privacy Policy', ready: false },
    { id: 'shipping', title: 'Shipping Policy', ready: false },
    { id: 'refund', title: 'Refund Policy', ready: false },
    { id: 'terms', title: 'Terms & Conditions', ready: false },
    { id: 'accessibility', title: 'Accessibility Statement', ready: false }
  ];

  return {
    site, nav, categories, benefits, about, products,
    editorial, tiramisu, newest, contact, newsletter, faq, policies
  };
})();

