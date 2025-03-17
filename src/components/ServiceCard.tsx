import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  ctaText?: string;
  onClick?: () => void;
  className?: string;
}

const ServiceCard = ({
  title = "Cryptocurrency",
  description = "Secure cryptocurrency trading and management solutions for individuals and businesses.",
  icon,
  ctaText = "Learn More",
  onClick = () => {},
  className = "",
}: ServiceCardProps) => {
  return (
    <Card
      className={`w-full max-w-[320px] h-[400px] bg-gradient-to-br from-[#0077be] to-[#2c3e50] text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col rounded-xl overflow-hidden ${className}`}
    >
      <CardHeader className="pb-2">
        {icon && <div className="text-[#faf4eb] mb-4 text-3xl">{icon}</div>}
        <CardTitle className="text-xl font-semibold text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-gray-300">
          {description}
        </CardDescription>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant="ghost"
          className="p-0 text-white hover:text-gray-300 hover:bg-transparent group flex items-center gap-1"
          onClick={onClick}
        >
          {ctaText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ServiceCard;
