import { Product } from '@/data/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Lock } from 'lucide-react';
import { useUIStore } from '@/store/useStore';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { setSelectedProduct, setProductModalOpen } = useUIStore();

  const isUnavailable = !product.isActive;
  const isControlled = (product as any).is_controlled;
  const requiresRecipe = (product as any).requires_recipe;
  const activeIngredient = (product as any).active_ingredient;

  const handleClick = () => {
    if (isUnavailable) return;
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  if (isUnavailable) {
    console.log(`💊 Medicamento ${product.id} (${product.name}) está INDISPONÍVEL`);
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  const getPrice = () => {
    return (product as any).price || 0;
  };

  const getAlertType = () => {
    if (isControlled) return 'Tarja Preta';
    if (requiresRecipe) return 'Tarja Vermelha';
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={
        "card-product group relative " +
        (isUnavailable ? "cursor-not-allowed" : "cursor-pointer")
      }
      onClick={handleClick}
    >
      {/* Overlay para produtos inativos */}
      {isUnavailable && (
        <div className="absolute inset-0 bg-black/15 rounded-xl flex flex-col items-center justify-center z-10 group-hover:bg-black/20 transition-all duration-300">
          <AlertCircle className="w-10 h-10 text-red-500 mb-1.5" />
          <div className="text-center">
            <p className="text-white font-bold text-sm">Medicamento</p>
            <p className="text-white font-bold text-sm">indisponível</p>
          </div>
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 p-4 pb-0">
        {isControlled && (
          <Badge variant="destructive" className="gap-1.5 bg-red-600 hover:bg-red-700">
            <Lock className="w-3 h-3" />
            Tarja Preta
          </Badge>
        )}
        {requiresRecipe && !isControlled && (
          <Badge className="gap-1.5 bg-amber-600 hover:bg-amber-700">
            <AlertTriangle className="w-3 h-3" />
            Tarja Vermelha
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-foreground mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {activeIngredient && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
            🧪 Ativo: {activeIngredient}
          </p>
        )}
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">
            {formatPrice(getPrice())}
          </span>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover:bg-primary/10"
            disabled={isUnavailable}
          >
            {isUnavailable ? "Indisponível" : "Detalhes"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

