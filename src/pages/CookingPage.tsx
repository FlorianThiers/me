import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Star, Clock, Users, Utensils, Flame, Leaf, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const CookingPage: React.FC = () => {
  const { t } = useTranslation();

  const cookingCategories = [
    {
      icon: <Heart className="w-12 h-12" />,
      title: t('cooking.categories.healthy.title'),
      description: t('cooking.categories.healthy.description'),
      details: t('cooking.categories.healthy.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🥗',
      color: 'from-green-400 to-emerald-600',
      recipes: [
        {
          name: t('cooking.categories.healthy.recipes.quinoaBowl.name'),
          description: t('cooking.categories.healthy.recipes.quinoaBowl.description'),
          difficulty: t('cooking.categories.healthy.recipes.quinoaBowl.difficulty'),
          time: t('cooking.categories.healthy.recipes.quinoaBowl.time'),
          rating: 5,
          tags: ['Gezond', 'Vegetarisch', 'Glutenvrij'] // Tags kunnen later ook vertaald worden
        },
        {
          name: t('cooking.categories.healthy.recipes.smoothieBowl.name'),
          description: t('cooking.categories.healthy.recipes.smoothieBowl.description'),
          difficulty: t('cooking.categories.healthy.recipes.smoothieBowl.difficulty'),
          time: t('cooking.categories.healthy.recipes.smoothieBowl.time'),
          rating: 4,
          tags: ['Ontbijt', 'Smoothie', 'Vitamines']
        }
      ]
    },
    {
      icon: <Flame className="w-12 h-12" />,
      title: t('cooking.categories.experimental.title'),
      description: t('cooking.categories.experimental.description'),
      details: t('cooking.categories.experimental.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🔥',
      color: 'from-red-400 to-orange-600',
      recipes: [
        {
          name: t('cooking.categories.experimental.recipes.misoCaramel.name'),
          description: t('cooking.categories.experimental.recipes.misoCaramel.description'),
          difficulty: t('cooking.categories.experimental.recipes.misoCaramel.difficulty'),
          time: t('cooking.categories.experimental.recipes.misoCaramel.time'),
          rating: 5,
          tags: ['Dessert', 'Fusion', 'Experimenteel']
        },
        {
          name: t('cooking.categories.experimental.recipes.sousVide.name'),
          description: t('cooking.categories.experimental.recipes.sousVide.description'),
          difficulty: t('cooking.categories.experimental.recipes.sousVide.difficulty'),
          time: t('cooking.categories.experimental.recipes.sousVide.time'),
          rating: 4,
          tags: ['Techniek', 'Ontbijt', 'Precisie']
        }
      ]
    },
    {
      icon: <Utensils className="w-12 h-12" />,
      title: t('cooking.categories.traditional.title'),
      description: t('cooking.categories.traditional.description'),
      details: t('cooking.categories.traditional.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🍝',
      color: 'from-yellow-400 to-orange-600',
      recipes: [
        {
          name: t('cooking.categories.traditional.recipes.pasta.name'),
          description: t('cooking.categories.traditional.recipes.pasta.description'),
          difficulty: t('cooking.categories.traditional.recipes.pasta.difficulty'),
          time: t('cooking.categories.traditional.recipes.pasta.time'),
          rating: 5,
          tags: ['Italiaans', 'Pasta', 'Traditioneel']
        },
        {
          name: t('cooking.categories.traditional.recipes.ramen.name'),
          description: t('cooking.categories.traditional.recipes.ramen.description'),
          difficulty: t('cooking.categories.traditional.recipes.ramen.difficulty'),
          time: t('cooking.categories.traditional.recipes.ramen.time'),
          rating: 5,
          tags: ['Japans', 'Ramen', 'Bouillon']
        }
      ]
    },
    {
      icon: <Leaf className="w-12 h-12" />,
      title: t('cooking.categories.vegetarian.title'),
      description: t('cooking.categories.vegetarian.description'),
      details: t('cooking.categories.vegetarian.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🌱',
      color: 'from-green-400 to-teal-600',
      recipes: [
        {
          name: t('cooking.categories.vegetarian.recipes.jackfruit.name'),
          description: t('cooking.categories.vegetarian.recipes.jackfruit.description'),
          difficulty: t('cooking.categories.vegetarian.recipes.jackfruit.difficulty'),
          time: t('cooking.categories.vegetarian.recipes.jackfruit.time'),
          rating: 4,
          tags: ['Vegan', 'BBQ', 'Jackfruit']
        },
        {
          name: t('cooking.categories.vegetarian.recipes.cashewCheese.name'),
          description: t('cooking.categories.vegetarian.recipes.cashewCheese.description'),
          difficulty: t('cooking.categories.vegetarian.recipes.cashewCheese.difficulty'),
          time: t('cooking.categories.vegetarian.recipes.cashewCheese.time'),
          rating: 5,
          tags: ['Vegan', 'Kaas', 'Fermentatie']
        }
      ]
    },
    {
      icon: <Star className="w-12 h-12" />,
      title: t('cooking.categories.special.title'),
      description: t('cooking.categories.special.description'),
      details: t('cooking.categories.special.details', { returnObjects: true }) as string[],
      photoPlaceholder: '🎉',
      color: 'from-purple-400 to-pink-600',
      recipes: [
        {
          name: t('cooking.categories.special.recipes.lavaCake.name'),
          description: t('cooking.categories.special.recipes.lavaCake.description'),
          difficulty: t('cooking.categories.special.recipes.lavaCake.difficulty'),
          time: t('cooking.categories.special.recipes.lavaCake.time'),
          rating: 5,
          tags: ['Dessert', 'Chocolade', 'Romantisch']
        },
        {
          name: t('cooking.categories.special.recipes.wellington.name'),
          description: t('cooking.categories.special.recipes.wellington.description'),
          difficulty: t('cooking.categories.special.recipes.wellington.difficulty'),
          time: t('cooking.categories.special.recipes.wellington.time'),
          rating: 5,
          tags: ['Vlees', 'Feestelijk', 'Klassiek']
        }
      ]
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: t('cooking.categories.quick.title'),
      description: t('cooking.categories.quick.description'),
      details: t('cooking.categories.quick.details', { returnObjects: true }) as string[],
      photoPlaceholder: '⚡',
      color: 'from-blue-400 to-cyan-600',
      recipes: [
        {
          name: t('cooking.categories.quick.recipes.onePot.name'),
          description: t('cooking.categories.quick.recipes.onePot.description'),
          difficulty: t('cooking.categories.quick.recipes.onePot.difficulty'),
          time: t('cooking.categories.quick.recipes.onePot.time'),
          rating: 4,
          tags: ['Snel', 'One-pot', 'Pasta']
        },
        {
          name: t('cooking.categories.quick.recipes.stirFry.name'),
          description: t('cooking.categories.quick.recipes.stirFry.description'),
          difficulty: t('cooking.categories.quick.recipes.stirFry.difficulty'),
          time: t('cooking.categories.quick.recipes.stirFry.time'),
          rating: 4,
          tags: ['Wok', 'Vegetarisch', 'Snel']
        }
      ]
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    const easy = t('cooking.difficulty.easy');
    const medium = t('cooking.difficulty.medium');
    const advanced = t('cooking.difficulty.advanced');
    
    switch (difficulty) {
      case easy: return 'bg-green-500/20 text-green-400';
      case medium: return 'bg-yellow-500/20 text-yellow-400';
      case advanced: return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen pt-20 bg-dark-bg">
      <div className="container-custom px-4 py-8">
        
        {/* Header */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="flex items-center mb-8">
            <Link
              to="/interests"
              className="mr-4 p-2 rounded-full bg-dark-secondary/50 border border-white/10 hover:border-neon-green/50 transition-all duration-300"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                👨‍🍳 {t('cooking.title')}
              </h1>
              <p className="text-lg text-white/80 max-w-3xl leading-relaxed">
                {t('cooking.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Cooking Categories Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {cookingCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-neon-green/50 transition-all duration-300 group"
              >
                {/* Photo Section */}
                <div className="h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border-b border-white/10">
                  <div className="text-center">
                    <div className="text-6xl mb-4">{category.photoPlaceholder}</div>
                    <p className="text-white/60 text-sm">{t('cooking.photoPlaceholder')} {category.title}</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${category.color} mr-4 group-hover:scale-110 transition-transform duration-300`}>
                      {category.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {category.title}
                    </h3>
                  </div>
                  
                  <p className="text-white/70 mb-4 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {category.details.map((detail) => (
                      <span
                        key={detail}
                        className="px-3 py-1 bg-neon-green/20 text-neon-green rounded-full text-sm font-medium border border-neon-green/30"
                      >
                        {detail}
                      </span>
                    ))}
                  </div>

                  {/* Recipes List */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-white mb-3">{t('cooking.featuredRecipes')}</h4>
                    {category.recipes.map((recipe, recipeIndex) => (
                      <div key={recipeIndex} className="bg-dark-bg/50 rounded-lg p-4 border border-white/5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h5 className="font-medium text-white mb-1">{recipe.name}</h5>
                            <p className="text-white/60 text-sm mb-2">{recipe.description}</p>
                          </div>
                          <div className="flex items-center space-x-1 ml-4">
                            {renderStars(recipe.rating)}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4 text-white/60" />
                              <span className="text-white/70">{recipe.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4 text-white/60" />
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                                {recipe.difficulty}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {recipe.tags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-white/10 text-white/70 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Philosophy Section */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              {t('cooking.philosophy.title')}
            </h2>
            <p className="text-lg text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
              {t('cooking.philosophy.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🌿</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('cooking.philosophyCards.fresh.title')}</h3>
                <p className="text-white/70">{t('cooking.philosophyCards.fresh.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('cooking.philosophyCards.creativity.title')}</h3>
                <p className="text-white/70">{t('cooking.philosophyCards.creativity.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10">
                <div className="text-4xl mb-4">❤️</div>
                <h3 className="text-xl font-bold text-neon-green mb-3">{t('cooking.philosophyCards.love.title')}</h3>
                <p className="text-white/70">{t('cooking.philosophyCards.love.description')}</p>
              </div>
            </div>
          </div>

          {/* Cooking Techniques */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              {t('cooking.techniques.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Flame className="w-8 h-8 text-neon-red mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cooking.techniques.grilling.title')}</h3>
                <p className="text-white/70 text-sm">{t('cooking.techniques.grilling.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Utensils className="w-8 h-8 text-neon-blue mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cooking.techniques.knifeSkills.title')}</h3>
                <p className="text-white/70 text-sm">{t('cooking.techniques.knifeSkills.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Leaf className="w-8 h-8 text-neon-green mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cooking.techniques.fermentation.title')}</h3>
                <p className="text-white/70 text-sm">{t('cooking.techniques.fermentation.description')}</p>
              </div>
              <div className="bg-dark-secondary/30 rounded-lg p-6 border border-white/10 text-center">
                <Zap className="w-8 h-8 text-neon-purple mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">{t('cooking.techniques.molecular.title')}</h3>
                <p className="text-white/70 text-sm">{t('cooking.techniques.molecular.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
