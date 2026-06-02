import React from 'react'
import { Carousel } from '@material-tailwind/react';
import { CarouselContent } from './ui/carousel';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Graphic Designer",
    "Product Manager",
    "UX/UI Designer",
    "Mobile App Developer",
    "DevOps Engineer",
    "Cybersecurity Analyst",
]

const CategoryCarausel = () => {
  return (
    <div>
      <Carousel />
        <CarouselContent /> 
        {
            category.map((cat, index) => (
                <CarouselItem></CarouselItem>
            ))
        }
    </div>
  )
}

export default CategoryCarausel
