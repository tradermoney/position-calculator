import { PyramidParams, PyramidResult, PyramidLayer } from './types';

export function calculatePyramidPlan(params: PyramidParams): PyramidResult {
  const {
    side,
    leverage,
    initialPrice,
    initialQuantity,
    layers,
    strategy,
    priceChangePercent,
    geometricMultiplier = 1.5
  } = params;

  if (layers < 2 || layers > 10) {
    throw new Error('加仓层数必须在2-10之间');
  }

  if (priceChangePercent <= 0 || priceChangePercent > 50) {
    throw new Error('价格变化幅度必须在0.1%-50%之间');
  }

  const pyramidLayers: PyramidLayer[] = [];
  let cumulativeQuantity = 0;
  let cumulativeMargin = 0;

  for (let i = 0; i < layers; i++) {
    const level = i + 1;

    // 计算价格
    let price: number;
    if (i === 0) {
      price = initialPrice;
    } else {
      const priceMultiplier = side === 'long'
        ? 1 - (priceChangePercent / 100)
        : 1 + (priceChangePercent / 100);
      price = initialPrice * Math.pow(priceMultiplier, i);
    }

    // 计算数量
    let quantity: number;
    if (i === 0) {
      quantity = initialQuantity;
    } else {
      if (strategy === 'geometric') {
        quantity = initialQuantity * Math.pow(geometricMultiplier, i);
      } else { // double_down
        quantity = initialQuantity * Math.pow(2, i);
      }
    }

    // 计算保证金
    const margin = (price * quantity) / leverage;

    // 累计数据
    cumulativeQuantity += quantity;
    cumulativeMargin += margin;

    // 计算平均价格
    const averagePrice = pyramidLayers.reduce((sum, layer) => sum + layer.price * layer.quantity, 0) + price * quantity;
    const avgPrice = averagePrice / cumulativeQuantity;

    // 计算爆仓价格
    const maintenanceMarginRate = 0.005;
    let liquidationPrice: number;
    if (side === 'long') {
      liquidationPrice = avgPrice * (1 - 1/leverage + maintenanceMarginRate);
    } else {
      liquidationPrice = avgPrice * (1 + 1/leverage - maintenanceMarginRate);
    }

    // 计算价格变化
    const priceChange = i === 0 ? 0 : ((price - initialPrice) / initialPrice) * 100;

    pyramidLayers.push({
      level,
      price,
      quantity,
      margin,
      cumulativeQuantity,
      cumulativeMargin,
      averagePrice: avgPrice,
      liquidationPrice,
      priceChange
    });
  }

  const finalLayer = pyramidLayers[pyramidLayers.length - 1];
  const maxDrawdown = Math.abs(finalLayer.priceChange);

  return {
    layers: pyramidLayers,
    totalQuantity: finalLayer.cumulativeQuantity,
    totalMargin: finalLayer.cumulativeMargin,
    finalAveragePrice: finalLayer.averagePrice,
    finalLiquidationPrice: finalLayer.liquidationPrice,
    maxDrawdown
  };
}
