import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BlogCardProps {
  title?: string;
  summary?: string;
  content?: string;
  date?: string;
  readTime?: string;
  imageUrl?: string;
  onReadMore?: () => void;
}

const BlogCard = ({
  title = "Understanding Cryptocurrency Markets",
  summary = "A brief overview of current cryptocurrency trends and investment strategies.",
  content = "Cryptocurrency markets continue to evolve rapidly, presenting both opportunities and challenges for investors. This article explores key trends, risk management strategies, and potential future developments in the crypto space. Understanding market cycles, regulatory impacts, and technological advancements is crucial for making informed investment decisions in this dynamic sector.",
  date = "June 15, 2023",
  readTime = "5 min read",
  imageUrl = "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&q=80",
  onReadMore,
}: BlogCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="w-full max-w-[380px] overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-[180px] w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span className="mr-3">{date}</span>
          <Clock className="h-4 w-4 mr-1" />
          <span>{readTime}</span>
        </div>
        <CardTitle className="text-xl font-semibold text-[#2c3e50]">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <CardDescription className="text-gray-600">{summary}</CardDescription>
      </CardContent>

      <CardFooter className="pt-0 flex space-x-4">
        <Button
          variant="ghost"
          className="text-[#0077be] hover:text-[#2c3e50] p-0 flex items-center"
          onClick={onReadMore}
        >
          <span>Read Article</span>
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
