// src/Slider.js
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const SliderPage = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const slides = [
    { id: 1, title: 'Slide 1', description: 'This is the first slide' },
    { id: 2, title: 'Slide 2', description: 'This is the second slide' },
    { id: 3, title: 'Slide 3', description: 'This is the third slide' },
  ];

  return (
    <div>
      <h1>Slider</h1>
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id}>
            <h2>{slide.title}</h2>
            <p>{slide.description}</p>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SliderPage;
