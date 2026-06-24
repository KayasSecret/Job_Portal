import React from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

import { Button } from "./ui/button";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const category = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Graphic Designer",
  "Product Manager",
  "UX/UI Designer",
  "Java Developer",
  "Python Developer",
  "React Developer",
  "Node Developer",
  "DevOps Engineer",
  "QA Engineer",
  "AI Engineer",
  "Cloud Engineer",
];

const CategoryCarausel = () => {

  const dispatch = useDispatch()  
  const navigate = useNavigate()

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query))
    navigate("/browse")
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-4xl mx-auto my-20"
    >
      <CarouselContent className="-ml-2">
        {category.map((cat, index) => (
          <CarouselItem
            key={index}
            className="pl-2 basis-1/2 md:basis-1/3 lg:basis-1/4"
          >
            <Button
              onClick={() => searchJobHandler(cat)}
              variant="outline"
              className="rounded-full whitespace-nowrap"
            >
              {cat}
            </Button>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default CategoryCarausel;