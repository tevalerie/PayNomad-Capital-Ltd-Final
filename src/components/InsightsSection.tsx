import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import BlogCard from "./BlogCard";
import ArticleModal from "./ArticleModal";
import { articles } from "../data/articles";

interface InsightsSectionProps {
  title?: string;
  subtitle?: string;
  insights?: Array<{
    title: string;
    summary: string;
    content: string;
    date: string;
    readTime: string;
    imageUrl: string;
  }>;
}

const InsightsSection = ({
  title = "Financial Insights",
  subtitle = "Stay informed with our latest financial analysis and market trends",
  insights = articles,
}: InsightsSectionProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<
    (typeof insights)[0] | null
  >(null);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(insights.length / cardsPerPage);

  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentInsights = insights.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage,
  );

  const handleReadArticle = (article: (typeof insights)[0]) => {
    setSelectedArticle(article);
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
  };

  return (
    <section
      id="insights"
      className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-[#2c3e50] to-[#0077be]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-200 max-w-2xl mx-auto"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {currentInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className="flex justify-center"
              >
                <BlogCard
                  title={insight.title}
                  summary={insight.summary}
                  content={insight.content}
                  date={insight.date}
                  readTime={insight.readTime}
                  imageUrl={insight.imageUrl}
                  onReadMore={() => handleReadArticle(insight)}
                />
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-12 space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={prevPage}
                className="rounded-full h-10 w-10 border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${i === currentPage ? "bg-[#0077be]" : "bg-gray-300"}`}
                    aria-label={`Go to page ${i + 1}`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={nextPage}
                className="rounded-full h-10 w-10 border-[#0077be] text-[#0077be] hover:bg-[#0077be] hover:text-white transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedArticle && (
        <ArticleModal
          isOpen={!!selectedArticle}
          onClose={handleCloseModal}
          article={selectedArticle}
        />
      )}
    </section>
  );
};

export default InsightsSection;
