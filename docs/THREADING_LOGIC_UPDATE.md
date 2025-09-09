# 螺纹报价逻辑调整说明

## 调整内容

### 1. 管板材质验证规则调整

**调整前：**
- 所有螺纹报价都需要验证管板材质

**调整后：**
- ABS材质：需要验证管板材质
- 非ABS材质：不需要验证管板材质

### 2. 孔数范围检查移除

**调整前：**
- 螺纹报价需要检查孔数是否在范围内

**调整后：**
- 螺纹报价不再检查孔数范围
- 只要有螺纹类别和孔径规格即可匹配价格

## 具体影响

### API 接口变化

**价格匹配逻辑 (`/api/quotes/price-match.ts`)**

```javascript
// 调整后的匹配条件
if (materialDescription === 'ABS' && tubePlateMaterial) {
  // 只有ABS材质才验证管板材质
  threadingConditions.push(eq(priceItems.material, tubePlateMaterial));
}
// 移除了孔数范围检查
```

### 前端调用变化

**创建报价页面 (`pages/quotes/create.tsx`)**

```javascript
// 调整后的参数
threadingParams: formData.threadCategory && formData.threadSpecification ? {
  threadCategory: formData.threadCategory,
  materialDescription: formData.materialDescription,
  tubePlateMaterial: formData.tubePlateMaterial,
  holeSpecification: parseFloat(formData.threadSpecification),
  category3: formData.category3
  // 移除了 holeCount 参数
} : null
```

## 业务逻辑说明

### 匹配优先级

1. **螺纹类别**：螺纹盲孔 / 螺纹通孔 （必须匹配）
2. **物料描述**：ABS / 非ABS （必须匹配）
3. **孔径规格**：在数据库定义的孔径范围内 （必须匹配）
4. **类别三**：尖底 / 平底 （必须匹配）
5. **管板材质**：仅在 ABS 材质时验证 （条件匹配）

### 示例对比

**场景1：非ABS材质螺纹加工**
```
调整前：需要匹配 材质描述 + 管板材质 + 孔径 + 孔数范围 + 类别三
调整后：需要匹配 材质描述 + 孔径 + 类别三 （跳过管板材质和孔数）
```

**场景2：ABS材质螺纹加工** 
```
调整前：需要匹配 材质描述 + 管板材质 + 孔径 + 孔数范围 + 类别三
调整后：需要匹配 材质描述 + 管板材质 + 孔径 + 类别三 （跳过孔数）
```

## 预期效果

1. **提高匹配成功率**：移除孔数限制后，更容易找到匹配的价格记录
2. **简化非ABS流程**：非ABS材质不再需要考虑管板材质，匹配更灵活
3. **保持ABS精确性**：ABS材质仍然保持对管板材质的验证
4. **用户体验优化**：减少因参数过多导致的匹配失败

这些调整使得螺纹报价逻辑更加符合实际业务需求，提高了自动定价的准确性和可用性。
